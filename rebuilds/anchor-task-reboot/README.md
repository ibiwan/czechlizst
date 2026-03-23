# Anchor Task Reboot

This directory is a clean rebuild sketch for the task-only/anchor-based version of the app.

It is intentionally separate from the current monorepo app flow:
- not wired into the root workspaces
- not expected to build yet
- safe to evolve without preserving current project-era compatibility

## Core Direction
- one primary entity: `Task`
- left-pane entry points are tasks with `is_anchor = true`
- hierarchy is modeled directly with `parent_task_id`
- generic relations remain only for non-hierarchy links:
  - `blocked_by`
  - `related_to`

## UI Shape
- pane 1: anchor tasks only
- pane 2: direct children of the selected task
- pane 3: selected task detail
- breadcrumbs: walk the `parent_task_id` chain upward

## Files
- [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md): product and UI model
- [`docs/FRONTEND.md`](./docs/FRONTEND.md): pane/state and interaction sketch
- [`docs/COMPONENTS.md`](./docs/COMPONENTS.md): minimal component tree and data-flow sketch
- [`docs/MIGRATION.md`](./docs/MIGRATION.md): current-app to reboot migration sketch
- [`docs/API.md`](./docs/API.md): contract/API surface sketch
- [`docs/DB.md`](./docs/DB.md): database behavior and trigger sketch
- [`backend/docker-compose.yml`](./backend/docker-compose.yml): reboot-native Postgres/PostgREST stack
- [`prisma/schema.prisma`](./prisma/schema.prisma): target schema sketch
- [`prisma/sql/timestamps.sql`](./prisma/sql/timestamps.sql): canonical timestamp propagation sketch
- [`prisma/sql/integrity.sql`](./prisma/sql/integrity.sql): canonical constraint/trigger sketch
- [`src-sketch/state.ts`](./src-sketch/state.ts): UI state shape sketch
- [`src-sketch/components.ts`](./src-sketch/components.ts): component and selector sketch

## Status
This is now a runnable demo sandbox backed by local mock data.

## Run

From the repo root:

```bash
npm run dev --prefix rebuilds/anchor-task-reboot
```

Build check:

```bash
npm run build --prefix rebuilds/anchor-task-reboot
```

Current scope:
- runnable Vite/React demo
- frontend wired to reboot PostgREST
- reboot-native DB scaffolding exists

## Reboot DB Stack

The reboot folder now also has its own real stack scaffold:

```bash
cp rebuilds/anchor-task-reboot/.env.example rebuilds/anchor-task-reboot/.env
npm run db:up --prefix rebuilds/anchor-task-reboot
npm run prisma:migrate:deploy --prefix rebuilds/anchor-task-reboot
```

PostgREST is intended to serve on `http://localhost:3003`.

This is still an early slice:
- schema + initial migration exist
- Docker/PostgREST scaffolding exists
- frontend is wired to the reboot DB and can bootstrap demo data

## Import Current App Data

If you have a JSON export from the current app stack, you can transform and load it into the reboot DB:

```bash
npm run db:import:current-json --prefix rebuilds/anchor-task-reboot -- /absolute/path/to/export.json
```

Current import behavior:
- each legacy project becomes one anchor task
- each legacy task becomes a child of that anchor
- project notes become anchor-task notes
- task notes carry across directly
- only `blocked_by` and `related_to` relations are imported
- legacy `has_subtask` relations are dropped
