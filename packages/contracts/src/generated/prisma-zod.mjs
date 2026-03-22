// AUTO-GENERATED FILE. DO NOT EDIT MANUALLY.
// Source: packages/db/prisma/schema.prisma

import { z } from 'zod';

export const WorkStatusSchema = z.enum(['todo', 'started', 'active', 'done', 'dropped']);

export const TaskRelationTypeSchema = z.enum(['blocked_by', 'has_subtask', 'related_to']);

export const ProjectRowSchema = z.object({
  id: z.number().int(),
  name: z.string(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const TaskRowSchema = z.object({
  id: z.number().int(),
  projectId: z.number().int(),
  title: z.string(),
  isPlaceholder: z.boolean(),
  status: WorkStatusSchema,
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const TaskRelationRowSchema = z.object({
  id: z.number().int(),
  taskId: z.number().int(),
  relatedTaskId: z.number().int(),
  relationType: TaskRelationTypeSchema,
  commentary: z.string().nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const ProjectNoteRowSchema = z.object({
  id: z.number().int(),
  projectId: z.number().int(),
  body: z.string(),
  referenceUrl: z.string().nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const TaskNoteRowSchema = z.object({
  id: z.number().int(),
  taskId: z.number().int(),
  body: z.string(),
  referenceUrl: z.string().nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const PrismaRowSchemas = {
  Project: ProjectRowSchema,
  Task: TaskRowSchema,
  TaskRelation: TaskRelationRowSchema,
  ProjectNote: ProjectNoteRowSchema,
  TaskNote: TaskNoteRowSchema,
};
