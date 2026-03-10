// AUTO-GENERATED FILE. DO NOT EDIT MANUALLY.
// Source: packages/db/prisma/schema.prisma

export type ProjectRow = {
  id: number;
  name: string;
  status: 'todo' | 'started' | 'active' | 'blocked' | 'done' | 'dropped';
  createdAt: string;
};

export type TaskRow = {
  id: number;
  projectId: number;
  title: string;
  status: 'todo' | 'started' | 'active' | 'blocked' | 'done' | 'dropped';
  createdAt: string;
};

export type ProjectNoteRow = {
  id: number;
  projectId: number;
  body: string;
  createdAt: string;
};

export type TaskNoteRow = {
  id: number;
  taskId: number;
  body: string;
  createdAt: string;
};

export type PrismaRowModels = {
  Project: ProjectRow;
  Task: TaskRow;
  ProjectNote: ProjectNoteRow;
  TaskNote: TaskNoteRow;
};
