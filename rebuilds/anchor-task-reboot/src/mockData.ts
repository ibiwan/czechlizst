import type { Task, TaskNote, TaskRelation } from './types';

export const demoTasks: Task[] = [
  {
    id: 1,
    title: 'Rebuild the planning app',
    status: 'active',
    isAnchor: true,
    parentTaskId: null,
    createdAt: '2026-03-01T10:00:00Z',
    updatedAt: '2026-03-22T16:40:00Z'
  },
  {
    id: 2,
    title: 'Collapse projects into anchor tasks',
    status: 'started',
    isAnchor: false,
    parentTaskId: 1,
    createdAt: '2026-03-10T11:00:00Z',
    updatedAt: '2026-03-22T16:35:00Z'
  },
  {
    id: 3,
    title: 'Move hierarchy into parent_task_id',
    status: 'todo',
    isAnchor: false,
    parentTaskId: 2,
    createdAt: '2026-03-11T11:00:00Z',
    updatedAt: '2026-03-22T15:30:00Z'
  },
  {
    id: 4,
    title: 'Sketch reboot DB behavior',
    status: 'done',
    isAnchor: false,
    parentTaskId: 2,
    createdAt: '2026-03-12T11:00:00Z',
    updatedAt: '2026-03-22T17:20:00Z'
  },
  {
    id: 5,
    title: 'Write a runnable demo',
    status: 'started',
    isAnchor: false,
    parentTaskId: 1,
    createdAt: '2026-03-14T09:00:00Z',
    updatedAt: '2026-03-22T17:00:00Z'
  },
  {
    id: 6,
    title: 'Model left pane as anchor-only',
    status: 'todo',
    isAnchor: false,
    parentTaskId: 5,
    createdAt: '2026-03-15T09:00:00Z',
    updatedAt: '2026-03-22T15:50:00Z'
  },
  {
    id: 7,
    title: 'Personal writing system',
    status: 'started',
    isAnchor: true,
    parentTaskId: null,
    createdAt: '2026-03-05T08:00:00Z',
    updatedAt: '2026-03-21T18:00:00Z'
  },
  {
    id: 8,
    title: 'Archive long LLM conversations',
    status: 'active',
    isAnchor: false,
    parentTaskId: 7,
    createdAt: '2026-03-16T08:00:00Z',
    updatedAt: '2026-03-22T14:10:00Z'
  }
];

export const demoNotes: TaskNote[] = [
  {
    id: 1,
    taskId: 1,
    body: 'Anchor task standing in for the old project shell.',
    referenceUrl: null,
    createdAt: '2026-03-03T10:00:00Z',
    updatedAt: '2026-03-22T16:30:00Z'
  },
  {
    id: 2,
    taskId: 3,
    body: 'Parent chain should own breadcrumbs and recency propagation.',
    referenceUrl: null,
    createdAt: '2026-03-11T12:00:00Z',
    updatedAt: '2026-03-21T13:30:00Z'
  },
  {
    id: 3,
    taskId: 8,
    body: 'Reference field can hold large pasted transcripts.',
    referenceUrl: 'Long-form conversation snippets and source material go here.',
    createdAt: '2026-03-16T10:00:00Z',
    updatedAt: '2026-03-22T14:10:00Z'
  }
];

export const demoRelations: TaskRelation[] = [
  {
    id: 1,
    taskId: 5,
    relatedTaskId: 4,
    relationType: 'blocked_by',
    commentary: 'Need the DB semantics written down before the demo hardens.',
    createdAt: '2026-03-20T09:00:00Z',
    updatedAt: '2026-03-22T09:00:00Z'
  },
  {
    id: 2,
    taskId: 6,
    relatedTaskId: 3,
    relationType: 'related_to',
    commentary: 'UI pane semantics depend on the same parent-chain choice.',
    createdAt: '2026-03-20T10:00:00Z',
    updatedAt: '2026-03-22T10:00:00Z'
  },
  {
    id: 3,
    taskId: 8,
    relatedTaskId: 5,
    relationType: 'related_to',
    commentary: 'Same broad reboot theme, different anchor.',
    createdAt: '2026-03-20T10:30:00Z',
    updatedAt: '2026-03-22T11:00:00Z'
  }
];
