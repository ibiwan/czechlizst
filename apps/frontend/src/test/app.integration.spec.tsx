import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { configureStore } from '@reduxjs/toolkit';
import { Provider } from 'react-redux';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import App from '../components/App';
import { api } from '../api';
import { mainPageReducer } from '../store/mainPageSlice';

type ProjectRow = {
  id: number;
  name: string;
  created_at: string;
  updated_at: string;
};

type TaskRow = {
  id: number;
  project_id: number;
  title: string;
  is_placeholder: boolean;
  status: 'todo' | 'started' | 'active' | 'done' | 'dropped';
  created_at: string;
  updated_at: string;
};

function createTestStore() {
  return configureStore({
    reducer: {
      mainPage: mainPageReducer,
      [api.reducerPath]: api.reducer
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(api.middleware)
  });
}

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json'
    }
  });
}

describe('App integration', () => {
  let fetchMock: { mockRestore: () => void };
  let requests: Array<{ method: string; pathname: string; search: string; body: string | null }>;

  beforeEach(() => {
    requests = [];
    const projects: ProjectRow[] = [
      {
        id: 1,
        name: 'Roadmap',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 2,
        name: 'Inbox',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ];
    let nextProjectId = projects.length + 1;
    let nextTaskId = 3;

    const tasksByProject = new Map<number, TaskRow[]>([
      [
        1,
        [
          {
            id: 1,
            project_id: 1,
            title: 'Ship v1',
            is_placeholder: false,
            status: 'todo',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        ]
      ],
      [
        2,
        [
          {
            id: 2,
            project_id: 2,
            title: '•',
            is_placeholder: true,
            status: 'todo',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        ]
      ]
    ]);

    fetchMock = vi
      .spyOn(globalThis, 'fetch')
      .mockImplementation(async (input, init) => {
        const reqUrl =
          typeof input === 'string'
            ? input
            : input instanceof URL
              ? input.toString()
              : input.url;

        const url = new URL(reqUrl);
        const method = init?.method ?? 'GET';
        const body = typeof init?.body === 'string' ? init.body : init?.body ? String(init.body) : null;

        requests.push({
          method,
          pathname: url.pathname,
          search: url.search,
          body
        });

        if (method === 'GET' && url.pathname === '/projects') {
          const limit = url.searchParams.get('limit');
          if (limit === '1') {
            return jsonResponse(projects.slice(0, 1));
          }
          return jsonResponse(projects);
        }

        if (method === 'POST' && url.pathname === '/projects') {
          const raw = init?.body ? String(init.body) : '{}';
          const body = JSON.parse(raw) as { name: string };
          const created: ProjectRow = {
            id: nextProjectId++,
            name: body.name,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };
          projects.push(created);
          return jsonResponse([created], 201);
        }

        if (method === 'GET' && url.pathname === '/tasks') {
          const eqValue = url.searchParams.get('project_id');
          const projectId = Number(eqValue?.replace('eq.', '') ?? '0');
          return jsonResponse(tasksByProject.get(projectId) ?? []);
        }

        if (method === 'POST' && url.pathname === '/tasks') {
          const raw = body ?? '{}';
          const payload = JSON.parse(raw) as { project_id: number; title: string; is_placeholder?: boolean };
          const created: TaskRow = {
            id: nextTaskId++,
            project_id: payload.project_id,
            title: payload.title,
            is_placeholder: payload.is_placeholder ?? false,
            status: 'todo',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };
          const existing = tasksByProject.get(payload.project_id) ?? [];
          tasksByProject.set(payload.project_id, [...existing, created]);
          return jsonResponse([created], 201);
        }

        if (method === 'DELETE' && url.pathname === '/tasks') {
          const eqValue = url.searchParams.get('id');
          const taskId = Number(eqValue?.replace('eq.', '') ?? '0');
          for (const [projectId, projectTasks] of tasksByProject.entries()) {
            const task = projectTasks.find((entry) => entry.id === taskId);
            if (!task) {
              continue;
            }
            tasksByProject.set(
              projectId,
              projectTasks.filter((entry) => entry.id !== taskId)
            );
            return jsonResponse([task], 200);
          }
          return jsonResponse([], 200);
        }

        return jsonResponse({ error: `Unhandled request: ${method} ${url.pathname}${url.search}` }, 404);
      });
  });

  afterEach(() => {
    fetchMock.mockRestore();
    cleanup();
  });

  it('loads health, projects, and tasks', async () => {
    const store = createTestStore();

    render(
      <Provider store={store}>
        <App />
      </Provider>
    );

    expect(await screen.findByText('Projects')).toBeInTheDocument();
    expect(await screen.findByTestId('project-name-1')).toBeInTheDocument();

    fireEvent.click(await screen.findByTestId('project-row-1'));

    expect(await screen.findByTestId('project-detail-title')).toBeInTheDocument();
    expect(
      await within(await screen.findByTestId('tasks-table')).findByTestId('task-title-1')
    ).toBeInTheDocument();
  });

  it('does not promote a placeholder task when it is only selected', async () => {
    const store = createTestStore();

    render(
      <Provider store={store}>
        <App />
      </Provider>
    );

    fireEvent.click(await screen.findByTestId('project-row-2'));

    const baselineRequestCount = requests.length;
    fireEvent.click(await screen.findByTestId('task-row-2'));

    const newRequests = requests.slice(baselineRequestCount);
    expect(
      newRequests.some(
        (request) =>
          request.method === 'PATCH' &&
          request.pathname === '/tasks' &&
          request.body?.includes('"is_placeholder":false') === true
      )
    ).toBe(false);
  });
});
