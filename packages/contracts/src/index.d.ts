import { z } from 'zod';
import { WorkStatusSchema } from './generated/prisma-zod';

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
} from './generated/public-contracts';

export {
  ProjectNotePostgrestRow,
  ProjectNoteRowModel,
  ProjectPostgrestRow,
  ProjectRowModel,
  TaskNotePostgrestRow,
  TaskNoteRowModel,
  TaskPostgrestRow,
  TaskRowModel
} from './generated/prisma-classes';

export declare const routes: {
  readonly healthProbe: '/projects?select=*&limit=1';
  readonly projects: '/projects';
  readonly projectsSelect: '/projects?select=*';
  readonly tasks: '/tasks';
  readonly tasksByProject: (projectId: number | string) => string;
  readonly taskBlockers: '/task_blockers';
  readonly taskBlockersByTask: (taskId: number | string) => string;
  readonly projectNotes: '/project_notes';
  readonly taskNotes: '/task_notes';
  readonly projectNotesByProject: (projectId: number | string) => string;
  readonly taskNotesByTask: (taskId: number | string) => string;
};

export type StoredWorkStatus = import('./generated/public-types').WorkStatus;
export type WorkStatus = StoredWorkStatus | 'blocked';

export declare const healthResponseSchema: z.ZodType<{ ok: boolean }>;
export declare const storedWorkStatusSchema: typeof WorkStatusSchema;
export declare const storedWorkStatuses: ReadonlyArray<StoredWorkStatus>;
export declare const workStatusSchema: z.ZodType<WorkStatus>;
export declare const workStatuses: ReadonlyArray<WorkStatus>;
export declare const taskEditableWorkStatuses: ReadonlyArray<StoredWorkStatus>;
export declare const resolvedBlockingStatuses: ReadonlyArray<'done' | 'dropped'>;
export declare const allowedWorkStatusTransitions: Record<StoredWorkStatus, Array<StoredWorkStatus>>;
export declare function canTransitionWorkStatus(
  from: StoredWorkStatus,
  to: StoredWorkStatus
): boolean;
export declare function getWorkStatusTransitionReason(
  from: StoredWorkStatus,
  to: StoredWorkStatus
): string | null;
export declare function isStoredWorkStatus(status: unknown): status is StoredWorkStatus;
export declare function isResolvedBlockingStatus(
  status: WorkStatus
): boolean;
export declare function hasUnresolvedTaskBlockers(
  taskId: number,
  blockers: Array<import('./generated/public-types').TaskBlocker>,
  tasks: Array<{ id: number; status: WorkStatus }>
): boolean;
export declare function computeEffectiveTaskStatus(
  task: { id: number; status: StoredWorkStatus },
  blockers: Array<import('./generated/public-types').TaskBlocker>,
  tasks: Array<{ id: number; status: WorkStatus }>
): WorkStatus;
export declare function computeProjectStatusFromTasks(
  tasks: Array<{ status: WorkStatus }>
): WorkStatus | null;

export declare const createProjectBodySchema: z.ZodType<import('./generated/public-types').CreateProjectBody>;
export declare const updateProjectBodySchema: z.ZodType<import('./generated/public-types').UpdateProjectBody>;
export declare const updateProjectStatusBodySchema: z.ZodType<import('./generated/public-types').UpdateProjectStatusBody>;
export declare const createTaskBodySchema: z.ZodType<import('./generated/public-types').CreateTaskBody>;
export declare const updateTaskBodySchema: z.ZodType<import('./generated/public-types').UpdateTaskBody>;
export declare const updateTaskStatusBodySchema: z.ZodType<import('./generated/public-types').UpdateTaskStatusBody>;
export declare const createProjectNoteBodySchema: z.ZodType<import('./generated/public-types').CreateProjectNoteBody>;
export declare const createTaskNoteBodySchema: z.ZodType<import('./generated/public-types').CreateTaskNoteBody>;
export declare const createTaskBlockerBodySchema: z.ZodType<{
  task_id: number;
  blocking_task_id: number;
}>;
export declare const updateProjectNoteBodySchema: z.ZodType<import('./generated/public-types').UpdateProjectNoteBody>;
export declare const updateTaskNoteBodySchema: z.ZodType<import('./generated/public-types').UpdateTaskNoteBody>;

export type {
  CreateProjectBody,
  CreateProjectNoteBody,
  CreateProjectNoteResponse,
  CreateProjectResponse,
  CreateTaskBody,
  CreateTaskBlockerResponse,
  CreateTaskNoteBody,
  CreateTaskNoteResponse,
  CreateTaskResponse,
  HealthResponse,
  ListProjectNotesResponse,
  ListProjectsResponse,
  ListTaskBlockersResponse,
  ListTaskNotesResponse,
  ListTasksResponse,
  PostgrestProjectNoteRow,
  PostgrestProjectRow,
  PostgrestTaskBlockerRow,
  PostgrestTaskNoteRow,
  PostgrestTaskRow,
  Project,
  ProjectNote,
  Task,
  TaskBlocker,
  TaskNote,
  UpdateProjectBody,
  UpdateProjectNoteBody,
  UpdateProjectStatusBody,
  UpdateTaskBody,
  UpdateTaskNoteBody,
  UpdateTaskStatusBody
} from './generated/public-types';

export type {
  PrismaRowModels,
  ProjectNoteRow,
  ProjectRow,
  TaskNoteRow,
  TaskRow
} from './generated/prisma-types';
