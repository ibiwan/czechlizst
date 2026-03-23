import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import App from './App';
import type { Task, TaskNote, TaskRelation } from './types';

const apiMocks = vi.hoisted(() => ({
  loadSnapshot: vi.fn(),
  createTask: vi.fn(),
  createTaskNote: vi.fn(),
  createTaskRelation: vi.fn(),
  deleteTask: vi.fn(),
  deleteTaskNote: vi.fn(),
  deleteTaskRelation: vi.fn(),
  seedDemoGraph: vi.fn(),
  updateTask: vi.fn()
}));

vi.mock('./api', () => ({
  loadSnapshot: apiMocks.loadSnapshot,
  createTask: apiMocks.createTask,
  createTaskNote: apiMocks.createTaskNote,
  createTaskRelation: apiMocks.createTaskRelation,
  deleteTask: apiMocks.deleteTask,
  deleteTaskNote: apiMocks.deleteTaskNote,
  deleteTaskRelation: apiMocks.deleteTaskRelation,
  seedDemoGraph: apiMocks.seedDemoGraph,
  updateTask: apiMocks.updateTask
}));

function createSnapshot() {
  const now = '2026-03-22T10:00:00.000Z';

  const tasks: Task[] = [
    {
      id: 1,
      title: 'Alpha anchor',
      status: 'todo',
      isAnchor: true,
      parentTaskId: null,
      createdAt: now,
      updatedAt: now
    },
    {
      id: 2,
      title: 'Write API draft',
      status: 'started',
      isAnchor: false,
      parentTaskId: 1,
      createdAt: now,
      updatedAt: now
    },
    {
      id: 3,
      title: 'Build API',
      status: 'todo',
      isAnchor: false,
      parentTaskId: 1,
      createdAt: now,
      updatedAt: now
    },
    {
      id: 4,
      title: 'Build API docs',
      status: 'todo',
      isAnchor: false,
      parentTaskId: 3,
      createdAt: now,
      updatedAt: now
    },
    {
      id: 5,
      title: 'Beta anchor',
      status: 'active',
      isAnchor: true,
      parentTaskId: null,
      createdAt: now,
      updatedAt: now
    },
    {
      id: 6,
      title: 'Investigate auth blocker',
      status: 'todo',
      isAnchor: false,
      parentTaskId: 2,
      createdAt: now,
      updatedAt: now
    }
  ];

  const notes: TaskNote[] = [];
  const relations: TaskRelation[] = [
    {
      id: 1,
      taskId: 2,
      relatedTaskId: 6,
      relationType: 'blocked_by',
      commentary: null,
      createdAt: now,
      updatedAt: now
    }
  ];

  return { tasks, notes, relations };
}

describe('Anchor task reboot UI', () => {
  beforeEach(() => {
    const snapshot = createSnapshot();
    apiMocks.loadSnapshot.mockReset();
    apiMocks.loadSnapshot.mockResolvedValue(snapshot);
    apiMocks.createTask.mockReset();
    apiMocks.createTaskNote.mockReset();
    apiMocks.createTaskRelation.mockReset();
    apiMocks.deleteTask.mockReset();
    apiMocks.deleteTaskNote.mockReset();
    apiMocks.deleteTaskRelation.mockReset();
    apiMocks.seedDemoGraph.mockReset();
    apiMocks.updateTask.mockReset();
  });

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it('keeps pane 2 on the current branch when selecting a child, and only drills in on open', async () => {
    render(<App />);

    expect(await screen.findByTestId('anchor-row-1')).toBeInTheDocument();
    expect(await screen.findByTestId('anchor-row-5')).toBeInTheDocument();

    expect(await screen.findByTestId('pane-children-title')).toHaveTextContent(
      'Alpha anchor children'
    );

    const childrenPane = await screen.findByTestId('pane-children-list');
    expect(within(childrenPane).getByTestId('task-row-2')).toBeInTheDocument();
    expect(within(childrenPane).getByTestId('task-row-3')).toBeInTheDocument();
    expect(within(childrenPane).queryByTestId('task-row-4')).not.toBeInTheDocument();

    fireEvent.click(screen.getByTestId('task-select-3'));

    expect(await screen.findByTestId('task-detail-title-input')).toHaveValue('Build API');
    expect(screen.getByTestId('pane-children-title')).toHaveTextContent('Alpha anchor children');
    expect(within(childrenPane).getByTestId('task-row-2')).toBeInTheDocument();
    expect(within(childrenPane).getByTestId('task-row-3')).toBeInTheDocument();

    fireEvent.click(screen.getByTestId('task-open-3'));

    expect(await screen.findByTestId('pane-children-title')).toHaveTextContent(
      'Build API children'
    );
    expect(within(childrenPane).getByTestId('task-row-4')).toBeInTheDocument();
    expect(within(childrenPane).queryByTestId('task-row-2')).not.toBeInTheDocument();
  });
});
