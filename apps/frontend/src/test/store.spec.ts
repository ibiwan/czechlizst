import { afterEach, describe, expect, it, vi } from 'vitest';
import { api } from '../api';
import { store } from '../store/store';

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json'
    }
  });
}

afterEach(() => {
  store.dispatch(api.util.resetApiState());
  vi.restoreAllMocks();
});

describe('store', () => {
  it('registers api reducer state', () => {
    const state = store.getState();
    expect(state).toHaveProperty(api.reducerPath);
  });

  it('runs api middleware for listProjects query', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      jsonResponse([
        {
          id: 1,
          name: 'Roadmap',
          status: 'todo',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ])
    );

    const result = await store.dispatch(api.endpoints.listProjects.initiate());

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect('data' in result).toBe(true);
    if ('data' in result && result.data) {
      expect(result.data.projects[0].name).toBe('Roadmap');
    }
  });

  it('maps PostgREST not-found object errors to 404 for project status updates', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      jsonResponse(
        {
          code: 'PGRST116',
          details: 'The result contains 0 rows',
          message: 'Cannot coerce the result to a single JSON object'
        },
        406
      )
    );

    const result = await store.dispatch(
      api.endpoints.updateProjectStatus.initiate({
        projectId: 999_999,
        status: 'active'
      })
    );

    expect('error' in result).toBe(true);
    if ('error' in result) {
      expect(result.error).toMatchObject({
        status: 404,
        message: 'Project not found'
      });
    }
  });

  it('maps PostgREST not-found object errors to 404 for task status updates', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      jsonResponse(
        {
          code: 'PGRST116',
          details: 'The result contains 0 rows',
          message: 'Cannot coerce the result to a single JSON object'
        },
        406
      )
    );

    const result = await store.dispatch(
      api.endpoints.updateTaskStatus.initiate({
        taskId: 999_999,
        projectId: 1,
        status: 'active'
      })
    );

    expect('error' in result).toBe(true);
    if ('error' in result) {
      expect(result.error).toMatchObject({
        status: 404,
        message: 'Task not found'
      });
    }
  });
});
