# Technical Debt Notes

## Scope
Known technical debt with practical, low-overhead fixes for a solo/local project.

## Decisions Locked In
- Keep dual status enforcement:
  - contracts-level rules for UI/tooling
  - DB-level rules for final integrity
- Keep panel model hooks separate (`useProjectsPanelModel`, `useTasksPanelModel`).
- Keep parser/helper cleanup inside `packages/contracts/src/index.mjs` for now (no module split yet).
- Standardize refresh behavior:
  - default to RTK Query invalidation/cache updates
  - allow manual `refetch()` only with an inline comment explaining why tags are insufficient

## Now

### 1) Add Project UX Consistency Gaps (High Priority)
Current problem:
- after creating a project, the list updates but the details panel does not auto-select the new project.
- whitespace-only submit leaves the form open with no visible validation/error message.

Plan:
1. On successful create, set active project to the newly created id and refresh details panel.
2. Add inline validation for project name:
   - trim input
   - block empty submissions
   - show a short, visible error near the input
3. Ensure validation errors clear on input change or cancel.

Done criteria:
- new projects are selected immediately after create
- empty/whitespace submit shows a clear error and does not create a project

### 2) Status Rule Drift Prevention (High Priority)
Current problem:
- transition rules exist in JS and SQL, so drift is possible.

Plan:
1. Create canonical transition module:
   - `packages/contracts/src/work-status-transitions.mjs`
   - export `allowedWorkStatusTransitions`, `canTransitionWorkStatus`
2. Re-export from `packages/contracts/src/index.mjs` and remove duplicate inline definitions.
3. Add SQL snippet generator:
   - `packages/db/scripts/generate-status-transition-sql.mjs`
   - output `CASE` branches for `is_valid_work_status_transition`
4. Use generated snippet when creating a new migration for status rule changes.
   - do not edit already-applied historical migrations
5. Keep parity test coverage in:
   - `apps/backend/test/e2e/postgrest-api.test.ts`
6. Document workflow in `README-DEV.md` status playbook:
   - update canonical map -> generate SQL snippet -> create/apply migration -> run checks
7. Validate:
   - `npm run test:postgrest:e2e`
   - `npm run check:all`

Done criteria:
- one canonical map in contracts
- SQL rule changes derived from generated snippet
- parity E2E coverage passing

### 3) Mutation Refresh Policy Cleanup (High Priority)
Current problem:
- mixed `invalidatesTags` + manual `refetch()` patterns can cause redundant requests and inconsistency.

Plan:
1. Audit mutations in `apps/frontend/src/api.ts` and panel model hooks.
2. Remove manual `refetch()` where tags/cache updates already cover consistency.
3. Keep manual `refetch()` only for real cross-query gaps, with short inline rationale.
4. Add one lightweight test/assertion path for request-count sanity on common flows.

Done criteria:
- refresh behavior is consistent and documented in code comments where exceptional
- no unnecessary duplicate refetching in normal create/update flows

## Next

### 4) Contracts Parser Boilerplate Reduction
Current problem:
- repetitive parsing wrappers in `packages/contracts/src/index.mjs`.

Plan:
1. Add helper functions:
   - `parseListResponse(rowArraySchema, mapper)`
   - `parseCreateOneResponse(rowArraySchema, mapper, entityName)`
2. Keep per-entity mappers explicit.
3. Refactor only obvious repetition.

Done criteria:
- less wrapper duplication
- unchanged external behavior

### 5) Panel Hook Shared Helper Extraction
Current problem:
- some low-level state/update patterns are duplicated across project/task panel models.

Plan:
1. Extract only generic local helpers (draft/reset/toggle/submit patterns).
2. Keep feature-specific orchestration in each panel model hook.
3. Avoid generic "single panel engine" abstraction.

Done criteria:
- less low-level duplication
- hooks remain readable and feature-owned

## Later

### 6) MCP Tool Registration Boilerplate
Current problem:
- repeated list/create `server.tool(...)` setup in `apps/mcp-server/src/server.mjs`.

Plan:
1. Add a tiny registration helper for common CRUD list/create patterns.
2. Keep unique tools (`health_check`, any special operations) explicit.

Done criteria:
- lower repetition, no loss of readability

### 7) MCP Update/Delete Tool Surface
Current problem:
- MCP currently exposes list/create and notes list/create only.
- common workflow actions (rename, status updates, cleanup deletes) require direct API calls outside MCP tools.

Plan:
1. Add MCP update tools with explicit, validated inputs:
   - `update_project` (name)
   - `update_task` (title/status/done as supported by contracts+DB rules)
2. Add MCP delete tools:
   - `delete_project`
   - `delete_task`
   - confirm expected cascade/reject behavior at DB level and document it
3. Keep status transition validation aligned with existing contracts + DB enforcement.
4. Add/extend E2E coverage for positive and negative paths (invalid transition, missing id, delete constraints).
5. Update tool docs/runbook (`README-TOOL.md`) after implementation.

Done criteria:
- update/delete flows are available through MCP without direct fallback calls
- invalid transitions/deletes fail with clear errors
- tests cover new tool behavior

### 8) Incremental RTKQ Boundaries Cleanup
Current problem:
- server-state consistency concerns are partially split between hooks and API policies.

Plan:
1. Keep UI workflow state in panel hooks.
2. Move server-consistency policies toward API slice over time.
3. Do this only when touching nearby code (no standalone rewrite).

Done criteria:
- clearer ownership with minimal churn

## Explicitly Out Of Scope
- CI pipeline setup (local `npm run check:all` is the quality gate)
- AuthN/AuthZ
- formal release automation

## Local Reliability Hardening (In Scope)
- Data safety:
  - use `npm run db:export:json` / `npm run db:import:json`
  - keep snapshots in `data/backups/*`
- Reproducibility:
  - pinned Docker images in `apps/backend/docker-compose.yml`
  - `npm run doctor`
  - generated-artifact drift check via `scripts/check-generated-types.mjs`
- Failure clarity:
  - preserve actionable script/test failure messages

## Revisit Triggers
- new entity increases contracts/API boilerplate
- status workflow rules change
- MCP update/delete tools are added
- panel model hooks become hard to reason about
