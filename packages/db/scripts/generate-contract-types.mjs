import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const schemaPath = resolve(__dirname, '../prisma/schema.prisma');
const outputTsPath = resolve(
  __dirname,
  '../../contracts/src/generated/prisma-types.ts'
);
const outputDtsPath = resolve(
  __dirname,
  '../../contracts/src/generated/prisma-types.d.ts'
);
const outputZodMjsPath = resolve(
  __dirname,
  '../../contracts/src/generated/prisma-zod.mjs'
);
const outputZodCjsPath = resolve(
  __dirname,
  '../../contracts/src/generated/prisma-zod.cjs'
);
const outputZodDtsPath = resolve(
  __dirname,
  '../../contracts/src/generated/prisma-zod.d.ts'
);
const outputClassesMjsPath = resolve(
  __dirname,
  '../../contracts/src/generated/prisma-classes.mjs'
);
const outputClassesCjsPath = resolve(
  __dirname,
  '../../contracts/src/generated/prisma-classes.cjs'
);
const outputClassesDtsPath = resolve(
  __dirname,
  '../../contracts/src/generated/prisma-classes.d.ts'
);

const SCALAR_TYPE_MAP = {
  String: 'string',
  Int: 'number',
  BigInt: 'number',
  Float: 'number',
  Decimal: 'number',
  Boolean: 'boolean',
  DateTime: 'string',
  Json: 'unknown',
  Bytes: 'string'
};

function pascalToRowType(name) {
  return `${name}Row`;
}

function pascalToRowSchema(name) {
  return `${name}RowSchema`;
}

function toTsType(prismaType, isList, isOptional, enumTypeMap) {
  const baseType = SCALAR_TYPE_MAP[prismaType] ?? enumTypeMap[prismaType] ?? 'unknown';
  const listType = isList ? `${baseType}[]` : baseType;
  return isOptional ? `${listType} | null` : listType;
}

function parseEnums(schemaText) {
  const enumTypeMap = {};
  const enums = [];
  const enumRegex = /enum\s+(\w+)\s*\{([\s\S]*?)\n\}/g;

  let enumMatch;
  while ((enumMatch = enumRegex.exec(schemaText)) !== null) {
    const [, enumName, enumBody] = enumMatch;
    const values = enumBody
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith('//') && !line.startsWith('@@'))
      .map((line) => line.split(/\s+/)[0])
      .filter(Boolean);

    if (values.length > 0) {
      enumTypeMap[enumName] = values.map((value) => `'${value}'`).join(' | ');
      enums.push({ name: enumName, values });
    }
  }

  return { enumTypeMap, enums };
}

