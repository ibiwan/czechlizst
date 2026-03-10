const { z } = require('zod');
const {
  ProjectNoteRowSchema,
  ProjectRowSchema,
  TaskNoteRowSchema,
  TaskRowSchema,
  WorkStatusSchema
} = require('./generated/prisma-zod.cjs');

const routes = {
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

const healthResponseSchema = z.object({
  ok: z.boolean()
});

const workStatusSchema = WorkStatusSchema;
const workStatuses = workStatusSchema.options;

const allowedWorkStatusTransitions = {
  todo: ['started', 'active', 'blocked', 'dropped'],
  started: ['active', 'blocked', 'done', 'dropped', 'todo'],
  active: ['started', 'blocked', 'done', 'dropped', 'todo'],
  blocked: ['started', 'active', 'dropped', 'todo'],
  done: ['todo', 'started', 'active', 'dropped'],
  dropped: ['todo', 'started', 'active']
};

function canTransitionWorkStatus(from, to) {
  if (from === to) {
    return true;
  }

  const allowed = allowedWorkStatusTransitions[from] ?? [];
  return allowed.includes(to);
}

function getWorkStatusTransitionReason(from, to) {
  if (canTransitionWorkStatus(from, to)) {
    return null;
  }

  return `Cannot move from ${from} to ${to}.`;
}

function computeProjectStatusFromTasks(tasks) {
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

const projectSchema = ProjectRowSchema;
const taskSchema = TaskRowSchema;
const projectNoteSchema = ProjectNoteRowSchema;
const taskNoteSchema = TaskNoteRowSchema;

const postgrestProjectRowSchema = z.object({
  id: z.number().int().positive(),
  name: z.string().min(1),
  status: workStatusSchema,
  created_at: z.string().min(1)
});

const postgrestTaskRowSchema = z.object({
  id: z.number().int().positive(),
  project_id: z.number().int().positive(),
  title: z.string().min(1),
  status: workStatusSchema,
  created_at: z.string().min(1)
});

const postgrestProjectNoteRowSchema = z.object({
  id: z.number().int().positive(),
  project_id: z.number().int().positive(),
  body: z.string().min(1),
  created_at: z.string().min(1)
});

const postgrestTaskNoteRowSchema = z.object({
  id: z.number().int().positive(),
  task_id: z.number().int().positive(),
  body: z.string().min(1),
  created_at: z.string().min(1)
});

const postgrestProjectRowsSchema = z.array(postgrestProjectRowSchema);
const postgrestTaskRowsSchema = z.array(postgrestTaskRowSchema);
const postgrestProjectNoteRowsSchema = z.array(postgrestProjectNoteRowSchema);
const postgrestTaskNoteRowsSchema = z.array(postgrestTaskNoteRowSchema);

const listProjectsResponseSchema = z.object({
  projects: z.array(projectSchema)
});

const createProjectBodySchema = z.object({
  name: z.string().min(1).max(120)
});

const updateProjectBodySchema = z
  .object({
    name: z.string().min(1).max(120).optional(),
    status: workStatusSchema.optional()
  })
  .refine((value) => value.name !== undefined || value.status !== undefined, {
    message: 'Provide at least one project field to update.'
  });

const updateProjectStatusBodySchema = z.object({
  status: workStatusSchema
});

const createProjectResponseSchema = z.object({
  project: projectSchema
});

const listTasksResponseSchema = z.object({
  tasks: z.array(taskSchema)
});

const listProjectNotesResponseSchema = z.object({
  notes: z.array(projectNoteSchema)
});

const listTaskNotesResponseSchema = z.object({
  notes: z.array(taskNoteSchema)
});

const createTaskBodySchema = z.object({
  title: z.string().min(1).max(240)
});

const updateTaskBodySchema = z
  .object({
    title: z.string().min(1).max(240).optional(),
    status: workStatusSchema.optional()
  })
  .refine((value) => value.title !== undefined || value.status !== undefined, {
    message: 'Provide at least one task field to update.'
  });

const updateTaskStatusBodySchema = z.object({
  status: workStatusSchema
});

const createTaskResponseSchema = z.object({
  task: taskSchema
});

const createProjectNoteBodySchema = z.object({
  body: z.string().min(1).max(5000)
});

const createTaskNoteBodySchema = z.object({
  body: z.string().min(1).max(5000)
});

const updateProjectNoteBodySchema = z.object({
  body: z.string().min(1).max(5000)
});

const updateTaskNoteBodySchema = z.object({
  body: z.string().min(1).max(5000)
});

const createProjectNoteResponseSchema = z.object({
  note: projectNoteSchema
});

const createTaskNoteResponseSchema = z.object({
  note: taskNoteSchema
});

function normalizePostgrestTimestamp(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    throw new Error(`Invalid PostgREST timestamp: ${value}`);
  }

  return date.toISOString();
}

function projectFromPostgrestRow(row) {
  return projectSchema.parse({
    id: row.id,
    name: row.name,
    status: row.status,
    createdAt: normalizePostgrestTimestamp(row.created_at)
  });
}

function taskFromPostgrestRow(row) {
  return taskSchema.parse({
    id: row.id,
    projectId: row.project_id,
    title: row.title,
    status: row.status,
    createdAt: normalizePostgrestTimestamp(row.created_at)
  });
}

function projectNoteFromPostgrestRow(row) {
  return projectNoteSchema.parse({
    id: row.id,
    projectId: row.project_id,
    body: row.body,
    createdAt: normalizePostgrestTimestamp(row.created_at)
  });
}

function taskNoteFromPostgrestRow(row) {
  return taskNoteSchema.parse({
    id: row.id,
    taskId: row.task_id,
    body: row.body,
    createdAt: normalizePostgrestTimestamp(row.created_at)
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
  const project = rows[0];
  return createProjectResponseSchema.parse({
    project: projectFromPostgrestRow(project)
  });
}

function parsePostgrestListTasksResponse(input) {
  const rows = postgrestTaskRowsSchema.parse(input);
  return listTasksResponseSchema.parse({
    tasks: rows.map(taskFromPostgrestRow)
  });
}

function parsePostgrestListProjectNotesResponse(input) {
  const rows = postgrestProjectNoteRowsSchema.parse(input);
  return listProjectNotesResponseSchema.parse({
    notes: rows.map(projectNoteFromPostgrestRow)
  });
}

function parsePostgrestListTaskNotesResponse(input) {
  const rows = postgrestTaskNoteRowsSchema.parse(input);
  return listTaskNotesResponseSchema.parse({
    notes: rows.map(taskNoteFromPostgrestRow)
  });
}

function parsePostgrestCreateTaskResponse(input) {
  const rows = postgrestTaskRowsSchema.parse(input);
  if (rows.length === 0) {
    throw new Error('Expected PostgREST create task response to include one row');
  }
  const task = rows[0];
  return createTaskResponseSchema.parse({
    task: taskFromPostgrestRow(task)
  });
}

function parsePostgrestCreateProjectNoteResponse(input) {
  const rows = postgrestProjectNoteRowsSchema.parse(input);
  if (rows.length === 0) {
    throw new Error('Expected PostgREST create project note response to include one row');
  }
  const note = rows[0];
  return createProjectNoteResponseSchema.parse({
    note: projectNoteFromPostgrestRow(note)
  });
}

function parsePostgrestCreateTaskNoteResponse(input) {
  const rows = postgrestTaskNoteRowsSchema.parse(input);
  if (rows.length === 0) {
    throw new Error('Expected PostgREST create task note response to include one row');
  }
  const note = rows[0];
  return createTaskNoteResponseSchema.parse({
    note: taskNoteFromPostgrestRow(note)
  });
}


module.exports = {
  routes,
  healthResponseSchema,
  workStatusSchema,
  workStatuses,
  allowedWorkStatusTransitions,
  projectSchema,
  taskSchema,
  projectNoteSchema,
  taskNoteSchema,
  postgrestProjectRowSchema,
  postgrestTaskRowSchema,
  postgrestProjectNoteRowSchema,
  postgrestTaskNoteRowSchema,
  postgrestProjectRowsSchema,
  postgrestTaskRowsSchema,
  postgrestProjectNoteRowsSchema,
  postgrestTaskNoteRowsSchema,
  listProjectsResponseSchema,
  createProjectBodySchema,
  updateProjectBodySchema,
  updateProjectStatusBodySchema,
  createProjectResponseSchema,
  listTasksResponseSchema,
  listProjectNotesResponseSchema,
  listTaskNotesResponseSchema,
  createTaskBodySchema,
  updateTaskBodySchema,
  updateTaskStatusBodySchema,
  createTaskResponseSchema,
  createProjectNoteBodySchema,
  createTaskNoteBodySchema,
  updateProjectNoteBodySchema,
  updateTaskNoteBodySchema,
  createProjectNoteResponseSchema,
  createTaskNoteResponseSchema,
  canTransitionWorkStatus,
  getWorkStatusTransitionReason,
  computeProjectStatusFromTasks,
  projectFromPostgrestRow,
  taskFromPostgrestRow,
  projectNoteFromPostgrestRow,
  taskNoteFromPostgrestRow,
  parsePostgrestListProjectsResponse,
  parsePostgrestCreateProjectResponse,
  parsePostgrestListTasksResponse,
  parsePostgrestListProjectNotesResponse,
  parsePostgrestListTaskNotesResponse,
  parsePostgrestCreateTaskResponse,
  parsePostgrestCreateProjectNoteResponse,
  parsePostgrestCreateTaskNoteResponse
};
