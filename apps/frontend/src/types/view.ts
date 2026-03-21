import { type WorkStatus } from '@app/contracts';

export type ProjectView = {
  id: number;
  name: string;
  createdAt: string;
  updatedAt: string;
};

export type TaskView = {
  id: number;
  projectId: number;
  title: string;
  isPlaceholder: boolean;
  status: WorkStatus;
  createdAt: string;
  updatedAt: string;
};

export type NoteView = {
  id: number;
  body: string;
  referenceUrl: string | null;
  createdAt: string;
  updatedAt: string;
};
