# Data and Schema Source Of Truth

## Source Of Truth
Prisma is the canonical schema definition.

- Prisma schema: `packages/db/prisma/schema.prisma`
- Prisma migrations: `packages/db/prisma/migrations/*`

`apps/backend/sql/init.sql` is bootstrap-only (roles, schema, grants), not table SoT.

## Current Domain Model
- `api.projects` (`status`: `todo|started|active|blocked|done|dropped`)
- `api.tasks` (`status`: `todo|started|active|blocked|done|dropped`) with foreign key to `api.projects`
- `api.project_notes` (many notes per project)
- `api.task_notes` (many notes per task)

## Status Semantics
- Shared status vocabulary is defined in Prisma enum `api."WorkStatus"`.
- Status transition policy is defined in shared contracts and enforced in the database.
- Project display status can be computed from task statuses in the frontend:
  - empty project: manual project status
  - otherwise: computed aggregate from tasks (manual shown only when different)

## Schema Change Workflow
1. Edit `packages/db/prisma/schema.prisma`.
2. Create migration:
   `npm run prisma:migrate`
3. Regenerate generated artifacts:
   `npm run types:generate`
4. Apply migrations in running stack:
   `npm run postgrest:start`

For field-level changes and end-to-end wiring, see the playbooks in `README-DEV.md`:
- `Playbook: Add Or Modify A Field`
- `Playbook: Add A New Entity`

## Migration Policy
Use forward-only migrations:
- Never edit an existing migration directory after it has been applied.
- Always add a new migration for each schema evolution.

This can be partially enforced with automation (for example, in CI with git history checks), but policy discipline is still required.

Notable migration enforcing status rules:
- `packages/db/prisma/migrations/20260309033000_enforce_status_transitions/migration.sql`
  - validates task/project status transitions
  - blocks manual project status changes while tasks exist

## Generated Artifacts
- Prisma client: generated from schema via `prisma generate`
- Frontend-safe Prisma types:
  `packages/contracts/src/generated/prisma-types.ts`
- Generated Zod model and enum schemas:
  `packages/contracts/src/generated/prisma-zod.mjs`
- Shared contracts and Zod schemas:
  `packages/contracts/src/index.mjs`

## PostgREST and OpenAPI
- PostgREST serves tables/views from the database schema.
- OpenAPI is exposed by PostgREST based on current DB objects and privileges.
- Schema SoT remains Prisma; PostgREST reflects deployed DB state.
