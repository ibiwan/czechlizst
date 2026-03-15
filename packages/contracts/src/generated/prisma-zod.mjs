// AUTO-GENERATED FILE. DO NOT EDIT MANUALLY.
// Source: packages/db/prisma/schema.prisma

import { z } from 'zod';

export const WorkStatusSchema = z.enum(['todo', 'started', 'active', 'blocked', 'done', 'dropped']);

export const ProjectRowSchema = z.object({
  id: z.number().int(),
  name: z.string(),
  status: WorkStatusSchema,
  createdAt: z.string().datetime(),
});

export const TaskRowSchema = z.object({
  id: z.number().int(),
  projectId: z.number().int(),
  title: z.string(),
  status: WorkStatusSchema,
  createdAt: z.string().datetime(),
});

export const ProjectNoteRowSchema = z.object({
  id: z.number().int(),
  projectId: z.number().int(),
  body: z.string(),
  referenceUrl: z.string().nullable(),
  createdAt: z.string().datetime(),
});

export const TaskNoteRowSchema = z.object({
  id: z.number().int(),
  taskId: z.number().int(),
  body: z.string(),
  referenceUrl: z.string().nullable(),
  createdAt: z.string().datetime(),
});

export const PrismaRowSchemas = {
  Project: ProjectRowSchema,
  Task: TaskRowSchema,
  ProjectNote: ProjectNoteRowSchema,
  TaskNote: TaskNoteRowSchema,
};