function parseModels(schemaText, enumTypeMap) {
  const models = [];
  const modelRegex = /model\s+(\w+)\s*\{([\s\S]*?)\n\}/g;

  let modelMatch;
  while ((modelMatch = modelRegex.exec(schemaText)) !== null) {
    const [, modelName, modelBody] = modelMatch;
    const fields = [];

    for (const rawLine of modelBody.split('\n')) {
      const line = rawLine.trim();
      if (!line || line.startsWith('//') || line.startsWith('@@')) {
        continue;
      }

      const fieldMatch = line.match(/^([A-Za-z_]\w*)\s+([A-Za-z_]\w*)(\?)?(\[\])?\s*(.*)$/);
      if (!fieldMatch) {
        continue;
      }

      const [, fieldName, fieldType, optionalToken, listToken, remainder] = fieldMatch;
      const mapMatch = remainder.match(/@map\(\"([^\"]+)\"\)/);
      const dbName = mapMatch ? mapMatch[1] : fieldName;
      const isScalarOrEnum =
        Object.prototype.hasOwnProperty.call(SCALAR_TYPE_MAP, fieldType) ||
        Object.prototype.hasOwnProperty.call(enumTypeMap, fieldType);
      const isRelation = remainder.includes('@relation');

      if (!isScalarOrEnum || isRelation) {
        continue;
      }

      fields.push({
        name: fieldName,
        dbName,
        fieldType,
        isOptional: Boolean(optionalToken),
        isList: Boolean(listToken),
        tsType: toTsType(
          fieldType,
          Boolean(listToken),
          Boolean(optionalToken),
          enumTypeMap
        )
      });
    }

    models.push({ name: modelName, fields });
  }

  return models;
}

function render(models) {
  const lines = [
    '// AUTO-GENERATED FILE. DO NOT EDIT MANUALLY.',
    '// Source: packages/db/prisma/schema.prisma',
    ''
  ];

  for (const model of models) {
    lines.push(`export type ${pascalToRowType(model.name)} = {`);
    for (const field of model.fields) {
      lines.push(`  ${field.name}: ${field.tsType};`);
    }
    lines.push('};', '');
  }

  lines.push('export type PrismaRowModels = {');
  for (const model of models) {
    lines.push(`  ${model.name}: ${pascalToRowType(model.name)};`);
  }
  lines.push('};', '');

  return lines.join('\n');
}

function renderClassesMjs(models) {
  const lines = [
    '// AUTO-GENERATED FILE. DO NOT EDIT MANUALLY.',
    '// Source: packages/db/prisma/schema.prisma',
    ''
  ];

  for (const model of models) {
    const rowClassName = `${model.name}RowModel`;
    const postgrestClassName = `${model.name}PostgrestRow`;

    lines.push(`export class ${rowClassName} {`);
    lines.push('  constructor(data) {');
    for (const field of model.fields) {
      lines.push(`    this.${field.name} = data.${field.name};`);
    }
    lines.push('  }');
    lines.push('}', '');

    lines.push(`export class ${postgrestClassName} {`);
    lines.push('  constructor(data) {');
    for (const field of model.fields) {
      lines.push(`    this.${field.dbName} = data.${field.dbName};`);
    }
    lines.push('  }');
    lines.push('}', '');
  }

  return lines.join('\n');
}

function renderClassesCjs(models) {
  const mjs = renderClassesMjs(models);
  return (
    mjs
      .replace(/export class /g, 'class ')
      .replace(/\nexport class /g, '\nclass ') +
    `\nmodule.exports = {\n${models
      .flatMap((model) => [
        `  ${model.name}RowModel`,
        `  ${model.name}PostgrestRow`
      ])
      .join(',\n')}\n};\n`
  );
}

function renderClassesDts(models) {
  const lines = [
    '// AUTO-GENERATED FILE. DO NOT EDIT MANUALLY.',
    '// Source: packages/db/prisma/schema.prisma',
    ''
  ];

  for (const model of models) {
    const rowClassName = `${model.name}RowModel`;
    const postgrestClassName = `${model.name}PostgrestRow`;
    const rowDataName = `${model.name}RowModelData`;
    const postgrestDataName = `${model.name}PostgrestRowData`;

    lines.push(`export type ${rowDataName} = {`);
    for (const field of model.fields) {
      lines.push(`  ${field.name}: ${field.tsType};`);
    }
    lines.push('};', '');

    lines.push(`export declare class ${rowClassName} {`);
    lines.push(`  constructor(data: ${rowDataName});`);
    for (const field of model.fields) {
      lines.push(`  ${field.name}: ${field.tsType};`);
    }
    lines.push('}', '');

    lines.push(`export type ${postgrestDataName} = {`);
    for (const field of model.fields) {
      lines.push(`  ${field.dbName}: ${field.tsType};`);
    }
    lines.push('};', '');

    lines.push(`export declare class ${postgrestClassName} {`);
    lines.push(`  constructor(data: ${postgrestDataName});`);
    for (const field of model.fields) {
      lines.push(`  ${field.dbName}: ${field.tsType};`);
    }
    lines.push('}', '');
  }

  return lines.join('\n');
}

function scalarToZod(prismaType) {
  switch (prismaType) {
    case 'String':
      return 'z.string()';
    case 'Int':
      return 'z.number().int()';
    case 'BigInt':
      return 'z.number()';
    case 'Float':
      return 'z.number()';
    case 'Decimal':
      return 'z.number()';
    case 'Boolean':
      return 'z.boolean()';
    case 'DateTime':
      return 'z.string().datetime()';
    case 'Json':
      return 'z.unknown()';
    case 'Bytes':
      return 'z.string()';
    default:
      return null;
  }
}

function toZodExpr(fieldType, isList, isOptional, enumNames) {
  const base = scalarToZod(fieldType) ?? (enumNames.has(fieldType) ? `${fieldType}Schema` : 'z.unknown()');
  const list = isList ? `z.array(${base})` : base;
  return isOptional ? `${list}.nullable()` : list;
}

function renderZodMjs(models, enums) {
  const enumNames = new Set(enums.map((entry) => entry.name));
  const lines = [
    '// AUTO-GENERATED FILE. DO NOT EDIT MANUALLY.',
    '// Source: packages/db/prisma/schema.prisma',
    '',
    "import { z } from 'zod';",
    ''
  ];

  for (const entry of enums) {
    const values = entry.values.map((value) => `'${value}'`).join(', ');
    lines.push(`export const ${entry.name}Schema = z.enum([${values}]);`, '');
  }

  for (const model of models) {
    lines.push(`export const ${pascalToRowSchema(model.name)} = z.object({`);
    for (const field of model.fields) {
      lines.push(
        `  ${field.name}: ${toZodExpr(
          field.fieldType,
          field.isList,
          field.isOptional,
          enumNames
        )},`
      );
    }
    lines.push('});', '');
  }

  lines.push('export const PrismaRowSchemas = {');
  for (const model of models) {
    lines.push(`  ${model.name}: ${pascalToRowSchema(model.name)},`);
  }
  lines.push('};', '');

  return lines.join('\n');
}

function renderZodCjs(models, enums) {
  const mjs = renderZodMjs(models, enums);
  return mjs.replace("import { z } from 'zod';", "const { z } = require('zod');").replace(
    /export const /g,
    'const '
  ) + `\nmodule.exports = {\n${[
    ...enums.map((entry) => `  ${entry.name}Schema`),
    ...models.map((model) => `  ${pascalToRowSchema(model.name)}`),
    '  PrismaRowSchemas'
  ].join(',\n')}\n};\n`;
}

function renderZodDts(models, enums) {
  const lines = [
    '// AUTO-GENERATED FILE. DO NOT EDIT MANUALLY.',
    '// Source: packages/db/prisma/schema.prisma',
    '',
    "import { z } from 'zod';",
    ''
  ];

  for (const entry of enums) {
    const values = entry.values.map((value) => `'${value}'`).join(', ');
    lines.push(`export declare const ${entry.name}Schema: z.ZodEnum<[${values}]>;`, '');
  }

  for (const model of models) {
    lines.push(
      `export declare const ${pascalToRowSchema(model.name)}: z.ZodType<${pascalToRowType(
        model.name
      )}>;`
    );
  }

  lines.push('', 'export declare const PrismaRowSchemas: {');
  for (const model of models) {
    lines.push(`  ${model.name}: typeof ${pascalToRowSchema(model.name)};`);
  }
  lines.push('};', '', "export type {");
  for (const model of models) {
    lines.push(`  ${pascalToRowType(model.name)},`);
  }
  lines.push("} from './prisma-types';", '');

  return lines.join('\n');
}

const schema = readFileSync(schemaPath, 'utf8');
const { enumTypeMap, enums } = parseEnums(schema);
const models = parseModels(schema, enumTypeMap);
const output = render(models);
const zodOutputMjs = renderZodMjs(models, enums);
const zodOutputCjs = renderZodCjs(models, enums);
const zodOutputDts = renderZodDts(models, enums);
const classesOutputMjs = renderClassesMjs(models);
const classesOutputCjs = renderClassesCjs(models);
const classesOutputDts = renderClassesDts(models);

mkdirSync(dirname(outputTsPath), { recursive: true });
writeFileSync(outputTsPath, output, 'utf8');
writeFileSync(outputDtsPath, output, 'utf8');
writeFileSync(outputZodMjsPath, zodOutputMjs, 'utf8');
writeFileSync(outputZodCjsPath, zodOutputCjs, 'utf8');
writeFileSync(outputZodDtsPath, zodOutputDts, 'utf8');
writeFileSync(outputClassesMjsPath, classesOutputMjs, 'utf8');
writeFileSync(outputClassesCjsPath, classesOutputCjs, 'utf8');
writeFileSync(outputClassesDtsPath, classesOutputDts, 'utf8');

console.log(`Generated ${outputTsPath}`);
console.log(`Generated ${outputDtsPath}`);
console.log(`Generated ${outputZodMjsPath}`);
console.log(`Generated ${outputZodCjsPath}`);
console.log(`Generated ${outputZodDtsPath}`);
console.log(`Generated ${outputClassesMjsPath}`);
console.log(`Generated ${outputClassesCjsPath}`);
console.log(`Generated ${outputClassesDtsPath}`);
