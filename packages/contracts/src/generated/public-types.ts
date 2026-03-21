// AUTO-GENERATED FILE. DO NOT EDIT MANUALLY.
// Source: packages/db/prisma/schema.prisma

import type {
  ProjectRow,
  TaskRow,
  TaskBlockerRow,
  ProjectNoteRow,
  TaskNoteRow,
} from './prisma-types';

import type {
  ProjectRowModelData,
  ProjectPostgrestRowData,
  TaskRowModelData,
  TaskPostgrestRowData,
  TaskBlockerRowModelData,
  TaskBlockerPostgrestRowData,
  ProjectNoteRowModelData,
  ProjectNotePostgrestRowData,
  TaskNoteRowModelData,
  TaskNotePostgrestRowData,
} from './prisma-classes';

export type WorkStatus = 'todo' | 'started' | 'active' | 'done' | 'dropped';

export type Project = ProjectRow;
export type Task = TaskRow;
export type TaskBlocker = TaskBlockerRow;
export type ProjectNote = ProjectNoteRow;
export type TaskNote = TaskNoteRow;

export type PostgrestProjectRow = Omit<ProjectPostgrestRowData, 'updated_at'> & {
  id: number;
  name: string;
  status: 'todo' | 'started' | 'active' | 'done' | 'dropped';
  created_at: string;
  updated_at?: string;
};
export type PostgrestTaskRow = Omit<TaskPostgrestRowData, 'updated_at'> & {
  id: number;
  project_id: number;
  title: string;
  status: 'todo' | 'started' | 'active' | 'done' | 'dropped';
  created_at: string;
  updated_at?: string;
};
export type PostgrestTaskBlockerRow = Omit<TaskBlockerPostgrestRowData, 'updated_at'> & {
  id: number;
  task_id: number;
  blocking_task_id: number;
  created_at: string;
  updated_at?: string;
};
export type PostgrestProjectNoteRow = Omit<ProjectNotePostgrestRowData, 'updated_at'> & {
  id: number;
  project_id: number;
  body: string;
  reference_url: string | null;
  created_at: string;
  updated_at?: string;
};
export type PostgrestTaskNoteRow = Omit<TaskNotePostgrestRowData, 'updated_at'> & {
  id: number;
  task_id: number;
  body: string;
  reference_url: string | null;
  created_at: string;
  updated_at?: string;
};

export type CreateProjectResponse = { project: Project };
export type ListProjectsResponse = { projects: Project[] };
export type CreateTaskResponse = { task: Task };
export type ListTasksResponse = { tasks: Task[] };
export type CreateTaskBlockerResponse = { taskBlocker: TaskBlocker };
export type ListTaskBlockersResponse = { taskBlockers: TaskBlocker[] };
export type CreateProjectNoteResponse = { note: ProjectNote };
export type ListProjectNotesResponse = { notes: ProjectNote[] };
export type CreateTaskNoteResponse = { note: TaskNote };
export type ListTaskNotesResponse = { notes: TaskNote[] };

export type CreateProjectBody = { name: string };
export type UpdateProjectBody = { name?: string; status?: WorkStatus };
export type UpdateProjectStatusBody = { status: WorkStatus };
export type CreateTaskBody = { title: string };
export type UpdateTaskBody = { title?: string; status?: WorkStatus };
export type UpdateTaskStatusBody = { status: WorkStatus };
export type CreateProjectNoteBody = { body: string; reference_url?: string | null };
export type UpdateProjectNoteBody = { body: string; reference_url?: string | null };
export type CreateTaskNoteBody = { body: string; reference_url?: string | null };
export type UpdateTaskNoteBody = { body: string; reference_url?: string | null };

export type HealthResponse = { ok: boolean };
