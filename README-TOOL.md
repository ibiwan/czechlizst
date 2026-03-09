# Tooling Runbook (Codex + MCP)

## Purpose
Expose this local app/API/database stack as MCP tools so Codex (and other MCP-capable clients) can act on project/task data.
This document is intentionally standalone so a tool-user can operate from this file alone without reading other project docs.

## Product Context
Primary project goal: maintain a living backlog for your active game-development portfolio.

- Domains: board games, card games, and video games
- Data tracked: projects and tasks
- Working style: conversational capture in chat, persisted through MCP tools into the local PostgREST backend

When assisting, prioritize backlog management workflows over generic CRUD demos.

## Required Runtime
1. Open repo: `/Users/jkent/Documents/git/czhechlizst`
2. Ensure Docker Desktop is running.
3. Start backend and apply migrations: `npm run postgrest:start`

## Codex MCP Configuration
Codex config file: `/Users/jkent/.codex/config.toml`

```toml
[mcp_servers.czhechlizst]
command = "npm"
args = ["run", "mcp:start"]
cwd = "/Users/jkent/Documents/git/czhechlizst"

[mcp_servers.czhechlizst.env]
POSTGREST_BASE_URL = "http://localhost:3002"
```

## VS Code Setting (Codex Extension)
Enable MCP/LSP bridge in VS Code user settings:

```json
{
  "chatgpt.useExperimentalLspMcpServer": true
}
```

Then reload window (`Developer: Reload Window`).

## Implemented MCP Tools
- `health_check`
- `list_projects`
- `create_project`
- `list_tasks`
- `create_task`
- `list_project_notes`
- `create_project_note`
- `list_task_notes`
- `create_task_note`

`update_*` and `delete_*` tools are not implemented yet.
Status transition enforcement still applies at DB level, so invalid direct updates are rejected even if attempted through other clients.

## Fast Validation
- PostgREST responds:
  `curl -s "http://localhost:3002/projects?select=id&limit=1"`
- MCP server starts:
  `npm run mcp:start`
- In a fresh Codex chat, ask it to list available tools and then call `health_check`.
