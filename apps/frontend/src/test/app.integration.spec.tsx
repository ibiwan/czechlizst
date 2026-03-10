import { render, screen } from '@testing-library/react';
import { configureStore } from '@reduxjs/toolkit';
import { Provider } from 'react-redux';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import App from '../App';
import { api } from '../api';
import { mainPageReducer } from '../mainPageSlice';

type ProjectRow = {
  id: number;
  name: string;
  status: 'todo' | 'started' | 'active' | 'blocked' | 'done' | 'dropped';
  created_at: string;
};

type TaskRow = {
  id: number;
  project_id: number;
  title: string;
  status: 'todo' | 'started' | 'active' | 'blocked' | 'done' | 'dropped';
  created_at: string;
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

  beforeEach(() => {
    const projects: ProjectRow[] = [
      {
        id: 1,
        name: 'Roadmap',
        status: 'todo',
        created_at: new Date().toISOString()
      }
    ];
    let nextProjectId = projects.length + 1;

    const tasksByProject = new Map<number, TaskRow[]>([
      [
        1,
        [
          {
            id: 1,
            project_id: 1,
            title: 'Ship v1',
            status: 'todo',
            created_at: new Date().toISOString()
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
            status: 'todo',
            created_at: new Date().toISOString()
          };
          projects.push(created);
          return jsonResponse([created], 201);
        }

        if (method === 'GET' && url.pathname === '/tasks') {
          const eqValue = url.searchParams.get('project_id');
          const projectId = Number(eqValue?.replace('eq.', '') ?? '0');
          return jsonResponse(tasksByProject.get(projectId) ?? []);
        }

        return jsonResponse({ error: `Unhandled request: ${method} ${url.pathname}${url.search}` }, 404);
      });
  });

  afterEach(() => {
    fetchMock.mockRestore();
  });

  it('loads health, projects, and tasks', async () => {
    const store = createTestStore();

    render(
      <Provider store={store}>
        <App />
      </Provider>
    );

    expect(await screen.findByText('Projects')).toBeInTheDocument();
    expect(await screen.findByText('Roadmap')).toBeInTheDocument();
    expect(await screen.findByText('Ship v1')).toBeInTheDocument();
  });
});
