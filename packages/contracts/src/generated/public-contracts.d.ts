// AUTO-GENERATED FILE. DO NOT EDIT MANUALLY.
// Source: packages/db/prisma/schema.prisma

import { z } from 'zod';
import {
  ProjectRowSchema,
  TaskRowSchema,
  ProjectNoteRowSchema,
  TaskNoteRowSchema,
} from './prisma-zod';
import type {
  Project,
  PostgrestProjectRow,
  ListProjectsResponse,
  CreateProjectResponse,
  Task,
  PostgrestTaskRow,
  ListTasksResponse,
  CreateTaskResponse,
  ProjectNote,
  PostgrestProjectNoteRow,
  ListProjectNotesResponse,
  CreateProjectNoteResponse,
  TaskNote,
  PostgrestTaskNoteRow,
  ListTaskNotesResponse,
  CreateTaskNoteResponse,
} from './public-types';

export declare const projectSchema: typeof ProjectRowSchema;
export declare const taskSchema: typeof TaskRowSchema;
export declare const projectNoteSchema: typeof ProjectNoteRowSchema;
export declare const taskNoteSchema: typeof TaskNoteRowSchema;

export declare const postgrestProjectRowSchema: z.ZodType<PostgrestProjectRow>;
export declare const postgrestProjectRowsSchema: z.ZodArray<typeof postgrestProjectRowSchema>;
export declare const listProjectsResponseSchema: z.ZodType<ListProjectsResponse>;
export declare const createProjectResponseSchema: z.ZodType<CreateProjectResponse>;
export declare function projectFromPostgrestRow(row: PostgrestProjectRow): Project;
export declare function parsePostgrestListProjectsResponse(input: unknown): ListProjectsResponse;
export declare function parsePostgrestCreateProjectResponse(input: unknown): CreateProjectResponse;

export declare const postgrestTaskRowSchema: z.ZodType<PostgrestTaskRow>;
export declare const postgrestTaskRowsSchema: z.ZodArray<typeof postgrestTaskRowSchema>;
export declare const listTasksResponseSchema: z.ZodType<ListTasksResponse>;
export declare const createTaskResponseSchema: z.ZodType<CreateTaskResponse>;
export declare function taskFromPostgrestRow(row: PostgrestTaskRow): Task;
export declare function parsePostgrestListTasksResponse(input: unknown): ListTasksResponse;
export declare function parsePostgrestCreateTaskResponse(input: unknown): CreateTaskResponse;

export declare const postgrestProjectNoteRowSchema: z.ZodType<PostgrestProjectNoteRow>;
export declare const postgrestProjectNoteRowsSchema: z.ZodArray<typeof postgrestProjectNoteRowSchema>;
export declare const listProjectNotesResponseSchema: z.ZodType<ListProjectNotesResponse>;
export declare const createProjectNoteResponseSchema: z.ZodType<CreateProjectNoteResponse>;
export declare function projectNoteFromPostgrestRow(row: PostgrestProjectNoteRow): ProjectNote;
export declare function parsePostgrestListProjectNotesResponse(input: unknown): ListProjectNotesResponse;
export declare function parsePostgrestCreateProjectNoteResponse(input: unknown): CreateProjectNoteResponse;

export declare const postgrestTaskNoteRowSchema: z.ZodType<PostgrestTaskNoteRow>;
export declare const postgrestTaskNoteRowsSchema: z.ZodArray<typeof postgrestTaskNoteRowSchema>;
export declare const listTaskNotesResponseSchema: z.ZodType<ListTaskNotesResponse>;
export declare const createTaskNoteResponseSchema: z.ZodType<CreateTaskNoteResponse>;
export declare function taskNoteFromPostgrestRow(row: PostgrestTaskNoteRow): TaskNote;
export declare function parsePostgrestListTaskNotesResponse(input: unknown): ListTaskNotesResponse;
export declare function parsePostgrestCreateTaskNoteResponse(input: unknown): CreateTaskNoteResponse;
