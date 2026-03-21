// AUTO-GENERATED FILE. DO NOT EDIT MANUALLY.
// Source: packages/db/prisma/schema.prisma

const { z } = require('zod');
import {
  WorkStatusSchema,
  ProjectRowSchema,
  TaskRowSchema,
  TaskBlockerRowSchema,
  ProjectNoteRowSchema,
  TaskNoteRowSchema,
} = require('./prisma-zod.cjs');

const projectSchema = ProjectRowSchema;
const taskSchema = TaskRowSchema;
const taskBlockerSchema = TaskBlockerRowSchema;
const projectNoteSchema = ProjectNoteRowSchema;
const taskNoteSchema = TaskNoteRowSchema;

function normalizePostgrestTimestamp(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    throw new Error(`Invalid PostgREST timestamp: ${value}`);
  }

  return date.toISOString();
}

const postgrestProjectRowSchema = z.object({
  id: z.number().int().positive(),
  name: z.string().min(1),
  status: WorkStatusSchema,
  created_at: z.string().min(1),
  updated_at: z.string().min(1).optional(),
});

const postgrestProjectRowsSchema = z.array(postgrestProjectRowSchema);

const listProjectsResponseSchema = z.object({
  projects: z.array(projectSchema)
});

const createProjectResponseSchema = z.object({
  project: projectSchema
});

function projectFromPostgrestRow(row) {
  const createdAt = normalizePostgrestTimestamp(row.created_at);
  return projectSchema.parse({
    id: row.id,
    name: row.name,
    status: row.status,
    createdAt: normalizePostgrestTimestamp(row.created_at),
    updatedAt: row.updated_at ? normalizePostgrestTimestamp(row.updated_at) : createdAt,
  });
}

function parsePostgrestListProjectsResponse(input) {
  const rows = postgrestProjectRowsSchema.parse(input);
  return listProjectsResponseSchema.parse({
    projects: rows.map(projectFromPostgrestRow)
  });
}

function parsePostgrestCreateProjectResponse(input) {
  const rows = postgrestProjectRowsSchema.parse(input);
  if (rows.length === 0) {
    throw new Error('Expected PostgREST create project response to include one row');
  }
  return createProjectResponseSchema.parse({
    project: projectFromPostgrestRow(rows[0])
  });
}

const postgrestTaskRowSchema = z.object({
  id: z.number().int().positive(),
  project_id: z.number().int().positive(),
  title: z.string().min(1),
  status: WorkStatusSchema,
  created_at: z.string().min(1),
  updated_at: z.string().min(1).optional(),
});

const postgrestTaskRowsSchema = z.array(postgrestTaskRowSchema);

const listTasksResponseSchema = z.object({
  tasks: z.array(taskSchema)
});

const createTaskResponseSchema = z.object({
  task: taskSchema
});

function taskFromPostgrestRow(row) {
  const createdAt = normalizePostgrestTimestamp(row.created_at);
  return taskSchema.parse({
    id: row.id,
    projectId: row.project_id,
    title: row.title,
    status: row.status,
    createdAt: normalizePostgrestTimestamp(row.created_at),
    updatedAt: row.updated_at ? normalizePostgrestTimestamp(row.updated_at) : createdAt,
  });
}

function parsePostgrestListTasksResponse(input) {
  const rows = postgrestTaskRowsSchema.parse(input);
  return listTasksResponseSchema.parse({
    tasks: rows.map(taskFromPostgrestRow)
  });
}

function parsePostgrestCreateTaskResponse(input) {
  const rows = postgrestTaskRowsSchema.parse(input);
  if (rows.length === 0) {
    throw new Error('Expected PostgREST create task response to include one row');
  }
  return createTaskResponseSchema.parse({
    task: taskFromPostgrestRow(rows[0])
  });
}

const postgrestTaskBlockerRowSchema = z.object({
  id: z.number().int().positive(),
  task_id: z.number().int().positive(),
  blocking_task_id: z.number().int().positive(),
  created_at: z.string().min(1),
  updated_at: z.string().min(1).optional(),
});

const postgrestTaskBlockerRowsSchema = z.array(postgrestTaskBlockerRowSchema);

const listTaskBlockersResponseSchema = z.object({
  taskBlockers: z.array(taskBlockerSchema)
});

const createTaskBlockerResponseSchema = z.object({
  taskBlocker: taskBlockerSchema
});

function taskBlockerFromPostgrestRow(row) {
  const createdAt = normalizePostgrestTimestamp(row.created_at);
  return taskBlockerSchema.parse({
    id: row.id,
    taskId: row.task_id,
    blockingTaskId: row.blocking_task_id,
    createdAt: normalizePostgrestTimestamp(row.created_at),
    updatedAt: row.updated_at ? normalizePostgrestTimestamp(row.updated_at) : createdAt,
  });
}

function parsePostgrestListTaskBlockersResponse(input) {
  const rows = postgrestTaskBlockerRowsSchema.parse(input);
  return listTaskBlockersResponseSchema.parse({
    taskBlockers: rows.map(taskBlockerFromPostgrestRow)
  });
}

