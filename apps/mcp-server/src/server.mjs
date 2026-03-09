import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';

const DEFAULT_BASE_URL = 'http://localhost:3002';
const POSTGREST_BASE_URL = process.env.POSTGREST_BASE_URL ?? DEFAULT_BASE_URL;

function asUrl(path) {
  return `${POSTGREST_BASE_URL}${path}`;
}

async function postgrestRequest(path, init) {
  const response = await fetch(asUrl(path), init);
  const text = await response.text();

  let body = null;
  if (text) {
    try {
      body = JSON.parse(text);
    } catch {
      body = text;
    }
  }

  if (!response.ok) {
    throw new Error(
      `PostgREST request failed (${response.status} ${response.statusText}) on ${path}: ${JSON.stringify(body)}`
    );
  }

  return body;
}

function okContent(data) {
  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify(data, null, 2)
      }
    ]
  };
}

const server = new McpServer({
  name: 'czhechlizst-postgrest',
  version: '0.1.0'
});

server.tool(
  'health_check',
  'Checks PostgREST connectivity and returns service status.',
  {},
  async () => {
    const rows = await postgrestRequest('/projects?select=id&limit=1', {
      method: 'GET'
    });

    return okContent({
      ok: true,
      baseUrl: POSTGREST_BASE_URL,
      sampleRows: Array.isArray(rows) ? rows.length : 0
    });
  }
);

server.tool(
  'list_projects',
  'Lists projects from PostgREST.',
  {
    limit: z.number().int().positive().max(200).optional()
  },
  async ({ limit }) => {
    const suffix = limit ? `&limit=${limit}` : '';
    const projects = await postgrestRequest(`/projects?select=*${suffix}`, {
      method: 'GET'
    });

    return okContent({ projects });
  }
);

server.tool(
  'create_project',
  'Creates a project row in PostgREST.',
  {
    name: z.string().min(1).max(120)
  },
  async ({ name }) => {
    const project = await postgrestRequest('/projects', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Prefer: 'return=representation'
      },
      body: JSON.stringify({ name })
    });

    return okContent({ project });
  }
);

server.tool(
  'list_tasks',
  'Lists tasks. Optional filter by project id.',
  {
    projectId: z.number().int().positive().optional(),
    limit: z.number().int().positive().max(200).optional()
  },
  async ({ projectId, limit }) => {
    const filters = [];
    if (projectId) {
      filters.push(`project_id=eq.${projectId}`);
    }
    filters.push('select=*');
    if (limit) {
      filters.push(`limit=${limit}`);
    }

    const tasks = await postgrestRequest(`/tasks?${filters.join('&')}`, {
      method: 'GET'
    });

    return okContent({ tasks });
  }
);

server.tool(
  'create_task',
  'Creates a task row in PostgREST.',
  {
    projectId: z.number().int().positive(),
    title: z.string().min(1).max(240)
  },
  async ({ projectId, title }) => {
    const task = await postgrestRequest('/tasks', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Prefer: 'return=representation'
      },
      body: JSON.stringify({ project_id: projectId, title })
    });

    return okContent({ task });
  }
);

server.tool(
  'list_project_notes',
  'Lists notes for a project.',
  {
    projectId: z.number().int().positive(),
    limit: z.number().int().positive().max(200).optional()
  },
  async ({ projectId, limit }) => {
    const filters = [`project_id=eq.${projectId}`, 'select=*'];
    if (limit) {
      filters.push(`limit=${limit}`);
    }

    const notes = await postgrestRequest(`/project_notes?${filters.join('&')}`, {
      method: 'GET'
    });

    return okContent({ notes });
  }
);

server.tool(
  'create_project_note',
  'Creates a project note row in PostgREST.',
  {
    projectId: z.number().int().positive(),
    body: z.string().min(1).max(5000)
  },
  async ({ projectId, body }) => {
    const note = await postgrestRequest('/project_notes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Prefer: 'return=representation'
      },
      body: JSON.stringify({ project_id: projectId, body })
    });

    return okContent({ note });
  }
);

server.tool(
  'list_task_notes',
  'Lists notes for a task.',
  {
    taskId: z.number().int().positive(),
    limit: z.number().int().positive().max(200).optional()
  },
  async ({ taskId, limit }) => {
    const filters = [`task_id=eq.${taskId}`, 'select=*'];
    if (limit) {
      filters.push(`limit=${limit}`);
    }

    const notes = await postgrestRequest(`/task_notes?${filters.join('&')}`, {
      method: 'GET'
    });

    return okContent({ notes });
  }
);

server.tool(
  'create_task_note',
  'Creates a task note row in PostgREST.',
  {
    taskId: z.number().int().positive(),
    body: z.string().min(1).max(5000)
  },
  async ({ taskId, body }) => {
    const note = await postgrestRequest('/task_notes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Prefer: 'return=representation'
      },
      body: JSON.stringify({ task_id: taskId, body })
    });

    return okContent({ note });
  }
);

const transport = new StdioServerTransport();
await server.connect(transport);
