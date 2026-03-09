import { type WorkStatus } from '@app/contracts';

export type ProjectView = {
  id: number;
  name: string;
  status: WorkStatus;
  createdAt: string;
};

export type TaskView = {
  id: number;
  title: string;
  status: WorkStatus;
  createdAt: string;
};

export type NoteView = {
  id: number;
  body: string;
  createdAt: string;
};
