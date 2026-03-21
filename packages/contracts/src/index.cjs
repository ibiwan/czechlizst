const { z } = require('zod');
const { WorkStatusSchema } = require('./generated/prisma-zod.cjs');
const publicContracts = require('./generated/public-contracts.cjs');
const prismaClasses = require('./generated/prisma-classes.cjs');

const routes = {
  healthProbe: '/projects?select=*&limit=1',
  projects: '/projects',
  projectsSelect: '/projects?select=*',
  tasks: '/tasks',
  tasksByProject: (projectId) => `/tasks?project_id=eq.${projectId}&select=*`,
  taskBlockers: '/task_blockers',
  taskBlockersByTask: (taskId) => `/task_blockers?task_id=eq.${taskId}&select=*`,
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
const resolvedBlockingStatuses = ['done', 'dropped'];

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

function isResolvedBlockingStatus(status) {
  return resolvedBlockingStatuses.includes(status);
}

function hasUnresolvedTaskBlockers(taskId, blockers, tasks) {
  const blockingTaskIds = blockers
    .filter((blocker) => blocker.taskId === taskId)
    .map((blocker) => blocker.blockingTaskId);

  if (blockingTaskIds.length === 0) {
    return false;
  }

  const taskStatusById = new Map(tasks.map((task) => [task.id, task.status]));
  return blockingTaskIds.some((blockingTaskId) => {
    const status = taskStatusById.get(blockingTaskId);
    return status === undefined || !isResolvedBlockingStatus(status);
  });
}

function computeEffectiveTaskStatus(task, blockers, tasks) {
  if (task.status === 'blocked') {
    return 'blocked';
  }

  return hasUnresolvedTaskBlockers(task.id, blockers, tasks) ? 'blocked' : task.status;
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

const createProjectNoteBodySchema = z.object({
  body: z.string().min(1).max(5000),
  reference_url: z.string().min(1).max(5000).optional().nullable()
});

const createTaskNoteBodySchema = z.object({
  body: z.string().min(1).max(5000),
  reference_url: z.string().min(1).max(5000).optional().nullable()
});

const createTaskBlockerBodySchema = z.object({
  task_id: z.number().int().positive(),
  blocking_task_id: z.number().int().positive()
}).refine((value) => value.task_id !== value.blocking_task_id, {
  message: 'A task cannot be blocked by itself.'
});

const updateProjectNoteBodySchema = z.object({
  body: z.string().min(1).max(5000),
  reference_url: z.string().min(1).max(5000).optional().nullable()
});

const updateTaskNoteBodySchema = z.object({
  body: z.string().min(1).max(5000),
  reference_url: z.string().min(1).max(5000).optional().nullable()
});

module.exports = {
  ...publicContracts,
  ...prismaClasses,
  routes,
  healthResponseSchema,
  workStatusSchema,
  workStatuses,
  resolvedBlockingStatuses,
  allowedWorkStatusTransitions,
  canTransitionWorkStatus,
  getWorkStatusTransitionReason,
  isResolvedBlockingStatus,
  hasUnresolvedTaskBlockers,
  computeEffectiveTaskStatus,
  computeProjectStatusFromTasks,
  createProjectBodySchema,
  updateProjectBodySchema,
  updateProjectStatusBodySchema,
  createTaskBodySchema,
  updateTaskBodySchema,
  updateTaskStatusBodySchema,
  createProjectNoteBodySchema,
  createTaskNoteBodySchema,
  createTaskBlockerBodySchema,
  updateProjectNoteBodySchema,
  updateTaskNoteBodySchema
};
