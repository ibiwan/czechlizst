import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const inputArg = process.argv[2];
const outputArg = process.argv[3];

if (!inputArg) {
  console.error('Usage: node scripts/convert-backup-to-current-json.mjs <path-to-backup.json> [output-path]');
  process.exit(1);
}

const inputPath = resolve(process.cwd(), inputArg);
const outputPath = resolve(process.cwd(), outputArg || 'reboot-current-app.json');
const raw = readFileSync(inputPath, 'utf8');
const parsed = JSON.parse(raw);

if (!parsed || typeof parsed !== 'object') {
  console.error('Invalid JSON input file');
  process.exit(1);
}

const sourceData = parsed.data ? parsed.data : parsed;

if (!sourceData || typeof sourceData !== 'object') {
  console.error('No data field found in source JSON');
  process.exit(1);
}

const data = { ...sourceData };

if (!Array.isArray(data.task_relations) && Array.isArray(data.task_blockers)) {
  data.task_relations = data.task_blockers.map((row) => ({
    ...row,
    related_task_id: row.blocking_task_id,
    relation_type: 'blocked_by',
    commentary: row.commentary ?? null
  }));
  delete data.task_blockers;
}

const normalized = {
  meta: {
    convertedAt: new Date().toISOString(),
    source: inputPath
  },
  data
};

writeFileSync(outputPath, JSON.stringify(normalized, null, 2));
console.log(`Converted ${inputPath} to ${outputPath}`);
console.log('Now import into reboot with:`npm run db:import:current-json --prefix rebuilds/anchor-task-reboot -- <output-path>`');
