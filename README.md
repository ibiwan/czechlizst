# Czhechlizst Monorepo

Local-first project/task app with:
- Frontend: Vite + React + Redux Toolkit Query
- API backend: PostgREST + PostgreSQL (Docker)
- Schema and migrations: Prisma
- Shared contracts: TypeScript + Zod (`@app/contracts`)
- LLM tooling: MCP server (`apps/mcp-server`)

Primary use case: conversational backlog management for board, card, and video game projects/tasks (see [README-TOOL.md](README-TOOL.md)).

## Start Here In 60 Seconds
1. Install dependencies: `npm install`
2. Start backend + apply migrations: `npm run postgrest:start`
3. Start frontend + type watch: `npm run dev`
4. Pick the right doc for your task:
   - implementation workflow: [README-DEV.md](README-DEV.md)
   - schema/data changes: [README-DATA.md](README-DATA.md)
   - tests and coverage: [README-TESTING.md](README-TESTING.md)
   - MCP/tool usage: [README-TOOL.md](README-TOOL.md)
   - architecture rationale: [README-ARCHITECTURE.md](README-ARCHITECTURE.md)
   - blocking/dependency model: [README-BLOCKING.md](README-BLOCKING.md)
   - project/task model: [README-PROJECT-MODEL.md](README-PROJECT-MODEL.md)
   - debt and priorities: [README-TECHDEBT.md](README-TECHDEBT.md)

## Quick Start
1. `npm install`
2. `npm run postgrest:start`
3. `npm run dev`

Endpoints:
- Frontend: `http://localhost:5173`
- PostgREST API: `http://localhost:3002`

## Command Index
- `npm run dev`: frontend dev server + Prisma type watch
- `npm run doctor`: one-command environment/service health report
- `npm run check:all`: doctor + drift checks + lint + tests + build
- `npm run types:generate`: regenerate Prisma client and generated contract artifacts
- `npm run postgrest:start`: start Docker stack and apply Prisma migrations
- `npm run postgrest:down`: stop Docker stack
- `npm run test:all`: frontend tests + PostgREST E2E
- `npm run mcp:start`: run MCP server over stdio

## Documentation Map
- Dev workflow: [README-DEV.md](README-DEV.md)
- Data model and schema SoT: [README-DATA.md](README-DATA.md)
- Testing strategy and coverage: [README-TESTING.md](README-TESTING.md)
- Tooling and MCP integration: [README-TOOL.md](README-TOOL.md)
- Architecture, component roles, and state patterns: [README-ARCHITECTURE.md](README-ARCHITECTURE.md)
- Blocking/dependency model: [README-BLOCKING.md](README-BLOCKING.md)
- Project/task model: [README-PROJECT-MODEL.md](README-PROJECT-MODEL.md)
- PostgREST service details: [apps/backend/README.md](apps/backend/README.md)
