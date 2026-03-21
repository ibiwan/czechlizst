// AUTO-GENERATED FILE. DO NOT EDIT MANUALLY.
// Source: packages/db/prisma/schema.prisma

import { z } from 'zod';
import {
  WorkStatusSchema,
  ProjectRowSchema,
  TaskRowSchema,
  TaskBlockerRowSchema,
  ProjectNoteRowSchema,
  TaskNoteRowSchema,
} from './prisma-zod.mjs';

export const projectSchema = ProjectRowSchema;
export const taskSchema = TaskRowSchema;
export const taskBlockerSchema = TaskBlockerRowSchema;
export const projectNoteSchema = ProjectNoteRowSchema;
export const taskNoteSchema = TaskNoteRowSchema;

function normalizePostgrestTimestamp(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    throw new Error(`Invalid PostgREST timestamp: ${value}`);
  }

  return date.toISOString();
}

export const postgrestProjectRowSchema = z.object({
  id: z.number().int().positive(),
  name: z.string().min(1),
  status: WorkStatusSchema,
  created_at: z.string().min(1),
  updated_at: z.string().min(1).optional(),
});

export const postgrestProjectRowsSchema = z.array(postgrestProjectRowSchema);

export const listProjectsResponseSchema = z.object({
  projects: z.array(projectSchema)
});

export const createProjectResponseSchema = z.object({
  project: projectSchema
});

export function projectFromPostgrestRow(row) {
  const createdAt = normalizePostgrestTimestamp(row.created_at);
  return projectSchema.parse({
    id: row.id,
    name: row.name,
    status: row.status,
    createdAt: normalizePostgrestTimestamp(row.created_at),
    updatedAt: row.updated_at ? normalizePostgrestTimestamp(row.updated_at) : createdAt,
  });
}

export function parsePostgrestListProjectsResponse(input) {
  const rows = postgrestProjectRowsSchema.parse(input);
  return listProjectsResponseSchema.parse({
    projects: rows.map(projectFromPostgrestRow)
  });
}

export function parsePostgrestCreateProjectResponse(input) {
  const rows = postgrestProjectRowsSchema.parse(input);
  if (rows.length === 0) {
    throw new Error('Expected PostgREST create project response to include one row');
  }
  return createProjectResponseSchema.parse({
    project: projectFromPostgrestRow(rows[0])
  });
}

export const postgrestTaskRowSchema = z.object({
  id: z.number().int().positive(),
  project_id: z.number().int().positive(),
  title: z.string().min(1),
  status: WorkStatusSchema,
  created_at: z.string().min(1),
  updated_at: z.string().min(1).optional(),
});

export const postgrestTaskRowsSchema = z.array(postgrestTaskRowSchema);

export const listTasksResponseSchema = z.object({
  tasks: z.array(taskSchema)
});

export const createTaskResponseSchema = z.object({
  task: taskSchema
});

