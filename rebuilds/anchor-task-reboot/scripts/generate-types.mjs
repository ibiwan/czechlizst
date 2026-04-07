import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const schemaPath = resolve(process.cwd(), 'prisma/schema.prisma');
const outputPath = resolve(process.cwd(), 'src/types.ts');

const SCALAR_MAP = {
  Int: 'number',
  String: 'string',
  Boolean: 'boolean',
  DateTime: 'string',
  Float: 'number',
  Decimal: 'number',
  BigInt: 'number',
  Json: 'unknown',
  Bytes: 'string'
};

function parseEnums(schemaText) {
  const enums = [];
  const enumRE = /enum\s+(\w+)\s*\{([\s\S]*?)\n\}/g;
  let match;

  while ((match = enumRE.exec(schemaText)) !== null) {
    const name = match[1];
    const body = match[2];
    const values = body
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith('//') && !line.startsWith('@@'))
      .map((line) => line.split(/[\s]/)[0])
      .filter(Boolean);
    if (values.length > 0) {
      enums.push({ name, values });
    }
  }

  return enums;
}

function parseModels(schemaText) {
  const models = [];
  const modelRE = /model\s+(\w+)\s*\{([\s\S]*?)\n\}/g;
  let match;

  while ((match = modelRE.exec(schemaText)) !== null) {
    const name = match[1];
    const body = match[2];
    const fields = [];

    for (const rawLine of body.split('\n')) {
      const line = rawLine.trim();
      if (!line || line.startsWith('//') || line.startsWith('@@')) continue;

      const fieldMatch = line.match(/^([A-Za-z_][A-Za-z0-9_]*)\s+([A-Za-z_][A-Za-z0-9_]*)(\?)?(\[\])?\s*(.*)$/);
      if (!fieldMatch) continue;

      const [, fieldName, fieldType, optionalToken, listToken, remainder] = fieldMatch;
      if (remainder.includes('@relation')) continue;

      const isScalar = Object.prototype.hasOwnProperty.call(SCALAR_MAP, fieldType);
      const isEnum = /enum\s+/.test(fieldType) === false && fieldType && !isScalar;

      if (!isScalar && !isEnum) continue;

      let tsType = SCALAR_MAP[fieldType] ?? fieldType;
      if (listToken) tsType = `${tsType}[]`;
      if (optionalToken) tsType = `${tsType} | null`;

      fields.push({ fieldName, tsType });
    }

    if (fields.length > 0) {
      models.push({ name, fields });
    }
  }

  return models;
}

function render(types) {
  const lines = [
    '// AUTO-GENERATED FILE. DO NOT EDIT MANUALLY.',
    '// Source: prisma/schema.prisma',
    ''
  ];

  for (const enumInfo of types.enums) {
    const values = enumInfo.values.map((v) => `'${v}'`).join(' | ');
    lines.push(`export type ${enumInfo.name} = ${values};`, '');
  }

  for (const model of types.models) {
    lines.push(`export type ${model.name} = {`);
    for (const field of model.fields) {
      lines.push(`  ${field.fieldName}: ${field.tsType};`);
    }
    lines.push('};', '');
  }

  return lines.join('\n');
}

try {
  const schemaText = readFileSync(schemaPath, 'utf8');
  const enums = parseEnums(schemaText);
  const models = parseModels(schemaText);
  const output = render({ enums, models });
  writeFileSync(outputPath, output, 'utf8');
  console.log(`Generated ${outputPath} from ${schemaPath}`);
} catch (error) {
  console.error(`Failed to generate types from schema: ${error.message}`);
  process.exit(1);
}
