import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { spawnSync } from 'node:child_process';

const inputArg = process.argv[2];

if (!inputArg) {
  console.error('Usage: npm run db:import:current-json -- <path-to-current-app-export.json>');
  process.exit(1);
}

const inputPath = resolve(process.cwd(), inputArg);
const raw = readFileSync(inputPath, 'utf8');
const parsed = JSON.parse(raw);
const source = { ...(parsed?.data ?? {}) };

const projects = Array.isArray(source.projects) ? source.projects : [];
const tasks = Array.isArray(source.tasks) ? source.tasks : [];
const projectNotes = Array.isArray(source.project_notes) ? source.project_notes : [];
const taskNotes = Array.isArray(source.task_notes) ? source.task_notes : [];

let taskRelations = Array.isArray(source.task_relations) ? source.task_relations : [];
if (taskRelations.length === 0 && Array.isArray(source.task_blockers)) {
  taskRelations = source.task_blockers.map((row) => ({
    ...row,
    related_task_id: row.blocking_task_id,
    relation_type: 'blocked_by',
    commentary: null
  }));
}

function deriveAnchorStatus(projectId) {
  const childTasks = tasks.filter((task) => task.project_id === projectId);
  if (childTasks.some((task) => task.status === 'active')) {
    return 'active';
  }
  if (childTasks.some((task) => task.status === 'started')) {
    return 'started';
  }
  if (childTasks.some((task) => task.status === 'todo')) {
    return 'todo';
  }
  if (childTasks.some((task) => task.status === 'done')) {
    return 'done';
  }
  if (childTasks.some((task) => task.status === 'dropped')) {
    return 'dropped';
  }
  return 'todo';
}

function toIso(value) {
  return value ?? new Date().toISOString();
}

const projectIdToAnchorId = new Map();
const taskIdMap = new Map();

let nextTaskId = 1;

const rebootTasks = [];
for (const project of projects) {
  const anchorId = nextTaskId++;
  projectIdToAnchorId.set(project.id, anchorId);
  rebootTasks.push({
    id: anchorId,
    title: project.name,
    status: deriveAnchorStatus(project.id),
    is_anchor: true,
    parent_task_id: null,
    created_at: toIso(project.created_at),
    updated_at: toIso(project.updated_at ?? project.created_at)
  });
}

for (const task of tasks) {
  const rebootTaskId = nextTaskId++;
  taskIdMap.set(task.id, rebootTaskId);
  rebootTasks.push({
    id: rebootTaskId,
    title: task.title,
    status: task.status ?? 'todo',
    is_anchor: null,
    parent_task_id: projectIdToAnchorId.get(task.project_id) ?? null,
    created_at: toIso(task.created_at),
    updated_at: toIso(task.updated_at ?? task.created_at)
  });
}

const rebootNotes = [];
let nextNoteId = 1;

for (const note of projectNotes) {
  const anchorId = projectIdToAnchorId.get(note.project_id);
  if (!anchorId) {
    continue;
  }

  rebootNotes.push({
    id: nextNoteId++,
    task_id: anchorId,
    body: note.body,
    reference_url: note.reference_url ?? null,
    created_at: toIso(note.created_at),
    updated_at: toIso(note.updated_at ?? note.created_at)
  });
}

for (const note of taskNotes) {
  const rebootTaskId = taskIdMap.get(note.task_id);
  if (!rebootTaskId) {
    continue;
  }

  rebootNotes.push({
    id: nextNoteId++,
    task_id: rebootTaskId,
    body: note.body,
    reference_url: note.reference_url ?? null,
    created_at: toIso(note.created_at),
    updated_at: toIso(note.updated_at ?? note.created_at)
  });
}

const rebootRelations = [];
let nextRelationId = 1;

for (const relation of taskRelations) {
  if (!['blocked_by', 'related_to'].includes(relation.relation_type)) {
    continue;
  }

  const taskId = taskIdMap.get(relation.task_id);
  const relatedTaskId = taskIdMap.get(relation.related_task_id);

  if (!taskId || !relatedTaskId || taskId === relatedTaskId) {
    continue;
  }

  rebootRelations.push({
    id: nextRelationId++,
    task_id: taskId,
    related_task_id: relatedTaskId,
    relation_type: relation.relation_type,
    commentary: relation.commentary ?? null,
    created_at: toIso(relation.created_at),
    updated_at: toIso(relation.updated_at ?? relation.created_at)
  });
}

const transformed = {
  tasks: rebootTasks,
  task_notes: rebootNotes,
  task_relations: rebootRelations
};

const orderedTables = ['task_relations', 'task_notes', 'tasks'];

function runPsql(sql, label) {
  const args = [
    'exec',
    '-i',
    'anchor-task-reboot-db',
    'psql',
    '-v',
    'ON_ERROR_STOP=1',
    '-U',
    'app_user',
    '-d',
    'anchor_reboot',
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
  for (const table of orderedTables) {
    runPsql(`TRUNCATE TABLE api."${table}" RESTART IDENTITY CASCADE;`, `truncate ${table}`);
  }

  const disableTriggersSql = ['tasks', 'task_notes', 'task_relations']
    .map((table) => `ALTER TABLE api."${table}" DISABLE TRIGGER USER;`)
    .join('\n');
  runPsql(disableTriggersSql, 'disable triggers');

  try {
    for (const table of ['tasks', 'task_notes', 'task_relations']) {
      const rows = transformed[table];

      if (!Array.isArray(rows) || rows.length === 0) {
        continue;
      }

      const payload = JSON.stringify(rows).replace(/'/g, "''");
      const sql = `INSERT INTO api."${table}" SELECT * FROM jsonb_populate_recordset(NULL::api."${table}", '${payload}'::jsonb);`;
      runPsql(sql, `insert ${table}`);

      const syncSeqSql = `
DO $$
DECLARE
  seq_name text;
  max_id bigint;
BEGIN
  seq_name := pg_get_serial_sequence('api.${table}', 'id');
  IF seq_name IS NOT NULL THEN
    SELECT COALESCE(MAX(id), 1) INTO max_id FROM api."${table}";
    EXECUTE format('SELECT setval(%L, %s, true)', seq_name, max_id);
  END IF;
END $$;`.trim();
      runPsql(syncSeqSql, `sync sequence ${table}`);
    }
  } finally {
    const enableTriggersSql = ['tasks', 'task_notes', 'task_relations']
      .map((table) => `ALTER TABLE api."${table}" ENABLE TRIGGER USER;`)
      .join('\n');
    runPsql(enableTriggersSql, 'enable triggers');
  }

  console.log(`Imported current-app snapshot into reboot DB from ${inputPath}`);
  console.log(
    `Created ${rebootTasks.length} tasks, ${rebootNotes.length} notes, ${rebootRelations.length} relations.`
  );
} catch (error) {
  console.error(`Failed to import current-app snapshot: ${error.message}`);
  process.exit(1);
}