export function taskFromPostgrestRow(row) {
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

export function parsePostgrestListTasksResponse(input) {
  const rows = postgrestTaskRowsSchema.parse(input);
  return listTasksResponseSchema.parse({
    tasks: rows.map(taskFromPostgrestRow)
  });
}

export function parsePostgrestCreateTaskResponse(input) {
  const rows = postgrestTaskRowsSchema.parse(input);
  if (rows.length === 0) {
    throw new Error('Expected PostgREST create task response to include one row');
  }
  return createTaskResponseSchema.parse({
    task: taskFromPostgrestRow(rows[0])
  });
}

export const postgrestTaskBlockerRowSchema = z.object({
  id: z.number().int().positive(),
  task_id: z.number().int().positive(),
  blocking_task_id: z.number().int().positive(),
  created_at: z.string().min(1),
  updated_at: z.string().min(1).optional(),
});

export const postgrestTaskBlockerRowsSchema = z.array(postgrestTaskBlockerRowSchema);

export const listTaskBlockersResponseSchema = z.object({
  taskBlockers: z.array(taskBlockerSchema)
});

export const createTaskBlockerResponseSchema = z.object({
  taskBlocker: taskBlockerSchema
});

export function taskBlockerFromPostgrestRow(row) {
  const createdAt = normalizePostgrestTimestamp(row.created_at);
  return taskBlockerSchema.parse({
    id: row.id,
    taskId: row.task_id,
    blockingTaskId: row.blocking_task_id,
    createdAt: normalizePostgrestTimestamp(row.created_at),
    updatedAt: row.updated_at ? normalizePostgrestTimestamp(row.updated_at) : createdAt,
  });
}

export function parsePostgrestListTaskBlockersResponse(input) {
  const rows = postgrestTaskBlockerRowsSchema.parse(input);
  return listTaskBlockersResponseSchema.parse({
    taskBlockers: rows.map(taskBlockerFromPostgrestRow)
  });
}

export function parsePostgrestCreateTaskBlockerResponse(input) {
  const rows = postgrestTaskBlockerRowsSchema.parse(input);
  if (rows.length === 0) {
    throw new Error('Expected PostgREST create taskblocker response to include one row');
  }
  return createTaskBlockerResponseSchema.parse({
    taskBlocker: taskBlockerFromPostgrestRow(rows[0])
  });
}

export const postgrestProjectNoteRowSchema = z.object({
  id: z.number().int().positive(),
  project_id: z.number().int().positive(),
  body: z.string().min(1),
  reference_url: z.string().min(1).nullable().optional(),
  created_at: z.string().min(1),
  updated_at: z.string().min(1).optional(),
});

export const postgrestProjectNoteRowsSchema = z.array(postgrestProjectNoteRowSchema);

export const listProjectNotesResponseSchema = z.object({
  notes: z.array(projectNoteSchema)
});

export const createProjectNoteResponseSchema = z.object({
  note: projectNoteSchema
});

export function projectNoteFromPostgrestRow(row) {
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

export function parsePostgrestListProjectNotesResponse(input) {
  const rows = postgrestProjectNoteRowsSchema.parse(input);
  return listProjectNotesResponseSchema.parse({
    notes: rows.map(projectNoteFromPostgrestRow)
  });
}

export function parsePostgrestCreateProjectNoteResponse(input) {
  const rows = postgrestProjectNoteRowsSchema.parse(input);
  if (rows.length === 0) {
    throw new Error('Expected PostgREST create project note response to include one row');
  }
  return createProjectNoteResponseSchema.parse({
    note: projectNoteFromPostgrestRow(rows[0])
  });
}

export const postgrestTaskNoteRowSchema = z.object({
  id: z.number().int().positive(),
  task_id: z.number().int().positive(),
  body: z.string().min(1),
  reference_url: z.string().min(1).nullable().optional(),
  created_at: z.string().min(1),
  updated_at: z.string().min(1).optional(),
});

export const postgrestTaskNoteRowsSchema = z.array(postgrestTaskNoteRowSchema);

export const listTaskNotesResponseSchema = z.object({
  notes: z.array(taskNoteSchema)
});

export const createTaskNoteResponseSchema = z.object({
  note: taskNoteSchema
});

export function taskNoteFromPostgrestRow(row) {
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

export function parsePostgrestListTaskNotesResponse(input) {
  const rows = postgrestTaskNoteRowsSchema.parse(input);
  return listTaskNotesResponseSchema.parse({
    notes: rows.map(taskNoteFromPostgrestRow)
  });
}

export function parsePostgrestCreateTaskNoteResponse(input) {
  const rows = postgrestTaskNoteRowsSchema.parse(input);
  if (rows.length === 0) {
    throw new Error('Expected PostgREST create task note response to include one row');
  }
  return createTaskNoteResponseSchema.parse({
    note: taskNoteFromPostgrestRow(rows[0])
  });
}
