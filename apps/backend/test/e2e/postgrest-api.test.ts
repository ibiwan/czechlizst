import { beforeAll, describe, expect, it } from 'vitest';
import {
  canTransitionWorkStatus,
  workStatuses
} from '@app/contracts';

const BASE_URL = process.env.POSTGREST_BASE_URL ?? 'http://localhost:3002';

async function request(path: string, init?: RequestInit) {
  return fetch(`${BASE_URL}${path}`, init);
}

function uniqueName(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 100000)}`;
}

async function deleteProject(projectId: number) {
  await request(`/projects?id=eq.${projectId}`, {
    method: 'DELETE'
  });
}

describe('PostgREST API E2E', () => {
  beforeAll(async () => {
    const res = await request('/projects?select=*');
    if (!res.ok) {
      throw new Error(
        `PostgREST is unavailable at ${BASE_URL}. Start it with: npm run postgrest:start`
      );
    }
  });

  it('creates and reads projects', async () => {
    const projectName = uniqueName('project');
    let projectId: number | null = null;

    try {
      const create = await request('/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Prefer: 'return=representation'
        },
        body: JSON.stringify({ name: projectName })
      });

      expect(create.status).toBe(201);
      const createdPayload = (await create.json()) as Array<{
        id: number;
        name: string;
        created_at: string;
      }>;
      expect(createdPayload).toHaveLength(1);

      const project = createdPayload[0];
      projectId = project.id;
      expect(project.name).toBe(projectName);
      expect(typeof project.id).toBe('number');

      const read = await request(`/projects?id=eq.${project.id}&select=*`);
      expect(read.status).toBe(200);

      const readPayload = (await read.json()) as Array<{ id: number; name: string }>;
      expect(readPayload).toHaveLength(1);
      expect(readPayload[0].name).toBe(projectName);
    } finally {
      if (projectId !== null) {
        await deleteProject(projectId);
      }
    }
  });

  it('creates and reads tasks for a project', async () => {
    const projectName = uniqueName('task-project');
    const taskTitle = uniqueName('task');
    let projectId: number | null = null;

    try {
      const projectCreate = await request('/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Prefer: 'return=representation'
        },
        body: JSON.stringify({ name: projectName })
      });

      expect(projectCreate.status).toBe(201);
      const projectPayload = (await projectCreate.json()) as Array<{ id: number }>;
      projectId = projectPayload[0].id;

      const taskCreate = await request('/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Prefer: 'return=representation'
        },
        body: JSON.stringify({ project_id: projectId, title: taskTitle })
      });

      expect(taskCreate.status).toBe(201);
      const taskPayload = (await taskCreate.json()) as Array<{
        id: number;
        project_id: number;
        title: string;
        status: string;
        created_at: string;
      }>;

      expect(taskPayload).toHaveLength(1);
      expect(taskPayload[0].project_id).toBe(projectId);
      expect(taskPayload[0].title).toBe(taskTitle);
      expect(taskPayload[0].status).toBe('todo');

      const taskList = await request(`/tasks?project_id=eq.${projectId}&select=*`);
      expect(taskList.status).toBe(200);

      const listPayload = (await taskList.json()) as Array<{ title: string }>;
      expect(listPayload.some((task) => task.title === taskTitle)).toBe(true);
    } finally {
      if (projectId !== null) {
        await deleteProject(projectId);
      }
    }
  });

  it('creates and reads notes for projects and tasks', async () => {
    const projectName = uniqueName('notes-project');
    const taskTitle = uniqueName('notes-task');
    const projectNoteBody = uniqueName('project-note');
    const taskNoteBody = uniqueName('task-note');
    const projectNoteReference = uniqueName('project-note-ref');
    const taskNoteReference = uniqueName('task-note-ref');
    let projectId: number | null = null;
    let taskId: number | null = null;
    try {
      const projectCreate = await request('/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Prefer: 'return=representation'
        },
        body: JSON.stringify({ name: projectName })
      });
      expect(projectCreate.status).toBe(201);
      const projectPayload = (await projectCreate.json()) as Array<{ id: number }>;
      projectId = projectPayload[0].id;

      const taskCreate = await request('/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Prefer: 'return=representation'
        },
        body: JSON.stringify({ project_id: projectId, title: taskTitle })
      });
      expect(taskCreate.status).toBe(201);
      const taskPayload = (await taskCreate.json()) as Array<{ id: number }>;
      taskId = taskPayload[0].id;

      const projectNoteCreate = await request('/project_notes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Prefer: 'return=representation'
        },
        body: JSON.stringify({
          project_id: projectId,
          body: projectNoteBody,
          reference_url: projectNoteReference
        })
      });
      expect(projectNoteCreate.status).toBe(201);

      const taskNoteCreate = await request('/task_notes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Prefer: 'return=representation'
        },
        body: JSON.stringify({
          task_id: taskId,
          body: taskNoteBody,
          reference_url: taskNoteReference
        })
      });
      expect(taskNoteCreate.status).toBe(201);

      const projectNotesRead = await request(
        `/project_notes?project_id=eq.${projectId}&select=*`
      );
      expect(projectNotesRead.status).toBe(200);
      const projectNotesPayload = (await projectNotesRead.json()) as Array<{
        body: string;
        reference_url: string | null;
      }>;
      expect(projectNotesPayload.some((note) => note.body === projectNoteBody)).toBe(true);
      expect(
        projectNotesPayload.some((note) => note.reference_url === projectNoteReference)
      ).toBe(true);

      const taskNotesRead = await request(`/task_notes?task_id=eq.${taskId}&select=*`);
      expect(taskNotesRead.status).toBe(200);
      const taskNotesPayload = (await taskNotesRead.json()) as Array<{
        body: string;
        reference_url: string | null;
      }>;
      expect(taskNotesPayload.some((note) => note.body === taskNoteBody)).toBe(true);
      expect(
        taskNotesPayload.some((note) => note.reference_url === taskNoteReference)
      ).toBe(true);
    } finally {
      if (projectId !== null) {
        await deleteProject(projectId);
      }
    }
  });

  it('rejects invalid status transitions while allowing manual project status updates', async () => {
    const projectName = uniqueName('transition-project');
    const taskTitle = uniqueName('transition-task');
    let projectId: number | null = null;
    let taskId: number | null = null;

    try {
      const projectCreate = await request('/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Prefer: 'return=representation'
        },
        body: JSON.stringify({ name: projectName, status: 'todo' })
      });
      expect(projectCreate.status).toBe(201);
      const projectPayload = (await projectCreate.json()) as Array<{ id: number }>;
      projectId = projectPayload[0].id;

      const taskCreate = await request('/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Prefer: 'return=representation'
        },
        body: JSON.stringify({ project_id: projectId, title: taskTitle, status: 'todo' })
      });
      expect(taskCreate.status).toBe(201);
      const taskPayload = (await taskCreate.json()) as Array<{ id: number }>;
      taskId = taskPayload[0].id;

      const invalidTaskTransition = await request(`/tasks?id=eq.${taskId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Prefer: 'return=representation'
        },
        body: JSON.stringify({ status: 'done' })
      });
      expect(invalidTaskTransition.status).toBe(400);

      const validTaskTransition = await request(`/tasks?id=eq.${taskId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Prefer: 'return=representation'
        },
        body: JSON.stringify({ status: 'active' })
      });
      expect(validTaskTransition.status).toBe(200);

      const invalidProjectTransition = await request(`/projects?id=eq.${projectId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Prefer: 'return=representation'
        },
        body: JSON.stringify({ status: 'done' })
      });
      expect(invalidProjectTransition.status).toBe(400);

      const allowedProjectManualUpdate = await request(`/projects?id=eq.${projectId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Prefer: 'return=representation'
        },
        body: JSON.stringify({ status: 'active' })
      });
      expect(allowedProjectManualUpdate.status).toBe(200);
    } finally {
      if (projectId !== null) {
        await deleteProject(projectId);
      }
    }
  });

  it('matches task status transition behavior with contracts for every status pair', async () => {
    const projectName = uniqueName('parity-project');
    const taskTitle = uniqueName('parity-task');
    let projectId: number | null = null;

    try {
      const projectCreate = await request('/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Prefer: 'return=representation'
        },
        body: JSON.stringify({ name: projectName, status: 'todo' })
      });
      expect(projectCreate.status).toBe(201);
      const projectPayload = (await projectCreate.json()) as Array<{ id: number }>;
      projectId = projectPayload[0].id;

      for (const from of workStatuses) {
        for (const to of workStatuses) {
          const seedTask = await request('/tasks', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Prefer: 'return=representation'
            },
            body: JSON.stringify({
              project_id: projectId,
              title: `${taskTitle}-${from}-${to}`,
              status: from
            })
          });
          expect(seedTask.status).toBe(201);
          const seedPayload = (await seedTask.json()) as Array<{ id: number }>;
          const taskId = seedPayload[0].id;

          const expectedAllowed = canTransitionWorkStatus(from, to);
          const transition = await request(`/tasks?id=eq.${taskId}`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              Prefer: 'return=representation'
            },
            body: JSON.stringify({ status: to })
          });

          if (expectedAllowed) {
            expect(transition.status).toBe(200);
          } else {
            expect(transition.status).toBe(400);
          }

          await request(`/tasks?id=eq.${taskId}`, { method: 'DELETE' });
        }
      }
    } finally {
      if (projectId !== null) {
        await deleteProject(projectId);
      }
    }
  });
});
