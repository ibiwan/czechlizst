import { z } from 'zod';
import {
  ProjectNoteRowSchema,
  ProjectRowSchema,
  TaskNoteRowSchema,
  TaskRowSchema,
  WorkStatusSchema
} from './generated/prisma-zod.mjs';
import {
  ProjectNotePostgrestRow,
  ProjectNoteRowModel,
  ProjectPostgrestRow,
  ProjectRowModel,
  TaskNotePostgrestRow,
  TaskNoteRowModel,
  TaskPostgrestRow,
  TaskRowModel
} from './generated/prisma-classes.mjs';

export const routes = {
  healthProbe: '/projects?select=*&limit=1',
  projects: '/projects',
  projectsSelect: '/projects?select=*',
  tasks: '/tasks',
  tasksByProject: (projectId) => `/tasks?project_id=eq.${projectId}&select=*`,
  projectNotes: '/project_notes',
  taskNotes: '/task_notes',
  projectNotesByProject: (projectId) =>
    `/project_notes?project_id=eq.${projectId}&select=*`,
  taskNotesByTask: (taskId) => `/task_notes?task_id=eq.${taskId}&select=*`
};

export const healthResponseSchema = z.object({
  ok: z.boolean()
});

export const workStatusSchema = WorkStatusSchema;
export const workStatuses = workStatusSchema.options;

export const allowedWorkStatusTransitions = {
  todo: ['started', 'active', 'blocked', 'dropped'],
  started: ['active', 'blocked', 'done', 'dropped', 'todo'],
  active: ['started', 'blocked', 'done', 'dropped', 'todo'],
  blocked: ['started', 'active', 'dropped', 'todo'],
  done: ['todo', 'started', 'active', 'dropped'],
  dropped: ['todo', 'started', 'active']
};

export function canTransitionWorkStatus(from, to) {
  if (from === to) {
    return true;
  }

  const allowed = allowedWorkStatusTransitions[from] ?? [];
  return allowed.includes(to);
}

export function getWorkStatusTransitionReason(from, to) {
  if (canTransitionWorkStatus(from, to)) {
    return null;
  }

  return `Cannot move from ${from} to ${to}.`;
}

export function computeProjectStatusFromTasks(tasks) {
  const total = tasks.length;
  if (total === 0) {
    return null;
  }

  let activeCount = 0;
  let startedCount = 0;
  let blocked = 0;
  let todo = 0;
  let done = 0;
  let dropped = 0;

  for (const task of tasks) {
    switch (task.status) {
      case 'active':
        activeCount += 1;
        break;
      case 'started':
        startedCount += 1;
        break;
      case 'blocked':
        blocked += 1;
        break;
      case 'todo':
        todo += 1;
        break;
      case 'done':
        done += 1;
        break;
      case 'dropped':
        dropped += 1;
        break;
      default:
        break;
    }
  }

  const totalActive = total - dropped;

  if (activeCount > 0) {
    return 'active';
  }

  if (startedCount > 0) {
    return 'started';
  }

  if (totalActive > 0 && done === totalActive) {
    return 'done';
  }

  if (blocked > 0 && todo === 0) {
    return 'blocked';
  }

  if (todo > 0 || blocked > 0) {
    return 'todo';
  }

  return null;
}

export const projectSchema = ProjectRowSchema;
export const taskSchema = TaskRowSchema;
export const projectNoteSchema = ProjectNoteRowSchema;
export const taskNoteSchema = TaskNoteRowSchema;

export {
  ProjectRowModel,
  TaskRowModel,
  ProjectNoteRowModel,
  TaskNoteRowModel,
  ProjectPostgrestRow,
  TaskPostgrestRow,
  ProjectNotePostgrestRow,
  TaskNotePostgrestRow
};

export const postgrestProjectRowSchema = z.object({
  id: z.number().int().positive(),
  name: z.string().min(1),
  status: workStatusSchema,
  created_at: z.string().min(1),
  updated_at: z.string().min(1).optional()
});

