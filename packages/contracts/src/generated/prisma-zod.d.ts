// AUTO-GENERATED FILE. DO NOT EDIT MANUALLY.
// Source: packages/db/prisma/schema.prisma

import { z } from 'zod';

export declare const WorkStatusSchema: z.ZodEnum<['todo', 'started', 'active', 'done', 'dropped']>;

export declare const TaskRelationTypeSchema: z.ZodEnum<['blocked_by', 'has_subtask', 'related_to']>;

export declare const ProjectRowSchema: z.ZodType<ProjectRow>;
export declare const TaskRowSchema: z.ZodType<TaskRow>;
export declare const TaskRelationRowSchema: z.ZodType<TaskRelationRow>;
export declare const ProjectNoteRowSchema: z.ZodType<ProjectNoteRow>;
export declare const TaskNoteRowSchema: z.ZodType<TaskNoteRow>;

export declare const PrismaRowSchemas: {
  Project: typeof ProjectRowSchema;
  Task: typeof TaskRowSchema;
  TaskRelation: typeof TaskRelationRowSchema;
  ProjectNote: typeof ProjectNoteRowSchema;
  TaskNote: typeof TaskNoteRowSchema;
};

export type {
  ProjectRow,
  TaskRow,
  TaskRelationRow,
  ProjectNoteRow,
  TaskNoteRow,
} from './prisma-types';
