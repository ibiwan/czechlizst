import { z } from 'zod';

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

export declare const healthResponseSchema: z.ZodObject<{ ok: z.ZodBoolean }>;
export declare const workStatusSchema: z.ZodEnum<
  ['todo', 'doing', 'blocked', 'done', 'dropped']
>;
export declare const workStatuses: ReadonlyArray<z.infer<typeof workStatusSchema>>;
export declare const allowedWorkStatusTransitions: Record<
  z.infer<typeof workStatusSchema>,
  Array<z.infer<typeof workStatusSchema>>
>;
export declare function canTransitionWorkStatus(
  from: z.infer<typeof workStatusSchema>,
  to: z.infer<typeof workStatusSchema>
): boolean;
export declare function getWorkStatusTransitionReason(
  from: z.infer<typeof workStatusSchema>,
  to: z.infer<typeof workStatusSchema>
): string | null;
export declare function computeProjectStatusFromTasks(
  tasks: Array<{ status: z.infer<typeof workStatusSchema> }>
): z.infer<typeof workStatusSchema> | null;

export declare const projectSchema: z.ZodObject<{
  id: z.ZodNumber;
  name: z.ZodString;
  status: typeof workStatusSchema;
  createdAt: z.ZodString;
}>;

export declare const taskSchema: z.ZodObject<{
  id: z.ZodNumber;
  projectId: z.ZodNumber;
  title: z.ZodString;
  status: typeof workStatusSchema;
  createdAt: z.ZodString;
}>;

export declare const projectNoteSchema: z.ZodObject<{
  id: z.ZodNumber;
  projectId: z.ZodNumber;
  body: z.ZodString;
  createdAt: z.ZodString;
}>;

export declare const taskNoteSchema: z.ZodObject<{
  id: z.ZodNumber;
  taskId: z.ZodNumber;
  body: z.ZodString;
  createdAt: z.ZodString;
}>;

export declare const postgrestProjectRowSchema: z.ZodObject<{
  id: z.ZodNumber;
  name: z.ZodString;
  status: typeof workStatusSchema;
  created_at: z.ZodString;
}>;

export declare const postgrestTaskRowSchema: z.ZodObject<{
  id: z.ZodNumber;
  project_id: z.ZodNumber;
  title: z.ZodString;
  status: typeof workStatusSchema;
  created_at: z.ZodString;
}>;

export declare const postgrestProjectNoteRowSchema: z.ZodObject<{
  id: z.ZodNumber;
  project_id: z.ZodNumber;
  body: z.ZodString;
  created_at: z.ZodString;
}>;

export declare const postgrestTaskNoteRowSchema: z.ZodObject<{
  id: z.ZodNumber;
  task_id: z.ZodNumber;
  body: z.ZodString;
  created_at: z.ZodString;
}>;

export declare const postgrestProjectRowsSchema: z.ZodArray<typeof postgrestProjectRowSchema>;
export declare const postgrestTaskRowsSchema: z.ZodArray<typeof postgrestTaskRowSchema>;
export declare const postgrestProjectNoteRowsSchema: z.ZodArray<
  typeof postgrestProjectNoteRowSchema
>;
export declare const postgrestTaskNoteRowsSchema: z.ZodArray<typeof postgrestTaskNoteRowSchema>;

export declare const listProjectsResponseSchema: z.ZodObject<{
  projects: z.ZodArray<typeof projectSchema>;
}>;
export declare const listTasksResponseSchema: z.ZodObject<{
  tasks: z.ZodArray<typeof taskSchema>;
}>;
export declare const listProjectNotesResponseSchema: z.ZodObject<{
  notes: z.ZodArray<typeof projectNoteSchema>;
}>;
export declare const listTaskNotesResponseSchema: z.ZodObject<{
  notes: z.ZodArray<typeof taskNoteSchema>;
}>;

export declare const createProjectBodySchema: z.ZodObject<{ name: z.ZodString }>;
export declare const updateProjectStatusBodySchema: z.ZodObject<{ status: typeof workStatusSchema }>;
export declare const createTaskBodySchema: z.ZodObject<{ title: z.ZodString }>;
export declare const updateTaskStatusBodySchema: z.ZodObject<{ status: typeof workStatusSchema }>;
export declare const createProjectNoteBodySchema: z.ZodObject<{ body: z.ZodString }>;
export declare const createTaskNoteBodySchema: z.ZodObject<{ body: z.ZodString }>;

export declare const createProjectResponseSchema: z.ZodObject<{ project: typeof projectSchema }>;
export declare const createTaskResponseSchema: z.ZodObject<{ task: typeof taskSchema }>;
export declare const createProjectNoteResponseSchema: z.ZodObject<{ note: typeof projectNoteSchema }>;
export declare const createTaskNoteResponseSchema: z.ZodObject<{ note: typeof taskNoteSchema }>;

export declare function projectFromPostgrestRow(
  row: z.infer<typeof postgrestProjectRowSchema>
): z.infer<typeof projectSchema>;
export declare function taskFromPostgrestRow(
  row: z.infer<typeof postgrestTaskRowSchema>
): z.infer<typeof taskSchema>;
export declare function projectNoteFromPostgrestRow(
  row: z.infer<typeof postgrestProjectNoteRowSchema>
): z.infer<typeof projectNoteSchema>;
export declare function taskNoteFromPostgrestRow(
  row: z.infer<typeof postgrestTaskNoteRowSchema>
): z.infer<typeof taskNoteSchema>;

export declare function parsePostgrestListProjectsResponse(
  input: unknown
): z.infer<typeof listProjectsResponseSchema>;
export declare function parsePostgrestCreateProjectResponse(
  input: unknown
): z.infer<typeof createProjectResponseSchema>;
export declare function parsePostgrestListTasksResponse(
  input: unknown
): z.infer<typeof listTasksResponseSchema>;
export declare function parsePostgrestCreateTaskResponse(
  input: unknown
): z.infer<typeof createTaskResponseSchema>;
export declare function parsePostgrestListProjectNotesResponse(
  input: unknown
): z.infer<typeof listProjectNotesResponseSchema>;
export declare function parsePostgrestListTaskNotesResponse(
  input: unknown
): z.infer<typeof listTaskNotesResponseSchema>;
export declare function parsePostgrestCreateProjectNoteResponse(
  input: unknown
): z.infer<typeof createProjectNoteResponseSchema>;
export declare function parsePostgrestCreateTaskNoteResponse(
  input: unknown
): z.infer<typeof createTaskNoteResponseSchema>;

export type HealthResponse = z.infer<typeof healthResponseSchema>;
export type WorkStatus = z.infer<typeof workStatusSchema>;
export type Project = z.infer<typeof projectSchema>;
export type Task = z.infer<typeof taskSchema>;
export type ProjectNote = z.infer<typeof projectNoteSchema>;
export type TaskNote = z.infer<typeof taskNoteSchema>;

export type { PrismaRowModels, ProjectNoteRow, ProjectRow, TaskNoteRow, TaskRow } from './generated/prisma-types';