export const postgrestTaskRowSchema = z.object({
  id: z.number().int().positive(),
  project_id: z.number().int().positive(),
  title: z.string().min(1),
  status: workStatusSchema,
  created_at: z.string().min(1),
  updated_at: z.string().min(1).optional()
});

export const postgrestProjectNoteRowSchema = z.object({
  id: z.number().int().positive(),
  project_id: z.number().int().positive(),
  body: z.string().min(1),
  reference_url: z.string().min(1).nullable(),
  created_at: z.string().min(1),
  updated_at: z.string().min(1).optional()
});

export const postgrestTaskNoteRowSchema = z.object({
  id: z.number().int().positive(),
  task_id: z.number().int().positive(),
  body: z.string().min(1),
  reference_url: z.string().min(1).nullable(),
  created_at: z.string().min(1),
  updated_at: z.string().min(1).optional()
});

export const postgrestProjectRowsSchema = z.array(postgrestProjectRowSchema);
export const postgrestTaskRowsSchema = z.array(postgrestTaskRowSchema);
export const postgrestProjectNoteRowsSchema = z.array(postgrestProjectNoteRowSchema);
export const postgrestTaskNoteRowsSchema = z.array(postgrestTaskNoteRowSchema);

export const listProjectsResponseSchema = z.object({
  projects: z.array(projectSchema)
});

export const createProjectBodySchema = z.object({
  name: z.string().min(1).max(120)
});

export const updateProjectBodySchema = z
  .object({
    name: z.string().min(1).max(120).optional(),
    status: workStatusSchema.optional()
  })
  .refine((value) => value.name !== undefined || value.status !== undefined, {
    message: 'Provide at least one project field to update.'
  });

export const updateProjectStatusBodySchema = z.object({
  status: workStatusSchema
});

export const createProjectResponseSchema = z.object({
  project: projectSchema
});

export const listTasksResponseSchema = z.object({
  tasks: z.array(taskSchema)
});

export const listProjectNotesResponseSchema = z.object({
  notes: z.array(projectNoteSchema)
});

export const listTaskNotesResponseSchema = z.object({
  notes: z.array(taskNoteSchema)
});

export const createTaskBodySchema = z.object({
  title: z.string().min(1).max(240)
});

export const updateTaskBodySchema = z
  .object({
    title: z.string().min(1).max(240).optional(),
    status: workStatusSchema.optional()
  })
  .refine((value) => value.title !== undefined || value.status !== undefined, {
    message: 'Provide at least one task field to update.'
  });

export const updateTaskStatusBodySchema = z.object({
  status: workStatusSchema
});

export const createTaskResponseSchema = z.object({
  task: taskSchema
});

export const createProjectNoteBodySchema = z.object({
  body: z.string().min(1).max(5000),
  reference_url: z.string().min(1).max(5000).optional().nullable()
});

export const createTaskNoteBodySchema = z.object({
  body: z.string().min(1).max(5000),
  reference_url: z.string().min(1).max(5000).optional().nullable()
});

export const updateProjectNoteBodySchema = z.object({
  body: z.string().min(1).max(5000),
  reference_url: z.string().min(1).max(5000).optional().nullable()
});

export const updateTaskNoteBodySchema = z.object({
  body: z.string().min(1).max(5000),
  reference_url: z.string().min(1).max(5000).optional().nullable()
});

export const createProjectNoteResponseSchema = z.object({
  note: projectNoteSchema
});

export const createTaskNoteResponseSchema = z.object({
  note: taskNoteSchema
});

function normalizePostgrestTimestamp(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    throw new Error(`Invalid PostgREST timestamp: ${value}`);
  }

  return date.toISOString();
}

export function projectFromPostgrestRow(row) {
  const createdAt = normalizePostgrestTimestamp(row.created_at);
  return projectSchema.parse({
    id: row.id,
    name: row.name,
    status: row.status,
    createdAt,
    updatedAt: row.updated_at ? normalizePostgrestTimestamp(row.updated_at) : createdAt
  });
}

