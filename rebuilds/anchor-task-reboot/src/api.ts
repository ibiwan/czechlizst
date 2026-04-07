import type { Task, TaskNote, TaskRelation, TaskRelationType, WorkStatus } from './types';
import { demoNotes, demoRelations, demoTasks } from './mockData';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3003';

type TaskRow = {
  id: number;
  title: string;
  status: WorkStatus;
  is_anchor: boolean | null;
  parent_task_id: number | null;
  created_at: string;
  updated_at: string;
};

type TaskNoteRow = {
  id: number;
  task_id: number;
  body: string;
  reference_url: string | null;
  created_at: string;
  updated_at: string;
};

type TaskRelationRow = {
  id: number;
  task_id: number;
  related_task_id: number;
  relation_type: TaskRelationType;
  commentary: string | null;
  created_at: string;
  updated_at: string;
};

type RequestOptions = {
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  body?: unknown;
  headers?: Record<string, string>;
};

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: options.method ?? 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    },
    body: options.body === undefined ? undefined : JSON.stringify(options.body)
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || `Request failed with ${response.status}`);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

function mapTask(row: TaskRow): Task {
  return {
    id: row.id,
    title: row.title,
    status: row.status,
    isAnchor: row.is_anchor,
    parentTaskId: row.parent_task_id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    notes: []
  };
}

