import { z } from 'zod';
import { WorkStatusSchema as StoredWorkStatusSchema } from './generated/prisma-zod.mjs';

export {
  createProjectNoteResponseSchema,
  createProjectResponseSchema,
  createTaskBlockerResponseSchema,
  createTaskNoteResponseSchema,
  createTaskResponseSchema,
  listProjectNotesResponseSchema,
  listProjectsResponseSchema,
  listTaskBlockersResponseSchema,
  listTaskNotesResponseSchema,
  listTasksResponseSchema,
  postgrestProjectNoteRowSchema,
  postgrestProjectNoteRowsSchema,
  postgrestProjectRowSchema,
  postgrestProjectRowsSchema,
  postgrestTaskBlockerRowSchema,
  postgrestTaskBlockerRowsSchema,
  postgrestTaskNoteRowSchema,
  postgrestTaskNoteRowsSchema,
  postgrestTaskRowSchema,
  postgrestTaskRowsSchema,
  projectFromPostgrestRow,
  projectNoteFromPostgrestRow,
  projectNoteSchema,
  projectSchema,
  parsePostgrestCreateProjectNoteResponse,
  parsePostgrestCreateProjectResponse,
  parsePostgrestCreateTaskBlockerResponse,
  parsePostgrestCreateTaskNoteResponse,
  parsePostgrestCreateTaskResponse,
  parsePostgrestListProjectNotesResponse,
  parsePostgrestListProjectsResponse,
  parsePostgrestListTaskBlockersResponse,
  parsePostgrestListTaskNotesResponse,
  parsePostgrestListTasksResponse,
  taskBlockerFromPostgrestRow,
  taskBlockerSchema,
  taskFromPostgrestRow,
  taskNoteFromPostgrestRow,
  taskNoteSchema,
  taskSchema
} from './generated/public-contracts.mjs';

export {
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
  taskBlockers: '/task_blockers',
  taskBlockersByTask: (taskId) => `/task_blockers?task_id=eq.${taskId}&select=*`,
  projectNotes: '/project_notes',
  taskNotes: '/task_notes',
  projectNotesByProject: (projectId) =>
    `/project_notes?project_id=eq.${projectId}&select=*`,
  taskNotesByTask: (taskId) => `/task_notes?task_id=eq.${taskId}&select=*`
};

export const healthResponseSchema = z.object({
  ok: z.boolean()
});

export const storedWorkStatusSchema = StoredWorkStatusSchema;
export const storedWorkStatuses = storedWorkStatusSchema.options;
export const workStatusSchema = z.enum([...storedWorkStatuses, 'blocked']);
export const workStatuses = workStatusSchema.options;
export const taskEditableWorkStatuses = storedWorkStatuses;
export const resolvedBlockingStatuses = ['done', 'dropped'];
export const placeholderTaskTitle = '•';
export const allowedWorkStatusTransitions = Object.fromEntries(
  storedWorkStatuses.map((status) => [
    status,
    storedWorkStatuses.filter((candidate) => candidate !== status)
  ])
);

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

export function isStoredWorkStatus(status) {
  return storedWorkStatusSchema.safeParse(status).success;
}

export function isResolvedBlockingStatus(status) {
  return resolvedBlockingStatuses.includes(status);
}

export function hasUnresolvedTaskBlockers(taskId, blockers, tasks) {
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

export function computeEffectiveTaskStatus(task, blockers, tasks) {
  return hasUnresolvedTaskBlockers(task.id, blockers, tasks) ? 'blocked' : task.status;
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

export const createProjectBodySchema = z.object({
  name: z.string().min(1).max(120)
});

export const updateProjectBodySchema = z
  .object({
    name: z.string().min(1).max(120).optional()
  })
  .refine((value) => value.name !== undefined, {
    message: 'Provide at least one project field to update.'
  });

export const createTaskBodySchema = z.object({
  title: z.string().min(1).max(240),
  is_placeholder: z.boolean().optional()
});

export const updateTaskBodySchema = z
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

export const updateTaskStatusBodySchema = z.object({
  status: storedWorkStatusSchema,
  is_placeholder: z.boolean().optional()
});

export const createProjectNoteBodySchema = z.object({
  body: z.string().min(1).max(5000),
  reference_url: z.string().min(1).max(5000).optional().nullable()
});

export const createTaskNoteBodySchema = z.object({
  body: z.string().min(1).max(5000),
  reference_url: z.string().min(1).max(5000).optional().nullable()
});

export const createTaskBlockerBodySchema = z.object({
  task_id: z.number().int().positive(),
  blocking_task_id: z.number().int().positive()
}).refine((value) => value.task_id !== value.blocking_task_id, {
  message: 'A task cannot be blocked by itself.'
});

export const updateProjectNoteBodySchema = z.object({
  body: z.string().min(1).max(5000),
  reference_url: z.string().min(1).max(5000).optional().nullable()
});

export const updateTaskNoteBodySchema = z.object({
  body: z.string().min(1).max(5000),
  reference_url: z.string().min(1).max(5000).optional().nullable()
});