export function taskFromPostgrestRow(row) {
  const createdAt = normalizePostgrestTimestamp(row.created_at);
  return taskSchema.parse({
    id: row.id,
    projectId: row.project_id,
    title: row.title,
    status: row.status,
    createdAt,
    updatedAt: row.updated_at ? normalizePostgrestTimestamp(row.updated_at) : createdAt
  });
}

export function projectNoteFromPostgrestRow(row) {
  const createdAt = normalizePostgrestTimestamp(row.created_at);
  return projectNoteSchema.parse({
    id: row.id,
    projectId: row.project_id,
    body: row.body,
    referenceUrl: row.reference_url ?? null,
    createdAt,
    updatedAt: row.updated_at ? normalizePostgrestTimestamp(row.updated_at) : createdAt
  });
}

export function taskNoteFromPostgrestRow(row) {
  const createdAt = normalizePostgrestTimestamp(row.created_at);
  return taskNoteSchema.parse({
    id: row.id,
    taskId: row.task_id,
    body: row.body,
    referenceUrl: row.reference_url ?? null,
    createdAt,
    updatedAt: row.updated_at ? normalizePostgrestTimestamp(row.updated_at) : createdAt
  });
}

function parseListResponse(input, rowsSchema, mapRow, listSchema, key) {
  const rows = rowsSchema.parse(input);
  return listSchema.parse({
    [key]: rows.map(mapRow)
  });
}

function parseCreateOneResponse(input, rowsSchema, mapRow, responseSchema, key, entityName) {
  const rows = rowsSchema.parse(input);
  if (rows.length === 0) {
    throw new Error(`Expected PostgREST create ${entityName} response to include one row`);
  }
  return responseSchema.parse({
    [key]: mapRow(rows[0])
  });
}

export function parsePostgrestListProjectsResponse(input) {
  return parseListResponse(
    input,
    postgrestProjectRowsSchema,
    projectFromPostgrestRow,
    listProjectsResponseSchema,
    'projects'
  );
}

export function parsePostgrestCreateProjectResponse(input) {
  return parseCreateOneResponse(
    input,
    postgrestProjectRowsSchema,
    projectFromPostgrestRow,
    createProjectResponseSchema,
    'project',
    'project'
  );
}

export function parsePostgrestListTasksResponse(input) {
  return parseListResponse(
    input,
    postgrestTaskRowsSchema,
    taskFromPostgrestRow,
    listTasksResponseSchema,
    'tasks'
  );
}

export function parsePostgrestListProjectNotesResponse(input) {
  return parseListResponse(
    input,
    postgrestProjectNoteRowsSchema,
    projectNoteFromPostgrestRow,
    listProjectNotesResponseSchema,
    'notes'
  );
}

export function parsePostgrestListTaskNotesResponse(input) {
  return parseListResponse(
    input,
    postgrestTaskNoteRowsSchema,
    taskNoteFromPostgrestRow,
    listTaskNotesResponseSchema,
    'notes'
  );
}

export function parsePostgrestCreateTaskResponse(input) {
  return parseCreateOneResponse(
    input,
    postgrestTaskRowsSchema,
    taskFromPostgrestRow,
    createTaskResponseSchema,
    'task',
    'task'
  );
}

export function parsePostgrestCreateProjectNoteResponse(input) {
  return parseCreateOneResponse(
    input,
    postgrestProjectNoteRowsSchema,
    projectNoteFromPostgrestRow,
    createProjectNoteResponseSchema,
    'note',
    'project note'
  );
}

export function parsePostgrestCreateTaskNoteResponse(input) {
  return parseCreateOneResponse(
    input,
    postgrestTaskNoteRowsSchema,
    taskNoteFromPostgrestRow,
    createTaskNoteResponseSchema,
    'note',
    'task note'
  );
}
