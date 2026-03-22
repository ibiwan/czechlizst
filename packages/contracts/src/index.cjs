const { z } = require('zod');
const {
  TaskRelationTypeSchema,
  WorkStatusSchema: StoredWorkStatusSchema
} = require('./generated/prisma-zod.cjs');
const publicContracts = require('./generated/public-contracts.cjs');
const prismaClasses = require('./generated/prisma-classes.cjs');

const routes = {
  healthProbe: '/projects?select=*&limit=1',
  projects: '/projects',
  projectsSelect: '/projects?select=*',
  tasks: '/tasks',
  tasksByProject: (projectId) => `/tasks?project_id=eq.${projectId}&select=*`,
  taskRelations: '/task_relations',
  taskRelationsByTask: (taskId) => `/task_relations?task_id=eq.${taskId}&select=*`,
  projectNotes: '/project_notes',
  taskNotes: '/task_notes',
  projectNotesByProject: (projectId) =>
    `/project_notes?project_id=eq.${projectId}&select=*`,
  taskNotesByTask: (taskId) => `/task_notes?task_id=eq.${taskId}&select=*`
};

const healthResponseSchema = z.object({
  ok: z.boolean()
});

const storedWorkStatusSchema = StoredWorkStatusSchema;
const storedWorkStatuses = storedWorkStatusSchema.options;
const workStatusSchema = z.enum([...storedWorkStatuses, 'blocked']);
const workStatuses = workStatusSchema.options;
const taskEditableWorkStatuses = storedWorkStatuses;
const taskRelationTypeSchema = TaskRelationTypeSchema;
const taskRelationTypes = taskRelationTypeSchema.options;
const resolvedBlockingStatuses = ['done', 'dropped'];
const blockingTaskRelationType = 'blocked_by';
const placeholderTaskTitle = '•';
const allowedWorkStatusTransitions = Object.fromEntries(
  storedWorkStatuses.map((status) => [
    status,
    storedWorkStatuses.filter((candidate) => candidate !== status)
  ])
);

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

function isStoredWorkStatus(status) {
  return storedWorkStatusSchema.safeParse(status).success;
}

function isResolvedBlockingStatus(status) {
  return resolvedBlockingStatuses.includes(status);
}

function isBlockingTaskRelation(relation) {
  return relation.relationType === blockingTaskRelationType;
}

function hasUnresolvedTaskBlockers(taskId, relations, tasks) {
  const blockingTaskIds = relations
    .filter((relation) => relation.taskId === taskId && isBlockingTaskRelation(relation))
    .map((relation) => relation.relatedTaskId);

  if (blockingTaskIds.length === 0) {
    return false;
  }

  const taskStatusById = new Map(tasks.map((task) => [task.id, task.status]));
  return blockingTaskIds.some((blockingTaskId) => {
    const status = taskStatusById.get(blockingTaskId);
    return status === undefined || !isResolvedBlockingStatus(status);
  });
}

function computeEffectiveTaskStatus(task, relations, tasks) {
  return hasUnresolvedTaskBlockers(task.id, relations, tasks) ? 'blocked' : task.status;
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
    name: z.string().min(1).max(120).optional()
  })
  .refine((value) => value.name !== undefined, {
    message: 'Provide at least one project field to update.'
  });

const createTaskBodySchema = z.object({
  title: z.string().min(1).max(240),
  is_placeholder: z.boolean().optional()
});

const updateTaskBodySchema = z
  .object({
    title: z.string().min(1).max(240).optional(),
    status: storedWorkStatusSchema.optional(),
    is_placeholder: z.boolean().optional()
  })
  .refine(
    (value) =>
      value.title !== undefined || value.status !== undefined || value.is_placeholder !== undefined,
    {
      message: 'Provide at least one task field to update.'
    }
  );

const updateTaskStatusBodySchema = z.object({
  status: storedWorkStatusSchema,
  is_placeholder: z.boolean().optional()
});

const createProjectNoteBodySchema = z.object({
  body: z.string().min(1).max(5000),
  reference_url: z.string().min(1).optional().nullable()
});

const createTaskNoteBodySchema = z.object({
  body: z.string().min(1).max(5000),
  reference_url: z.string().min(1).optional().nullable()
});

const createTaskRelationBodySchema = z.object({
  task_id: z.number().int().positive(),
  related_task_id: z.number().int().positive(),
  relation_type: taskRelationTypeSchema,
  commentary: z.string().min(1).optional().nullable()
}).refine((value) => value.task_id !== value.related_task_id, {
  message: 'A task cannot relate to itself.'
});

const updateTaskRelationBodySchema = z
  .object({
    relation_type: taskRelationTypeSchema.optional(),
    commentary: z.string().min(1).optional().nullable()
  })
  .refine(
    (value) => value.relation_type !== undefined || value.commentary !== undefined,
    {
      message: 'Provide at least one relation field to update.'
    }
  );

const updateProjectNoteBodySchema = z.object({
  body: z.string().min(1).max(5000),
  reference_url: z.string().min(1).optional().nullable()
});

const updateTaskNoteBodySchema = z.object({
  body: z.string().min(1).max(5000),
  reference_url: z.string().min(1).optional().nullable()
});

module.exports = {
  ...publicContracts,
  ...prismaClasses,
  routes,
  healthResponseSchema,
  storedWorkStatusSchema,
  storedWorkStatuses,
  workStatusSchema,
  workStatuses,
  taskEditableWorkStatuses,
  taskRelationTypeSchema,
  taskRelationTypes,
  resolvedBlockingStatuses,
  blockingTaskRelationType,
  placeholderTaskTitle,
  allowedWorkStatusTransitions,
  canTransitionWorkStatus,
  getWorkStatusTransitionReason,
  isStoredWorkStatus,
  isResolvedBlockingStatus,
  isBlockingTaskRelation,
  hasUnresolvedTaskBlockers,
  computeEffectiveTaskStatus,
  computeProjectStatusFromTasks,
  createProjectBodySchema,
  updateProjectBodySchema,
  createTaskBodySchema,
  updateTaskBodySchema,
  updateTaskStatusBodySchema,
  createProjectNoteBodySchema,
  createTaskNoteBodySchema,
  createTaskRelationBodySchema,
  updateTaskRelationBodySchema,
  updateProjectNoteBodySchema,
  updateTaskNoteBodySchema
};
