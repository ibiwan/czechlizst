export type WorkStatus = 'todo' | 'started' | 'active' | 'done' | 'dropped';

export type TaskRelationType = 'blocked_by' | 'related_to';

export type Task = {
  id: number;
  title: string;
  status: WorkStatus;
  isAnchor: boolean | null;
  parentTaskId: number | null;
  createdAt: string;
  updatedAt: string;
};

export type TaskNote = {
  id: number;
  taskId: number;
  body: string;
  referenceUrl: string | null;
  createdAt: string;
  updatedAt: string;
};

export type TaskRelation = {
  id: number;
  taskId: number;
  relatedTaskId: number;
  relationType: TaskRelationType;
  commentary: string | null;
  createdAt: string;
  updatedAt: string;
};
