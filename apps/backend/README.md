# PostgREST Backend

## Services
- PostgreSQL: `localhost:5433`
- PostgREST API: `http://localhost:3002`

## Start
From repo root:

```bash
npm run postgrest:start
```

## Stop

```bash
npm run postgrest:down
```

## Schema
Single source of truth is Prisma:

- Datamodel: `packages/db/prisma/schema.prisma`
- Migrations: `packages/db/prisma/migrations/*`

`sql/init.sql` is bootstrap-only (creates roles and schema).

Tables:
- `api.projects`
- `api.tasks` (FK to `api.projects`)
- `api.task_blockers` (task-to-task dependency links)
- `api.project_notes` (FK to `api.projects`)
- `api.task_notes` (FK to `api.tasks`)

Status enum:
- `api."WorkStatus"` values: `todo`, `started`, `active`, `done`, `dropped`

Notes:
- `blocked` is derived from `api.task_blockers`, not stored in the enum
- projects do not store workflow status; displayed project status is derived from task state

## Example requests

List projects:

```bash
curl -s "http://localhost:3002/projects?select=*"
```

Create project:

```bash
curl -s -X POST "http://localhost:3002/projects" \
  -H "Content-Type: application/json" \
  -H "Prefer: return=representation" \
  -d '{"name":"Roadmap"}'
```

List tasks for project 1:

```bash
curl -s "http://localhost:3002/tasks?project_id=eq.1&select=*"
```

Create task for project 1:

```bash
curl -s -X POST "http://localhost:3002/tasks" \
  -H "Content-Type: application/json" \
  -H "Prefer: return=representation" \
  -d '{"project_id":1,"title":"Ship v1"}'
```
