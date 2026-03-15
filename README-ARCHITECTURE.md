# Architecture Notes

## Scope
This document records architecture-level decisions for the current local-first project/task tracker and why they were chosen.

## System Shape
- Frontend: React + RTK Query (`apps/frontend`)
- API surface: PostgREST over PostgreSQL (`apps/backend`)
- Schema/migrations: Prisma (`packages/db`)
- Shared policy/contracts: `@app/contracts`
- LLM integration: MCP server (`apps/mcp-server`)

## Source Of Truth Boundaries
- Database schema SoT: `packages/db/prisma/schema.prisma`
- DB evolution SoT: Prisma migrations in `packages/db/prisma/migrations`
- Base model/enum contract generation:
  - TS row types: `packages/contracts/src/generated/prisma-types.ts`
  - Zod schemas: `packages/contracts/src/generated/prisma-zod.mjs`
  - Generated classes (domain + PostgREST shapes):
    - `packages/contracts/src/generated/prisma-classes.mjs`
- Manual wrapper layer (intentional):
  - route constants
  - PostgREST response adapters
  - operation-specific payload schemas and business rules
  - file: `packages/contracts/src/index.mjs`

Rationale:
- Keep schema authored once in Prisma.
- Keep app/API semantics and adapters centralized in shared contracts.
- Keep concrete, named contract types in `packages/contracts/src/index.d.ts` so consumers
  don’t re-derive `ReturnType<typeof ...>` or `z.infer` locally.

## Data Model Decisions
- `projects` and `tasks` use shared enum `WorkStatus`:
  `todo`, `started`, `active`, `blocked`, `done`, `dropped`
- Many notes per entity are modeled explicitly:
  - `project_notes`
  - `task_notes`

Rationale:
- Multiple notes need first-class rows (timestamps, clean UI editing).
- Enum gives constrained workflow states without lookup-table complexity.

## Status Workflow Decisions
### Transition policy
Allowed transitions (same-state no-op allowed):
- `todo -> started | active | blocked | dropped`
- `started -> active | blocked | done | dropped | todo`
- `active -> started | blocked | done | dropped | todo`
- `blocked -> started | active | dropped | todo`
- `done -> todo | started | active | dropped`
- `dropped -> todo | started | active`

### Enforcement points
- Shared rules in `@app/contracts` for frontend/tooling consistency.
- Database triggers/functions enforce integrity regardless of client.
- Migration:
  `packages/db/prisma/migrations/20260309033000_enforce_status_transitions/migration.sql`

### Project status behavior
- If project has zero tasks: manual project status is editable and displayed.
- If project has tasks:
  - manual status updates are blocked (DB + UI)
  - display status is computed from task statuses
  - manual status is shown only when different (for context)

Rationale:
- Prevent contradictory manual status while child task reality exists.
- Keep empty projects flexible for top-level planning.

## Frontend Interaction Decisions
- Dark theme with tokenized, modular styles:
  - design tokens: `apps/frontend/src/styles/tokens.css`
  - global/base rules: `apps/frontend/src/styles/base.css`
  - composed stylesheet entrypoint: `apps/frontend/src/styles/app.css`
  - feature/style modules:
    - `layout.css`
    - `panel.css`
    - `forms.css`
    - `table.css`
    - `status.css`
    - `notes.css`
- Primary structure:
  - projects table
  - project notes detail block
  - tasks table
  - task notes detail block
- State orchestration:
  - shared app state in RTK slice (`apps/frontend/src/store/mainPageSlice.ts`)
  - panel-specific model hooks (`useProjectsPanelModel`, `useTasksPanelModel`)
  - active project selection hook (`apps/frontend/src/store/useActiveProjectSelection.ts`)
- Component organization:
  - `apps/frontend/src/components/MainPage.tsx` is the top-level entry.
  - `apps/frontend/src/components/main-page/*` contains pane components.
  - Child components live in a folder named after the parent component:
    - example: `ProjectDetailPane.tsx` + `ProjectDetailPane/ProjectNotesDetail.tsx`
  - Shared UI pieces live in `apps/frontend/src/components/utilities`.
  - Shared state hooks live in `apps/frontend/src/components/state`.
- Alias usage (frontend):
  - `@/` for `src/*`
  - `@api` for `src/api`
  - `@store` for `src/store`
  - `@utilities` for `src/components/utilities`
  - `@state` for `src/components/state`
  - `@lib` for `src/lib`
  - `@app-types` for `src/types`
- Data-entry affordances:
  - subtle “adder rows” for new project/task
  - subtle note adder links
- Status interaction:
  - unselected task row: colored lozenge
  - selected task row: editable dropdown (invalid transitions shown disabled)
- Diagnostics are moved off main flow to hash route `#/meta`.

Rationale:
- Maintain scanability and low visual noise.
- Keep controls explicit without crowding headers.
- Keep shared state in Redux and keep component-local behavior in local hooks/components.

## UI Principles (Project Doctrine)
These are intentional defaults for this project, derived from explicit team preference.

- Keep structure and presentation separate:
  - semantic HTML/component structure for meaning
  - CSS for visual policy
- Prefer semantic component classes and tokenized CSS over utility-class-heavy markup.
- Keep styling overhead low:
  - `tokens.css` for shared values
  - `base.css` for global defaults
  - component/feature styles split into focused stylesheet modules and imported by `app.css`
- Avoid hidden or ambiguous primary actions:
  - use explicit, context-local controls
  - prefer subtle add-row/add-link patterns over repeated loud buttons
- Preserve accessibility by default:
  - prefer native controls unless custom behavior is necessary
  - if custom controls are introduced, replicate keyboard/focus/screen-reader behavior deliberately
- Optimize for solo maintainability:
  - clarity over novelty
  - predictable patterns over framework-fashion churn

## Testing Strategy
- Frontend unit/integration tests in `apps/frontend/src/test`
- PostgREST E2E integration tests in `apps/backend/test/e2e`
- Validation gate: `npm run check:all`
  - doctor
  - generated artifact drift check
  - lint
  - frontend + E2E tests
  - build

Rationale:
- Preserve fast local iteration while catching drift and data-layer regressions.

## Tradeoffs Accepted
- Manual adapter layer remains in contracts (not 100% generated).
- Native `<select>` used for status editing for accessibility and lower complexity.
- Transition reasons in option labels are simple text; no custom ARIA menu complexity yet.

## Revisit Triggers
Re-evaluate architecture when any of these occur:
- need runtime/admin-editable workflow rules
- dependency graph constraints become core to status logic
- frontend component complexity warrants reusable design-system package
- multi-user or external deployment requirements appear
