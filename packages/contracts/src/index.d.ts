import { z } from 'zod';
import { WorkStatusSchema } from './generated/prisma-zod';

export {
  createProjectNoteResponseSchema,
  createProjectResponseSchema,
  createTaskNoteResponseSchema,
  createTaskResponseSchema,
  listProjectNotesResponseSchema,
  listProjectsResponseSchema,
  listTaskNotesResponseSchema,
  listTasksResponseSchema,
  postgrestProjectNoteRowSchema,
  postgrestProjectNoteRowsSchema,
  postgrestProjectRowSchema,
  postgrestProjectRowsSchema,
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
  parsePostgrestCreateTaskNoteResponse,
  parsePostgrestCreateTaskResponse,
  parsePostgrestListProjectNotesResponse,
  parsePostgrestListProjectsResponse,
  parsePostgrestListTaskNotesResponse,
  parsePostgrestListTasksResponse,
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
  readonly projectNotes: '/project_notes';
  readonly taskNotes: '/task_notes';
  readonly projectNotesByProject: (projectId: number | string) => string;
  readonly taskNotesByTask: (taskId: number | string) => string;
};

export declare const healthResponseSchema: z.ZodType<{ ok: boolean }>;
export declare const workStatusSchema: typeof WorkStatusSchema;
export declare const workStatuses: ReadonlyArray<import('./generated/public-types').WorkStatus>;
export declare const allowedWorkStatusTransitions: Record<
  import('./generated/public-types').WorkStatus,
  Array<import('./generated/public-types').WorkStatus>
>;
export declare function canTransitionWorkStatus(
  from: import('./generated/public-types').WorkStatus,
  to: import('./generated/public-types').WorkStatus
): boolean;
export declare function getWorkStatusTransitionReason(
  from: import('./generated/public-types').WorkStatus,
  to: import('./generated/public-types').WorkStatus
): string | null;
export declare function computeProjectStatusFromTasks(
  tasks: Array<{ status: import('./generated/public-types').WorkStatus }>
): import('./generated/public-types').WorkStatus | null;

export declare const createProjectBodySchema: z.ZodType<import('./generated/public-types').CreateProjectBody>;
export declare const updateProjectBodySchema: z.ZodType<import('./generated/public-types').UpdateProjectBody>;
export declare const updateProjectStatusBodySchema: z.ZodType<import('./generated/public-types').UpdateProjectStatusBody>;
export declare const createTaskBodySchema: z.ZodType<import('./generated/public-types').CreateTaskBody>;
export declare const updateTaskBodySchema: z.ZodType<import('./generated/public-types').UpdateTaskBody>;
export declare const updateTaskStatusBodySchema: z.ZodType<import('./generated/public-types').UpdateTaskStatusBody>;
export declare const createProjectNoteBodySchema: z.ZodType<import('./generated/public-types').CreateProjectNoteBody>;
export declare const createTaskNoteBodySchema: z.ZodType<import('./generated/public-types').CreateTaskNoteBody>;
export declare const updateProjectNoteBodySchema: z.ZodType<import('./generated/public-types').UpdateProjectNoteBody>;
export declare const updateTaskNoteBodySchema: z.ZodType<import('./generated/public-types').UpdateTaskNoteBody>;

export type {
  CreateProjectBody,
  CreateProjectNoteBody,
  CreateProjectNoteResponse,
  CreateProjectResponse,
  CreateTaskBody,
  CreateTaskNoteBody,
  CreateTaskNoteResponse,
  CreateTaskResponse,
  HealthResponse,
  ListProjectNotesResponse,
  ListProjectsResponse,
  ListTaskNotesResponse,
  ListTasksResponse,
  PostgrestProjectNoteRow,
  PostgrestProjectRow,
  PostgrestTaskNoteRow,
  PostgrestTaskRow,
  Project,
  ProjectNote,
  Task,
  TaskNote,
  UpdateProjectBody,
  UpdateProjectNoteBody,
  UpdateProjectStatusBody,
  UpdateTaskBody,
  UpdateTaskNoteBody,
  UpdateTaskStatusBody,
  WorkStatus
} from './generated/public-types';

export type {
  PrismaRowModels,
  ProjectNoteRow,
  ProjectRow,
  TaskNoteRow,
  TaskRow
} from './generated/prisma-types';
