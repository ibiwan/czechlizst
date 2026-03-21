import { describe, expect, it } from 'vitest';
import {
  healthResponseSchema,
  parsePostgrestListProjectsResponse,
  parsePostgrestListTasksResponse
} from '@app/contracts';

describe('healthResponseSchema', () => {
  it('accepts a valid backend payload', () => {
    expect(healthResponseSchema.parse({ ok: true })).toEqual({ ok: true });
  });

  it('rejects an invalid payload', () => {
    expect(() => healthResponseSchema.parse({ ok: 'yes' })).toThrow();
  });
});

describe('PostgREST response adapters', () => {
  it('normalizes project rows', () => {
    const parsed = parsePostgrestListProjectsResponse([
      {
        id: 1,
        name: 'Roadmap',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ]);
    expect(parsed.projects[0].name).toBe('Roadmap');
    expect(parsed.projects[0].createdAt).toBeTypeOf('string');
    expect(parsed.projects[0].updatedAt).toBeTypeOf('string');
  });

  it('normalizes task rows', () => {
    const parsed = parsePostgrestListTasksResponse([
      {
        id: 1,
        project_id: 1,
        title: 'Ship v1',
        is_placeholder: false,
        status: 'todo',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ]);
    expect(parsed.tasks[0].projectId).toBe(1);
    expect(parsed.tasks[0].status).toBe('todo');
    expect(parsed.tasks[0].createdAt).toBeTypeOf('string');
    expect(parsed.tasks[0].updatedAt).toBeTypeOf('string');
  });
});
