# Data and Schema Source Of Truth

## Source Of Truth
Prisma is the canonical schema definition.

- Prisma schema: `packages/db/prisma/schema.prisma`
- Prisma migrations: `packages/db/prisma/migrations/*`
- Canonical current-state DB behavior SQL:
  - `packages/db/prisma/sql/status.sql`
  - `packages/db/prisma/sql/timestamps.sql`
  - `packages/db/prisma/sql/placeholders.sql`

`apps/backend/sql/init.sql` is bootstrap-only (roles, schema, grants), not table SoT.

Important distinction:
- migrations are the deployment history and rollout mechanism
- the `packages/db/prisma/sql/*.sql` files are the human-readable current-state source for DB functions/triggers Prisma cannot express

When DB functions or triggers change:
1. update the canonical SQL file near `schema.prisma`
2. add a forward migration that brings the deployed database into alignment

## Current Domain Model
- `api.projects` (container records with `created_at` / `updated_at`)
- `api.tasks` (`status`: `todo|started|active|done|dropped`) with foreign key to `api.projects`
- `api.project_notes` (many notes per project)
- `api.task_notes` (many notes per task)

## Status Semantics
- Shared status vocabulary is defined in Prisma enum `api."WorkStatus"`.
- Status transition policy now applies to tasks.
- Project display status is derived from effective task statuses, not stored on the project row.

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

Current canonical DB behavior files:
- `packages/db/prisma/sql/status.sql`
  - current status transition function definitions
- `packages/db/prisma/sql/timestamps.sql`
  - current `updated_at` touch and cascade function/trigger definitions
- `packages/db/prisma/sql/placeholders.sql`
  - current project bootstrap / never-empty placeholder-task trigger definitions

## Generated Artifacts
- Prisma client: generated from schema via `prisma generate`
- Frontend-safe Prisma types:
  `packages/contracts/src/generated/prisma-types.ts`
- Generated Zod model and enum schemas:
  `packages/contracts/src/generated/prisma-zod.mjs`
- Generated public wrappers/adapters:
  `packages/contracts/src/generated/public-contracts.mjs`
- Generated named public contract types:
  `packages/contracts/src/generated/public-types.ts`
- Shared contracts and Zod schemas:
  `packages/contracts/src/index.mjs`

## PostgREST and OpenAPI
- PostgREST serves tables/views from the database schema.
- OpenAPI is exposed by PostgREST based on current DB objects and privileges.
- Schema SoT remains Prisma; PostgREST reflects deployed DB state.
