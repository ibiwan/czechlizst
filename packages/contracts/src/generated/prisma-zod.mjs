// AUTO-GENERATED FILE. DO NOT EDIT MANUALLY.
// Source: packages/db/prisma/schema.prisma

import { z } from 'zod';

export const WorkStatusSchema = z.enum(['todo', 'started', 'active', 'done', 'dropped']);

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

export const TaskBlockerRowSchema = z.object({
  id: z.number().int(),
  taskId: z.number().int(),
  blockingTaskId: z.number().int(),
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
  TaskBlocker: TaskBlockerRowSchema,
  ProjectNote: ProjectNoteRowSchema,
  TaskNote: TaskNoteRowSchema,
};
