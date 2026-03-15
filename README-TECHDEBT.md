# Technical Debt Notes

## Scope

Known technical debt with practical, low-overhead fixes for a solo/local project.

## Decisions Locked In

* **Project Name:** **Czechlizst** (The Composer of Tasks).
* **Source Code Vibe:** Components accept a single `testidPrefix` and construct internal sub-element IDs (e.g., `${prefix}-title`) to keep JSX clean and "picky-developer" approved.
* Keep dual status enforcement:
* contracts-level rules for UI/tooling
* DB-level rules for final integrity


* Keep panel model hooks separate (`useProjectsPanelModel`, `useTasksPanelModel`).
* Keep parser/helper cleanup inside `packages/contracts/src/index.mjs` for now (no module split yet).
* Standardize refresh behavior:
* default to RTK Query invalidation/cache updates
* allow manual `refetch()` only with an inline comment explaining why tags are insufficient



## Now

### 1) Add Project UX Consistency Gaps (High Priority)

Current problem:

* after creating a project, the list updates but the details panel does not auto-select the new project.
* whitespace-only submit leaves the form open with no visible validation/error message.

Plan:

1. On successful create, set active project to the newly created id and refresh details panel.
2. Add inline validation for project name:
* trim input
* block empty submissions
* show a short, visible error near the input


3. Ensure validation errors clear on input change or cancel.

Done criteria:

* new projects are selected immediately after create
* empty/whitespace submit shows a clear error and does not create a project

### 2) Task Dependency Safety & "The Anti-Floor" Logic (New)

Current problem:

* `BLOCKED` tasks fall on the floor because they aren't tethered to an actionable "blocker" task.

Plan:

1. Update Task schema to include `blockedByTaskId`.
2. Enforce UI/Contract rule: A task cannot be transitioned to `BLOCKED` without a valid `blockedByTaskId`.
3. Implement Auto-Unblock: When a blocker task moves to `DONE`, transition the dependent task to `TODO`.
4. Add visual "🔗" link in the task chip to jump focus to the blocker.

### 3) Status Rule Drift Prevention (High Priority)

Current problem:

* transition rules exist in JS and SQL, so drift is possible.

Plan:

1. Create canonical transition module:
* `packages/contracts/src/work-status-transitions.mjs`
* export `allowedWorkStatusTransitions`, `canTransitionWorkStatus`


2. Re-export from `packages/contracts/src/index.mjs` and remove duplicate inline definitions.
3. Add SQL snippet generator:
* `packages/db/scripts/generate-status-transition-sql.mjs`
* output `CASE` branches for `is_valid_work_status_transition`


4. Use generated snippet when creating a new migration for status rule changes.
5. Keep parity test coverage in `apps/backend/test/e2e/postgrest-api.test.ts`.

Done criteria:

* one canonical map in contracts
* SQL rule changes derived from generated snippet

### 4) Mutation Refresh Policy Cleanup (High Priority)

Current problem:

* mixed `invalidatesTags` + manual `refetch()` patterns can cause redundant requests and inconsistency.

Plan:

1. Audit mutations in `apps/frontend/src/api.ts` and panel model hooks.
2. Remove manual `refetch()` where tags/cache updates already cover consistency.

## Next

### 5) Pane 2/3: "Nothing Selected" & Magic Button (New)

Current problem:

* Pane 2 and 3 are empty "dead zones" when no project/task is active.
* Choice paralysis (ADHD) makes starting work difficult.

Plan:

1. Implement **Pane 2 "Menu of Intent"**:
* List A: **Recently Touched** (`STARTED` + `BLOCKED`) sorted by `updatedAt` desc.
* List B: **Random Available** (`STARTED` + `TODO`) excluding blocked items.


2. Implement **Pane 3 "Magic Button"**:
* A high-visibility "Pick Work for Me" action.
* Logic: Randomly selects from Pane 2 List B and triggers `ACTIVATE` sequence.



### 6) Contracts Parser Boilerplate Reduction

* Status: completed (helpers added; parse wrappers consolidated).

### 7) Panel Hook Shared Helper Extraction

* Extract generic local patterns (draft/reset/toggle) while keeping feature-specific orchestration in each panel model hook.

## Later

### 8) MCP Tool Registration Boilerplate

* Add a tiny registration helper for common CRUD list/create patterns.

### 9) MCP Update/Delete Tool Surface

* Status: implemented in MCP server; missing MCP-specific test coverage.

### 10) Incremental RTKQ Boundaries Cleanup

* Move server-consistency policies toward API slice over time.

## Explicitly Out Of Scope

* CI pipeline setup (local `npm run check:all` is the quality gate)
* AuthN/AuthZ
* formal release automation

## Local Reliability Hardening (In Scope)

* Data safety: `npm run db:export:json` / `npm run db:import:json`.
* Reproducibility: Pinned Docker images and `npm run doctor`.
* Failure clarity: preserve actionable script/test failure messages.
