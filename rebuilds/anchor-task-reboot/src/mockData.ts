import type { Task, TaskNote, TaskRelation } from './types';

export const demoTasks: Task[] = [
  // ── Anchor 1: Rebuild the planning app ─────────────────────────────────────
  {
    id: 1,
    title: 'Rebuild the planning app',
    status: 'active',
    isAnchor: true,
    parentTaskId: null,
    createdAt: '2026-03-01T10:00:00Z',
    updatedAt: '2026-03-22T16:40:00Z',
    notes: []
  },
  {
    id: 2,
    title: 'Collapse projects into anchor tasks',
    status: 'started',
    isAnchor: false,
    parentTaskId: 1,
    createdAt: '2026-03-10T11:00:00Z',
    updatedAt: '2026-03-22T16:35:00Z',
    notes: []
  },
  {
    id: 3,
    title: 'Move hierarchy into parent_task_id',
    status: 'todo',
    isAnchor: false,
    parentTaskId: 2,
    createdAt: '2026-03-11T11:00:00Z',
    updatedAt: '2026-03-22T15:30:00Z',
    notes: []
  },
  {
    id: 9,
    title: 'Write migration script',
    status: 'todo',
    isAnchor: false,
    parentTaskId: 3,
    createdAt: '2026-03-13T09:00:00Z',
    updatedAt: '2026-03-22T10:00:00Z',
    notes: []
  },
  {
    id: 10,
    title: 'Update PostgREST config for nested reads',
    status: 'todo',
    isAnchor: false,
    parentTaskId: 3,
    createdAt: '2026-03-13T10:00:00Z',
    updatedAt: '2026-03-22T10:05:00Z',
    notes: []
  },
  {
    id: 11,
    title: 'Verify 4-level deep queries work',
    status: 'todo',
    isAnchor: false,
    parentTaskId: 10,
    createdAt: '2026-03-14T09:00:00Z',
    updatedAt: '2026-03-22T10:10:00Z',
    notes: []
  },
  {
    id: 4,
    title: 'Sketch reboot DB behavior',
    status: 'done',
    isAnchor: false,
    parentTaskId: 2,
    createdAt: '2026-03-12T11:00:00Z',
    updatedAt: '2026-03-22T17:20:00Z',
    notes: []
  },
  {
    id: 12,
    title: 'Document anchor semantics',
    status: 'started',
    isAnchor: false,
    parentTaskId: 4,
    createdAt: '2026-03-13T11:00:00Z',
    updatedAt: '2026-03-22T17:00:00Z',
    notes: []
  },
  {
    id: 5,
    title: 'Write a runnable demo',
    status: 'started',
    isAnchor: false,
    parentTaskId: 1,
    createdAt: '2026-03-14T09:00:00Z',
    updatedAt: '2026-03-22T17:00:00Z',
    notes: []
  },
  {
    id: 6,
    title: 'Model left pane as anchor-only',
    status: 'todo',
    isAnchor: false,
    parentTaskId: 5,
    createdAt: '2026-03-15T09:00:00Z',
    updatedAt: '2026-03-22T15:50:00Z',
    notes: []
  },
  {
    id: 13,
    title: 'Anchor CRUD in UI',
    status: 'todo',
    isAnchor: false,
    parentTaskId: 6,
    createdAt: '2026-03-16T09:00:00Z',
    updatedAt: '2026-03-22T12:00:00Z',
    notes: []
  },
  {
    id: 14,
    title: 'Create anchor form',
    status: 'todo',
    isAnchor: false,
    parentTaskId: 13,
    createdAt: '2026-03-16T10:00:00Z',
    updatedAt: '2026-03-22T12:05:00Z',
    notes: []
  },
  {
    id: 15,
    title: 'Delete anchor with child cascade',
    status: 'todo',
    isAnchor: false,
    parentTaskId: 13,
    createdAt: '2026-03-16T10:30:00Z',
    updatedAt: '2026-03-22T12:10:00Z',
    notes: []
  },
  {
    id: 16,
    title: 'Build three-pane layout',
    status: 'active',
    isAnchor: false,
    parentTaskId: 5,
    createdAt: '2026-03-17T09:00:00Z',
    updatedAt: '2026-03-22T17:10:00Z',
    notes: []
  },
  {
    id: 17,
    title: 'Pane 1: anchor list',
    status: 'done',
    isAnchor: false,
    parentTaskId: 16,
    createdAt: '2026-03-17T10:00:00Z',
    updatedAt: '2026-03-22T14:00:00Z',
    notes: []
  },
  {
    id: 18,
    title: 'Pane 2: task navigation',
    status: 'started',
    isAnchor: false,
    parentTaskId: 16,
    createdAt: '2026-03-17T11:00:00Z',
    updatedAt: '2026-03-22T16:00:00Z',
    notes: []
  },
  {
    id: 19,
    title: 'Breadcrumb component',
    status: 'done',
    isAnchor: false,
    parentTaskId: 18,
    createdAt: '2026-03-18T09:00:00Z',
    updatedAt: '2026-03-22T13:00:00Z',
    notes: []
  },
  {
    id: 20,
    title: 'Pane 3: task detail',
    status: 'todo',
    isAnchor: false,
    parentTaskId: 16,
    createdAt: '2026-03-17T12:00:00Z',
    updatedAt: '2026-03-22T16:20:00Z',
    notes: []
  },

  // ── Anchor 7: Personal writing system ──────────────────────────────────────
  {
    id: 7,
    title: 'Personal writing system',
    status: 'started',
    isAnchor: true,
    parentTaskId: null,
    createdAt: '2026-03-05T08:00:00Z',
    updatedAt: '2026-03-21T18:00:00Z',
    notes: []
  },
  {
    id: 8,
    title: 'Archive long LLM conversations',
    status: 'active',
    isAnchor: false,
    parentTaskId: 7,
    createdAt: '2026-03-16T08:00:00Z',
    updatedAt: '2026-03-22T14:10:00Z',
    notes: []
  },
  {
    id: 21,
    title: 'Build conversation indexer',
    status: 'todo',
    isAnchor: false,
    parentTaskId: 8,
    createdAt: '2026-03-17T08:00:00Z',
    updatedAt: '2026-03-22T09:00:00Z',
    notes: []
  },
  {
    id: 22,
    title: 'Parse markdown exports',
    status: 'todo',
    isAnchor: false,
    parentTaskId: 21,
    createdAt: '2026-03-17T09:00:00Z',
    updatedAt: '2026-03-22T09:05:00Z',
    notes: []
  },
  {
    id: 23,
    title: 'Tag conversations by topic',
    status: 'todo',
    isAnchor: false,
    parentTaskId: 21,
    createdAt: '2026-03-17T09:30:00Z',
    updatedAt: '2026-03-22T09:10:00Z',
    notes: []
  },
  {
    id: 24,
    title: 'Search interface',
    status: 'todo',
    isAnchor: false,
    parentTaskId: 8,
    createdAt: '2026-03-18T08:00:00Z',
    updatedAt: '2026-03-22T09:15:00Z',
    notes: []
  },
  {
    id: 25,
    title: 'Full text search',
    status: 'todo',
    isAnchor: false,
    parentTaskId: 24,
    createdAt: '2026-03-18T09:00:00Z',
    updatedAt: '2026-03-22T09:20:00Z',
    notes: []
  },
  {
    id: 26,
    title: 'Filter by date range',
    status: 'todo',
    isAnchor: false,
    parentTaskId: 24,
    createdAt: '2026-03-18T09:30:00Z',
    updatedAt: '2026-03-22T09:25:00Z',
    notes: []
  },

  // ── Anchor: Home infrastructure ─────────────────────────────────────────────
  {
    id: 27,
    title: 'Home infrastructure',
    status: 'todo',
    isAnchor: true,
    parentTaskId: null,
    createdAt: '2026-03-08T08:00:00Z',
    updatedAt: '2026-03-20T12:00:00Z',
    notes: []
  },
  {
    id: 28,
    title: 'Network setup',
    status: 'started',
    isAnchor: false,
    parentTaskId: 27,
    createdAt: '2026-03-09T08:00:00Z',
    updatedAt: '2026-03-20T13:00:00Z',
    notes: []
  },
  {
    id: 29,
    title: 'Replace router',
    status: 'started',
    isAnchor: false,
    parentTaskId: 28,
    createdAt: '2026-03-09T09:00:00Z',
    updatedAt: '2026-03-20T14:00:00Z',
    notes: []
  },
  {
    id: 30,
    title: 'Research mesh options',
    status: 'done',
    isAnchor: false,
    parentTaskId: 29,
    createdAt: '2026-03-09T10:00:00Z',
    updatedAt: '2026-03-15T10:00:00Z',
    notes: []
  },
  {
    id: 31,
    title: 'Order hardware',
    status: 'active',
    isAnchor: false,
    parentTaskId: 29,
    createdAt: '2026-03-10T10:00:00Z',
    updatedAt: '2026-03-20T10:00:00Z',
    notes: []
  },
  {
    id: 32,
    title: 'Set up VLANs',
    status: 'todo',
    isAnchor: false,
    parentTaskId: 28,
    createdAt: '2026-03-11T08:00:00Z',
    updatedAt: '2026-03-20T11:00:00Z',
    notes: []
  },
  {
    id: 33,
    title: 'Guest network VLAN',
    status: 'todo',
    isAnchor: false,
    parentTaskId: 32,
    createdAt: '2026-03-11T09:00:00Z',
    updatedAt: '2026-03-20T11:05:00Z',
    notes: []
  },
  {
    id: 34,
    title: 'IoT isolation VLAN',
    status: 'todo',
    isAnchor: false,
    parentTaskId: 32,
    createdAt: '2026-03-11T09:30:00Z',
    updatedAt: '2026-03-20T11:10:00Z',
    notes: []
  },
  {
    id: 35,
    title: 'NAS backup',
    status: 'todo',
    isAnchor: false,
    parentTaskId: 27,
    createdAt: '2026-03-12T08:00:00Z',
    updatedAt: '2026-03-20T12:30:00Z',
    notes: []
  },
  {
    id: 36,
    title: 'Configure rsync jobs',
    status: 'todo',
    isAnchor: false,
    parentTaskId: 35,
    createdAt: '2026-03-12T09:00:00Z',
    updatedAt: '2026-03-20T12:35:00Z',
    notes: []
  },
  {
    id: 37,
    title: 'Offsite backup to cloud',
    status: 'todo',
    isAnchor: false,
    parentTaskId: 35,
    createdAt: '2026-03-12T09:30:00Z',
    updatedAt: '2026-03-20T12:40:00Z',
    notes: []
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
  },
  {
    id: 4,
    taskId: 11,
    body: 'PostgREST resource embedding needs explicit foreign key hints for self-referential tables.',
    referenceUrl: null,
    createdAt: '2026-03-14T11:00:00Z',
    updatedAt: '2026-03-22T10:10:00Z'
  },
  {
    id: 5,
    taskId: 31,
    body: 'Eero Pro 6E looks like the right call. Three-pack covers the whole house.',
    referenceUrl: null,
    createdAt: '2026-03-15T14:00:00Z',
    updatedAt: '2026-03-20T10:00:00Z'
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
  },
  {
    id: 4,
    taskId: 32,
    relatedTaskId: 29,
    relationType: 'blocked_by',
    commentary: 'New router needs to be in place before VLAN config.',
    createdAt: '2026-03-20T11:00:00Z',
    updatedAt: '2026-03-22T11:00:00Z'
  },
  {
    id: 5,
    taskId: 25,
    relatedTaskId: 22,
    relationType: 'blocked_by',
    commentary: 'Can\'t search what hasn\'t been parsed yet.',
    createdAt: '2026-03-20T12:00:00Z',
    updatedAt: '2026-03-22T12:00:00Z'
  }
];
