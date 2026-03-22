// AUTO-GENERATED FILE. DO NOT EDIT MANUALLY.
// Source: packages/db/prisma/schema.prisma

export type ProjectRowModelData = {
  id: number;
  name: string;
  createdAt: string;
  updatedAt: string;
};

export declare class ProjectRowModel {
  constructor(data: ProjectRowModelData);
  id: number;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export type ProjectPostgrestRowData = {
  id: number;
  name: string;
  created_at: string;
  updated_at: string;
};

export declare class ProjectPostgrestRow {
  constructor(data: ProjectPostgrestRowData);
  id: number;
  name: string;
  created_at: string;
  updated_at: string;
}

export type TaskRowModelData = {
  id: number;
  projectId: number;
  title: string;
  isPlaceholder: boolean;
  status: 'todo' | 'started' | 'active' | 'done' | 'dropped';
  createdAt: string;
  updatedAt: string;
};

export declare class TaskRowModel {
  constructor(data: TaskRowModelData);
  id: number;
  projectId: number;
  title: string;
  isPlaceholder: boolean;
  status: 'todo' | 'started' | 'active' | 'done' | 'dropped';
  createdAt: string;
  updatedAt: string;
}

export type TaskPostgrestRowData = {
  id: number;
  project_id: number;
  title: string;
  is_placeholder: boolean;
  status: 'todo' | 'started' | 'active' | 'done' | 'dropped';
  created_at: string;
  updated_at: string;
};

export declare class TaskPostgrestRow {
  constructor(data: TaskPostgrestRowData);
  id: number;
  project_id: number;
  title: string;
  is_placeholder: boolean;
  status: 'todo' | 'started' | 'active' | 'done' | 'dropped';
  created_at: string;
  updated_at: string;
}

export type TaskRelationRowModelData = {
  id: number;
  taskId: number;
  relatedTaskId: number;
  relationType: 'blocked_by' | 'has_subtask' | 'related_to';
  commentary: string | null;
  createdAt: string;
  updatedAt: string;
};

export declare class TaskRelationRowModel {
  constructor(data: TaskRelationRowModelData);
  id: number;
  taskId: number;
  relatedTaskId: number;
  relationType: 'blocked_by' | 'has_subtask' | 'related_to';
  commentary: string | null;
  createdAt: string;
  updatedAt: string;
}

export type TaskRelationPostgrestRowData = {
  id: number;
  task_id: number;
  related_task_id: number;
  relation_type: 'blocked_by' | 'has_subtask' | 'related_to';
  commentary: string | null;
  created_at: string;
  updated_at: string;
};

export declare class TaskRelationPostgrestRow {
  constructor(data: TaskRelationPostgrestRowData);
  id: number;
  task_id: number;
  related_task_id: number;
  relation_type: 'blocked_by' | 'has_subtask' | 'related_to';
  commentary: string | null;
  created_at: string;
  updated_at: string;
}

export type ProjectNoteRowModelData = {
  id: number;
  projectId: number;
  body: string;
  referenceUrl: string | null;
  createdAt: string;
  updatedAt: string;
};

export declare class ProjectNoteRowModel {
  constructor(data: ProjectNoteRowModelData);
  id: number;
  projectId: number;
  body: string;
  referenceUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export type ProjectNotePostgrestRowData = {
  id: number;
  project_id: number;
  body: string;
  reference_url: string | null;
  created_at: string;
  updated_at: string;
};

export declare class ProjectNotePostgrestRow {
  constructor(data: ProjectNotePostgrestRowData);
  id: number;
  project_id: number;
  body: string;
  reference_url: string | null;
  created_at: string;
  updated_at: string;
}

export type TaskNoteRowModelData = {
  id: number;
  taskId: number;
  body: string;
  referenceUrl: string | null;
  createdAt: string;
  updatedAt: string;
};

export declare class TaskNoteRowModel {
  constructor(data: TaskNoteRowModelData);
  id: number;
  taskId: number;
  body: string;
  referenceUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export type TaskNotePostgrestRowData = {
  id: number;
  task_id: number;
  body: string;
  reference_url: string | null;
  created_at: string;
  updated_at: string;
};

export declare class TaskNotePostgrestRow {
  constructor(data: TaskNotePostgrestRowData);
  id: number;
  task_id: number;
  body: string;
  reference_url: string | null;
  created_at: string;
  updated_at: string;
}
