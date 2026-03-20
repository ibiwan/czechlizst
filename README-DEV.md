# Development Workflow

## Prerequisites
- Node.js 20+
- npm 10+
- Docker Desktop running

## Standard Local Flow
1. Install dependencies: `npm install`
2. Generate types once: `npm run types:generate`
3. Start API and DB: `npm run postgrest:start`
4. Start frontend and type watch: `npm run dev`

## Day-to-Day Commands
- `npm run dev`: frontend dev server + Prisma-derived type watch
- `npm run dev:mcp`: run MCP server directly in current terminal
- `npm run types:generate`: regenerate Prisma client and contract-safe TS types
- `npm run types:check`: fail if `types:generate` would change committed generated type files
- `npm run types:watch`: regenerate contract types when Prisma schema changes
- `npm run postgrest:up`: start PostgreSQL and PostgREST containers
- `npm run postgrest:start`: run `postgrest:up`, apply migrations, restart PostgREST
- `npm run postgrest:logs`: tail PostgREST/PostgreSQL logs
- `npm run postgrest:down`: stop containers
- `npm run db:export:json`: export PostgREST resources to a JSON snapshot file
- `npm run db:import:json -- <file>`: restore JSON snapshot into DB tables (truncate + import)
- `npm run doctor`: one-command environment and service health checks
- `npm run check:all`: doctor + generated-artifact drift check + lint + tests + build
- `npm run lint`: ESLint
- `npm run format`: Prettier check

## Build Commands
- `npm run build`: generates types and builds workspace packages that require build output
- `npm run build:mcp`: MCP package build step (no-op placeholder)

## Troubleshooting Quick Checks
- Verify Docker health: `docker compose -f apps/backend/docker-compose.yml ps`
- Verify PostgREST health:
  `curl -s "http://localhost:3002/projects?select=id&limit=1"`
- If schema changed and frontend types are stale:
  `npm run types:generate`
