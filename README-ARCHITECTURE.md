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
  - Generated public wrappers/adapters:
    - `packages/contracts/src/generated/public-contracts.mjs`
  - Generated named public contract types:
    - `packages/contracts/src/generated/public-types.ts`
- Manual wrapper layer (intentional):
  - route constants
  - operation-specific payload schemas and business rules
  - file: `packages/contracts/src/index.mjs`

Rationale:
- Keep schema authored once in Prisma.
- Keep app/API semantics and adapters centralized in shared contracts.
- Keep concrete, named public contract types generated from Prisma so consumers don’t
  re-derive `ReturnType<typeof ...>` or `z.infer` locally.

## Data Model Decisions
- `tasks` use stored enum `WorkStatus`:
  `todo`, `started`, `active`, `done`, `dropped`
- `blocked` is derived from unresolved `blocked_by` task relations, not stored in Prisma
- `projects` are container records with derived effective status, not stored workflow status
- Projects are never empty:
  - new projects get a placeholder task
  - deleting the last task recreates a placeholder task
- Many notes per entity are modeled explicitly:
  - `project_notes`
  - `task_notes`
- Task dependencies are modeled explicitly:
  - `task_relations`

Rationale:
- Multiple notes need first-class rows (timestamps, clean UI editing).
- Tasks are the single actionable work item; projects remain containers/context.

## Status Workflow Decisions
### Transition policy
Task transitions are intentionally permissive:
- any stored task status can move to any other stored task status
- same-state transitions are treated as no-op
- `blocked` is never manually selected because it is derived

### Enforcement points
- Shared rules in `@app/contracts` for frontend/tooling consistency.
- Database triggers/functions enforce integrity regardless of client.
- Canonical current-state SQL lives in:
  - `packages/db/prisma/sql/status.sql`
  - `packages/db/prisma/sql/timestamps.sql`
  - `packages/db/prisma/sql/placeholders.sql`

### Project status behavior
- Projects do not have a stored workflow status.
- Displayed project status is derived from effective task statuses.
- Active-task semantics drive active-project display.
- The frontend no longer exposes project status mutation controls.

Rationale:
- Prevent contradictory project/task status drift.
- Keep one workflow surface: tasks.

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
  - `apps/frontend/src/components/App.tsx` is the top-level entry. It manages the main page
    layout and handles global event listeners (e.g., the Escape key).
  - `apps/frontend/src/components/App/ProjectDetailPane` and child components handle major
    view modes.
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
  - selected task row: editable dropdown over stored task statuses
  - selected task row also exposes activate/suspend actions
  - effectively blocked tasks are not activatable
- Pane model:
  - left: project list
  - top-right: birds-eye view when no project is selected, or project detail when selected
  - bottom-right: task detail for the selected task, including blocker and note surfaces
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
- Placeholder-task replacement on real task creation is still primarily app-flow behavior,
  while placeholder creation/recreation is DB-backed.

## Revisit Triggers
Re-evaluate architecture when any of these occur:
- need runtime/admin-editable workflow rules
- dependency graph constraints become core to status logic
- frontend component complexity warrants reusable design-system package
- multi-user or external deployment requirements appear
