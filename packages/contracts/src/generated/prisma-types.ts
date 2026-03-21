// AUTO-GENERATED FILE. DO NOT EDIT MANUALLY.
// Source: packages/db/prisma/schema.prisma

export type ProjectRow = {
  id: number;
  name: string;
  createdAt: string;
  updatedAt: string;
};

export type TaskRow = {
  id: number;
  projectId: number;
  title: string;
  isPlaceholder: boolean;
  status: 'todo' | 'started' | 'active' | 'done' | 'dropped';
  createdAt: string;
  updatedAt: string;
};

export type TaskBlockerRow = {
  id: number;
  taskId: number;
  blockingTaskId: number;
  createdAt: string;
  updatedAt: string;
};

export type ProjectNoteRow = {
  id: number;
  projectId: number;
  body: string;
  referenceUrl: string | null;
  createdAt: string;
  updatedAt: string;
};

export type TaskNoteRow = {
  id: number;
  taskId: number;
  body: string;
  referenceUrl: string | null;
  createdAt: string;
  updatedAt: string;
};

export type PrismaRowModels = {
  Project: ProjectRow;
  Task: TaskRow;
  TaskBlocker: TaskBlockerRow;
  ProjectNote: ProjectNoteRow;
  TaskNote: TaskNoteRow;
};