function parsePostgrestCreateTaskBlockerResponse(input) {
  const rows = postgrestTaskBlockerRowsSchema.parse(input);
  if (rows.length === 0) {
    throw new Error('Expected PostgREST create taskblocker response to include one row');
  }
  return createTaskBlockerResponseSchema.parse({
    taskBlocker: taskBlockerFromPostgrestRow(rows[0])
  });
}

const postgrestProjectNoteRowSchema = z.object({
  id: z.number().int().positive(),
  project_id: z.number().int().positive(),
  body: z.string().min(1),
  reference_url: z.string().min(1).optional(),
  created_at: z.string().min(1),
  updated_at: z.string().min(1).optional(),
});

const postgrestProjectNoteRowsSchema = z.array(postgrestProjectNoteRowSchema);

const listProjectNotesResponseSchema = z.object({
  notes: z.array(projectNoteSchema)
});

const createProjectNoteResponseSchema = z.object({
  note: projectNoteSchema
});

function projectNoteFromPostgrestRow(row) {
  const createdAt = normalizePostgrestTimestamp(row.created_at);
  return projectNoteSchema.parse({
    id: row.id,
    projectId: row.project_id,
    body: row.body,
    referenceUrl: row.reference_url ?? null,
    createdAt: normalizePostgrestTimestamp(row.created_at),
    updatedAt: row.updated_at ? normalizePostgrestTimestamp(row.updated_at) : createdAt,
  });
}

function parsePostgrestListProjectNotesResponse(input) {
  const rows = postgrestProjectNoteRowsSchema.parse(input);
  return listProjectNotesResponseSchema.parse({
    notes: rows.map(projectNoteFromPostgrestRow)
  });
}

function parsePostgrestCreateProjectNoteResponse(input) {
  const rows = postgrestProjectNoteRowsSchema.parse(input);
  if (rows.length === 0) {
    throw new Error('Expected PostgREST create project note response to include one row');
  }
  return createProjectNoteResponseSchema.parse({
    note: projectNoteFromPostgrestRow(rows[0])
  });
}

const postgrestTaskNoteRowSchema = z.object({
  id: z.number().int().positive(),
  task_id: z.number().int().positive(),
  body: z.string().min(1),
  reference_url: z.string().min(1).optional(),
  created_at: z.string().min(1),
  updated_at: z.string().min(1).optional(),
});

const postgrestTaskNoteRowsSchema = z.array(postgrestTaskNoteRowSchema);

const listTaskNotesResponseSchema = z.object({
  notes: z.array(taskNoteSchema)
});

const createTaskNoteResponseSchema = z.object({
  note: taskNoteSchema
});

function taskNoteFromPostgrestRow(row) {
  const createdAt = normalizePostgrestTimestamp(row.created_at);
  return taskNoteSchema.parse({
    id: row.id,
    taskId: row.task_id,
    body: row.body,
    referenceUrl: row.reference_url ?? null,
    createdAt: normalizePostgrestTimestamp(row.created_at),
    updatedAt: row.updated_at ? normalizePostgrestTimestamp(row.updated_at) : createdAt,
  });
}

function parsePostgrestListTaskNotesResponse(input) {
  const rows = postgrestTaskNoteRowsSchema.parse(input);
  return listTaskNotesResponseSchema.parse({
    notes: rows.map(taskNoteFromPostgrestRow)
  });
}

function parsePostgrestCreateTaskNoteResponse(input) {
  const rows = postgrestTaskNoteRowsSchema.parse(input);
  if (rows.length === 0) {
    throw new Error('Expected PostgREST create task note response to include one row');
  }
  return createTaskNoteResponseSchema.parse({
    note: taskNoteFromPostgrestRow(rows[0])
  });
}

module.exports = {
  projectSchema,
  postgrestProjectRowSchema,
  postgrestProjectRowsSchema,
  listProjectsResponseSchema,
  createProjectResponseSchema,
  projectFromPostgrestRow,
  parsePostgrestListProjectsResponse,
  parsePostgrestCreateProjectResponse,
  taskSchema,
  postgrestTaskRowSchema,
  postgrestTaskRowsSchema,
  listTasksResponseSchema,
  createTaskResponseSchema,
  taskFromPostgrestRow,
  parsePostgrestListTasksResponse,
  parsePostgrestCreateTaskResponse,
  taskBlockerSchema,
  postgrestTaskBlockerRowSchema,
  postgrestTaskBlockerRowsSchema,
  listTaskBlockersResponseSchema,
  createTaskBlockerResponseSchema,
  taskBlockerFromPostgrestRow,
  parsePostgrestListTaskBlockersResponse,
  parsePostgrestCreateTaskBlockerResponse,
  projectNoteSchema,
  postgrestProjectNoteRowSchema,
  postgrestProjectNoteRowsSchema,
  listProjectNotesResponseSchema,
  createProjectNoteResponseSchema,
  projectNoteFromPostgrestRow,
  parsePostgrestListProjectNotesResponse,
  parsePostgrestCreateProjectNoteResponse,
  taskNoteSchema,
  postgrestTaskNoteRowSchema,
  postgrestTaskNoteRowsSchema,
  listTaskNotesResponseSchema,
  createTaskNoteResponseSchema,
  taskNoteFromPostgrestRow,
  parsePostgrestListTaskNotesResponse,
  parsePostgrestCreateTaskNoteResponse
};