- If `prisma migrate dev` reports `P1001` (can't reach DB), ensure Docker is running and `postgrest:start` has been run. In sandboxed environments, the command also needs local network access to `localhost:5433`.

## Frontend Organization and Aliases
Component organization is intentionally hierarchical and colocated with the parent component:
- Top-level entry: `apps/frontend/src/components/App.tsx`
- Pane components: `apps/frontend/src/components/App/*`
- Child components live in a folder named after the parent component:
  - example: `ProjectDetailPane.tsx` and `ProjectDetailPane/ProjectNotesDetail.tsx`
- Shared UI: `apps/frontend/src/components/utilities`
- Shared state hooks: `apps/frontend/src/components/state`

Prefer frontend path aliases over deep relative imports:
- `@/` → `apps/frontend/src/*`
- `@api` → `apps/frontend/src/api`
- `@store` → `apps/frontend/src/store`
- `@utilities` → `apps/frontend/src/components/utilities`
- `@state` → `apps/frontend/src/components/state`
- `@lib` → `apps/frontend/src/lib`
- `@app-types` → `apps/frontend/src/types`

If aliases appear broken in the editor, restart the TypeScript server and ensure
`apps/frontend/tsconfig.json` is the active project configuration.

## Playbook: Add A New Entity
Use this when introducing a new model (example: `Milestone`) and you want an agent to complete all required follow-up work.

### Objective
Add a new Prisma model and make it usable end-to-end in:
- database + PostgREST
- shared contracts (`@app/contracts`)
- frontend API/store/UI
- automated tests

### Execution Checklist
1. Update Prisma schema in `packages/db/prisma/schema.prisma`.
2. Create migration with `npm run prisma:migrate`.
3. Apply migrations in running stack with `npm run postgrest:start`.
4. Regenerate base contracts from Prisma with `npm run types:generate`:
   - generated TS row types: `packages/contracts/src/generated/prisma-types.ts`
   - generated Zod model/enum schemas: `packages/contracts/src/generated/prisma-zod.mjs`
5. Update shared contract adapters in `packages/contracts/src/index.mjs` (manual wrapper layer):
   - add route constants/helpers if needed
   - add/adjust response parsing adapters if field mappings changed
6. Update frontend API layer in `apps/frontend/src/api/*`:
   - add list/create (and update/delete if needed) endpoints
   - ensure request/response typing uses contracts
7. Update frontend state wiring in `apps/frontend/src/store.ts` if endpoint slices/tags change.
8. Update UI flows/components to surface the new entity.
9. Add/extend tests:
   - PostgREST integration tests in `apps/backend/test/e2e/`
   - frontend/API/store tests in `apps/frontend/src/test/`
10. Run full validation gate:
   - `npm run check:all`

### Migration Fallback
If `npm run prisma:migrate` fails but you need to keep moving:
1. Create a forward-only SQL migration in `packages/db/prisma/migrations/<timestamp>_<name>/migration.sql`.
2. Apply with `npm run postgrest:start`.
3. Still run `npm run types:generate` and update contracts/UI/test wiring.

## Playbook: Add Or Modify A Field
Use this when adding or changing a field on an existing model (example: add `reference_url` to notes).

### Execution Checklist
1. Update Prisma schema in `packages/db/prisma/schema.prisma`.
2. Create migration with `npm run prisma:migrate` (or use the Migration Fallback).
3. Apply migrations in running stack with `npm run postgrest:start`.
4. Regenerate base contracts from Prisma with `npm run types:generate`:
   - generated TS row types: `packages/contracts/src/generated/prisma-types.ts`
   - generated Zod model/enum schemas: `packages/contracts/src/generated/prisma-zod.mjs`
5. Update shared contract adapters in `packages/contracts/src/index.mjs` (manual wrapper layer):
   - update payload/response schemas
   - map snake_case DB fields to camelCase view models
6. Update frontend API layer in `apps/frontend/src/api/*` to send/receive the new field.
7. Update UI flows/components to surface and edit the field.
8. Add/extend tests (backend E2E and/or frontend tests as appropriate).
9. Run `npm run check:all`.

### Done Criteria
- Migration exists and applies cleanly.
- Contracts expose generated Zod + TS typing for the updated model.
- Frontend can read/write the field.
- Tests pass and cover new behavior.
- `npm run check:all` passes after the change.

### Done Criteria
- Migration exists and applies cleanly.
- PostgREST has been restarted after migration (`npm run postgrest:start`), and the new entity is reachable.
- Contracts expose generated Zod + TS typing for new entity.
- Frontend can read/write the new entity.
- Tests pass and cover new behavior.
- `npm run check:all` passes after the change.

### Agent Prompt Template
Use this exact instruction with an agent:

```text
Follow README-DEV.md section "Playbook: Add A New Entity" end-to-end.
Entity name: <ENTITY_NAME>.
Implement schema, migration, contracts, frontend API/store/UI wiring, and tests.
Run validation commands and report changed files plus any follow-up tasks.
```

## Playbook: Update Status Rules
Use this when changing workflow states, transitions, or computed project status behavior.

### Objective
Keep status semantics aligned across:
- shared contracts
- frontend controls and display
- database enforcement
- automated tests

### Execution Checklist
1. Update shared status rules in `packages/contracts/src/index.mjs`:
   - transition map (`allowedWorkStatusTransitions`)
   - transition helper(s)
   - project status aggregation helper
2. Sync type exports in `packages/contracts/src/index.d.ts` and CommonJS entry (`index.cjs`).
3. If backend integrity rules changed, add/modify Prisma SQL migration(s) for trigger/function enforcement.
4. Apply migration and restart PostgREST:
   - `npm run prisma:migrate:deploy`
   - `npm run postgrest:start`
5. Update frontend status UX in frontend components/hooks and styles:
   - selected-row editing rules in:
     - `apps/frontend/src/components/tasks/TaskRow.tsx`
     - `apps/frontend/src/components/projects/ProjectRow.tsx`
   - panel orchestration/model hooks:
     - `apps/frontend/src/components/tasks/useTasksPanelModel.ts`
     - `apps/frontend/src/components/projects/useProjectsPanelModel.ts`
     - `apps/frontend/src/useActiveProjectSelection.ts`
   - disabled transition visibility and reason text in:
     - `apps/frontend/src/components/StatusOptionSelect.tsx`
   - computed vs manual status display and projection in:
     - `apps/frontend/src/lib/format.ts`
     - `apps/frontend/src/activeProject.ts`
   - styles in `apps/frontend/src/styles/*.css`
6. Update API mutations in `apps/frontend/src/api.ts` if status update shape/behavior changed.
7. Extend E2E tests in `apps/backend/test/e2e/postgrest-api.test.ts` for valid/invalid transitions.
8. Run `npm run check:all`.

### Done Criteria
- Contract helpers and frontend behavior produce the same transition validity.
- DB rejects invalid transitions and guarded project updates.
- E2E tests cover at least one rejected and one accepted transition.
- `npm run check:all` passes.
