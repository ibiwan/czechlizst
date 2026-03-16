import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { spawnSync } from 'node:child_process';

const inputArg = process.argv[2];

if (!inputArg) {
  console.error('Usage: npm run db:import:json -- <path-to-export.json>');
  process.exit(1);
}

const inputPath = resolve(inputArg);
const raw = readFileSync(inputPath, 'utf8');
const parsed = JSON.parse(raw);
const data = parsed?.data ?? {};
const tables = Object.keys(data);

if (tables.length === 0) {
  console.error('No tables found under "data" in snapshot file.');
  process.exit(1);
}

for (const table of tables) {
  if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(table)) {
    console.error(`Invalid table name in snapshot: ${table}`);
    process.exit(1);
  }
}

function runPsql(sql, label) {
  const args = [
    'exec',
    '-i',
    'postgrest-db',
    'psql',
    '-v',
    'ON_ERROR_STOP=1',
    '-U',
    'app_user',
    '-d',
    'app',
    '-c',
    sql
  ];

  const result = spawnSync('docker', args, {
    stdio: 'inherit',
    shell: process.platform === 'win32'
  });

  if (result.status !== 0) {
    throw new Error(`${label} failed`);
  }
}

try {
  for (const table of tables) {
    runPsql(`TRUNCATE TABLE api."${table}" RESTART IDENTITY CASCADE;`, `truncate ${table}`);
  }

  for (const table of tables) {
    const rows = data[table];
    if (!Array.isArray(rows) || rows.length === 0) {
      continue;
    }

    const payload = JSON.stringify(rows).replace(/'/g, "''");
    const sql = `INSERT INTO api."${table}" SELECT * FROM jsonb_populate_recordset(NULL::api."${table}", '${payload}'::jsonb);`;
    runPsql(sql, `insert ${table}`);

    const syncSeqSql = `
DO $$
DECLARE
  table_name text := '${table}';
  seq_name text;
  max_id bigint;
BEGIN
  seq_name := pg_get_serial_sequence('api.' || quote_ident(table_name), 'id');
  IF seq_name IS NULL THEN
    -- Table doesn't use a serial/identity "id" column.
    NULL;
  ELSE
    EXECUTE format('SELECT COALESCE(MAX(id), 1) FROM api.%I', table_name) INTO max_id;
    EXECUTE format('SELECT setval(%L, %s, true)', seq_name, max_id);
  END IF;
END $$;`.trim();
    runPsql(syncSeqSql, `sync sequence ${table}`);
  }

  console.log(`Imported snapshot from ${inputPath}`);
} catch (error) {
  console.error(`Failed to import snapshot: ${error.message}`);
  process.exit(1);
}
