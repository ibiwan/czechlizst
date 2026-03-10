// AUTO-GENERATED FILE. DO NOT EDIT MANUALLY.
// Source: packages/db/prisma/schema.prisma

const { z } = require('zod');

const WorkStatusSchema = z.enum(['todo', 'started', 'active', 'blocked', 'done', 'dropped']);

const ProjectRowSchema = z.object({
  id: z.number().int(),
  name: z.string(),
  status: WorkStatusSchema,
  createdAt: z.string().datetime(),
});

const TaskRowSchema = z.object({
  id: z.number().int(),
  projectId: z.number().int(),
  title: z.string(),
  status: WorkStatusSchema,
  createdAt: z.string().datetime(),
});

const ProjectNoteRowSchema = z.object({
  id: z.number().int(),
  projectId: z.number().int(),
  body: z.string(),
  createdAt: z.string().datetime(),
});

const TaskNoteRowSchema = z.object({
  id: z.number().int(),
  taskId: z.number().int(),
  body: z.string(),
  createdAt: z.string().datetime(),
});

const PrismaRowSchemas = {
  Project: ProjectRowSchema,
  Task: TaskRowSchema,
  ProjectNote: ProjectNoteRowSchema,
  TaskNote: TaskNoteRowSchema,
};

module.exports = {
  WorkStatusSchema,
  ProjectRowSchema,
  TaskRowSchema,
  ProjectNoteRowSchema,
  TaskNoteRowSchema,
  PrismaRowSchemas
};