function mapNote(row: TaskNoteRow): TaskNote {
  return {
    id: row.id,
    taskId: row.task_id,
    body: row.body,
    referenceUrl: row.reference_url,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function mapRelation(row: TaskRelationRow): TaskRelation {
  return {
    id: row.id,
    taskId: row.task_id,
    relatedTaskId: row.related_task_id,
    relationType: row.relation_type,
    commentary: row.commentary,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

export async function listTasks() {
  const rows = await request<TaskRow[]>('/tasks?select=*&order=id.asc');
  return rows.map(mapTask);
}

export async function listTaskNotes() {
  const rows = await request<TaskNoteRow[]>('/task_notes?select=*&order=id.asc');
  return rows.map(mapNote);
}

export async function listTaskRelations() {
  const rows = await request<TaskRelationRow[]>('/task_relations?select=*&order=id.asc');
  return rows.map(mapRelation);
}

export async function createTask(input: {
  title: string;
  status?: WorkStatus;
  isAnchor?: boolean | null;
  parentTaskId?: number | null;
}) {
  const rows = await request<TaskRow[]>('/tasks', {
    method: 'POST',
    body: {
      title: input.title,
      status: input.status ?? 'todo',
      is_anchor: input.isAnchor ?? null,
      parent_task_id: input.parentTaskId ?? null
    },
    headers: {
      Prefer: 'return=representation'
    }
  });

  return mapTask(rows[0]);
}

export async function updateTask(taskId: number, patch: Partial<{
  title: string;
  status: WorkStatus;
  isAnchor: boolean | null;
  parentTaskId: number | null;
}>) {
  const body: Record<string, unknown> = {};

  if (patch.title !== undefined) {
    body.title = patch.title;
  }

  if (patch.status !== undefined) {
    body.status = patch.status;
  }

  if (patch.isAnchor !== undefined) {
    body.is_anchor = patch.isAnchor;
  }

  if (patch.parentTaskId !== undefined) {
    body.parent_task_id = patch.parentTaskId;
  }

  const rows = await request<TaskRow[]>(`/tasks?id=eq.${taskId}`, {
    method: 'PATCH',
    body,
    headers: {
      Prefer: 'return=representation'
    }
  });

  return mapTask(rows[0]);
}

export async function createTaskNote(input: {
  taskId: number;
  body: string;
  referenceUrl: string | null;
}) {
  const rows = await request<TaskNoteRow[]>('/task_notes', {
    method: 'POST',
    body: {
      task_id: input.taskId,
      body: input.body,
      reference_url: input.referenceUrl
    },
    headers: {
      Prefer: 'return=representation'
    }
  });

  return mapNote(rows[0]);
}

export async function createTaskRelation(input: {
  taskId: number;
  relatedTaskId: number;
  relationType: TaskRelationType;
  commentary: string | null;
}) {
  const rows = await request<TaskRelationRow[]>('/task_relations', {
    method: 'POST',
    body: {
      task_id: input.taskId,
      related_task_id: input.relatedTaskId,
      relation_type: input.relationType,
      commentary: input.commentary
    },
    headers: {
      Prefer: 'return=representation'
    }
  });

  return mapRelation(rows[0]);
}

export async function deleteTask(taskId: number) {
  await request<void>(`/tasks?id=eq.${taskId}`, {
    method: 'DELETE'
  });
}

export async function deleteTaskNote(noteId: number) {
  await request<void>(`/task_notes?id=eq.${noteId}`, {
    method: 'DELETE'
  });
}

export async function deleteTaskRelation(relationId: number) {
  await request<void>(`/task_relations?id=eq.${relationId}`, {
    method: 'DELETE'
  });
}

export async function loadSnapshot() {
  const [tasks, notes, relations] = await Promise.all([
    listTasks(),
    listTaskNotes(),
    listTaskRelations()
  ]);

  return { tasks, notes, relations };
}

export async function seedDemoGraph() {
  const existing = await loadSnapshot();

  if (existing.tasks.length > 0 || existing.notes.length > 0 || existing.relations.length > 0) {
    throw new Error('Refusing to seed demo data into a non-empty reboot database.');
  }

  const idMap = new Map<number, number>();

  for (const task of demoTasks) {
    const created = await createTask({
      title: task.title,
      status: task.status,
      isAnchor: task.isAnchor,
      parentTaskId: task.parentTaskId == null ? null : idMap.get(task.parentTaskId) ?? null
    });

    idMap.set(task.id, created.id);
  }

  for (const note of demoNotes) {
    const taskId = idMap.get(note.taskId);

    if (!taskId) {
      continue;
    }

    await createTaskNote({
      taskId,
      body: note.body,
      referenceUrl: note.referenceUrl
    });
  }

  for (const relation of demoRelations) {
    const taskId = idMap.get(relation.taskId);
    const relatedTaskId = idMap.get(relation.relatedTaskId);

    if (!taskId || !relatedTaskId) {
      continue;
    }

    await createTaskRelation({
      taskId,
      relatedTaskId,
      relationType: relation.relationType,
      commentary: relation.commentary
    });
  }

  return loadSnapshot();
}

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomElement<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

const defaultRandomGraphOpts = {
  anchorCount: 3,
  maxDepth: 3,
  maxBranch: 2,
  noteProbability: 0.35,
  relationDensity: 0.15
};

export async function seedRandomGraph(opts?: Partial<typeof defaultRandomGraphOpts>) {
  const options = { ...defaultRandomGraphOpts, ...opts };

  const existing = await loadSnapshot();

  if (existing.tasks.length > 0 || existing.notes.length > 0 || existing.relations.length > 0) {
    throw new Error('Refusing to seed random graph into a non-empty reboot database.');
  }

  const allTasks = [] as { id: number; title: string }[];

  async function createSubtree(parentTaskId: number | null, depth: number) {
    if (depth > options.maxDepth) {
      return;
    }

    const branchCount = randomInt(0, options.maxBranch);

    for (let i = 0; i < branchCount; i += 1) {
      const title = `Random task ${parentTaskId ?? 'root'}-${depth}-${i + 1}`;
      const status = randomElement<import('./types').WorkStatus>([
        'todo',
        'started',
        'active',
        'done',
        'dropped'
      ]);

      const created = await createTask({
        title,
        status,
        isAnchor: false,
        parentTaskId
      });

      allTasks.push({ id: created.id, title: created.title });

      await createSubtree(created.id, depth + 1);
    }
  }

  for (let i = 0; i < options.anchorCount; i += 1) {
    const anchor = await createTask({
      title: `Random anchor ${i + 1}`,
      status: randomElement<import('./types').WorkStatus>([
        'todo',
        'started',
        'active',
        'done',
        'dropped'
      ]),
      isAnchor: true,
      parentTaskId: null
    });

    allTasks.push({ id: anchor.id, title: anchor.title });
    await createSubtree(anchor.id, 1);
  }

  const taskCount = allTasks.length;

  for (const task of allTasks) {
    if (Math.random() < options.noteProbability) {
      await createTaskNote({
        taskId: task.id,
        body: `Auto-generated note for ${task.title}`,
        referenceUrl: null
      });
    }
  }

  const relationTypes: import('./types').TaskRelationType[] = ['blocked_by', 'related_to'];
  const relationCount = Math.max(1, Math.floor(taskCount * options.relationDensity));

  for (let i = 0; i < relationCount; i += 1) {
    const from = randomElement(allTasks);
    const to = randomElement(allTasks.filter((candidate) => candidate.id !== from.id));

    if (!to) {
      continue;
    }

    await createTaskRelation({
      taskId: from.id,
      relatedTaskId: to.id,
      relationType: randomElement(relationTypes),
      commentary: `Auto-generated relation ${i + 1}`
    });
  }

  return loadSnapshot();
}
