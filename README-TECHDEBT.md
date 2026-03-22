# Technical Debt Notes

## Scope
Current technical debt and polish work that still feels real after the project-model and blocker refactors.

## Active Areas

### 1. Placeholder Lifecycle Coverage
Current state:
- placeholder creation/recreation is DB-backed
- placeholder promotion-on-touch is implemented in app flow

What still needs attention:
- stronger automated coverage for the exact "untouched placeholder gets replaced by real task" flow
- clearer tests around what counts as touching a placeholder

Resume notes:
- The intended semantics are now settled:
  - status/title/note/blocker changes promote a placeholder into a normal task
  - passive selection/open/random-pick do not
  - placeholders are intentionally not visually styled differently
- We already added coverage for "selection does not promote".
- The missing high-value test is the real-task-create path where an untouched placeholder should disappear.
- That behavior currently lives in frontend/app flow, not as a full DB invariant, so test it at the frontend/model layer unless the behavior is moved into DB logic later.

### 2. Blocker UX Polish
Current state:
- task blockers work
- effective blocked status is derived correctly
- pane 3 supports blocker add/remove

What still needs attention:
- better wording and affordances in blocker UI
- decide whether cross-project blockers should be supported
- decide whether cycle prevention should remain minimal or become explicit

Resume notes:
- The structural model is already in place:
  - task-to-task blockers only
  - multiple blockers allowed
  - `blocked` is derived, not stored
  - blocked tasks are not activatable
- Current UI is same-project only in pane 3.
- Before adding more code, decide whether cross-project blockers are actually desirable in day-to-day use.
- If cycle prevention becomes necessary, prefer explicit validation close to the shared contract/DB boundary rather than ad hoc UI-only checks.

### 3. Activation Semantics Hardening
Current state:
- task activation/suspension exists
- blocked tasks are not activatable
- project display status is derived from tasks

What still needs attention:
- verify that "one active task at a time" behavior always feels correct across projects
- reduce any remaining manual refetches that exist only to paper over status/activation timing

Resume notes:
- Activation behavior was simplified along with the task-only workflow model, but it still needs product pressure-testing.
- The key user expectation to verify is:
  - activating one task should demote other active tasks to `started`
  - project display should follow the active task cleanly
- If oddness shows up here, inspect `useTasksPanelModel.ts` first, especially the demote/activate orchestration and any remaining `refetch()` calls.

### 4. Drift-Proofing DB Behavior
Current state:
- canonical DB behavior SQL now lives near Prisma
- migrations are forward-only rollout history

What still needs attention:
- decide whether more of the SQL logic should be generated or checked automatically
- keep the canonical SQL files and migrations aligned as future changes land

Resume notes:
- Canonical current-state files now live in:
  - `packages/db/prisma/sql/status.sql`
  - `packages/db/prisma/sql/timestamps.sql`
  - `packages/db/prisma/sql/placeholders.sql`
- The JSON importer was also fixed to:
  - restore in dependency order
  - disable user triggers during import
- Next hardening step, if desired, is automation:
  - either generate more DB SQL from shared sources
  - or add a stronger drift check that compares canonical SQL against the migration-derived deployed state

### 5. MCP Coverage
Current state:
- MCP CRUD surface exists and builds

What still needs attention:
- more MCP-specific automated coverage so tool behavior is verified independently of the frontend

Resume notes:
- The MCP server surface is live enough to use, but confidence still comes mostly from frontend/backend tests rather than MCP-specific tests.
- The next worthwhile coverage is not broad snapshot testing; it is a few focused tests around:
  - project create/update/delete
  - task create/update/delete
  - notes CRUD
  - any tool behavior that now depends on the project/task model simplification

### 6. Timestamp/Recency Consistency
Current state:
- frontend display and sorting were switched to `updatedAt`
- task/project/note surfaces now use `updatedAt` instead of `createdAt` for visible recency

What still needs attention:
- verify there are no remaining frontend surfaces that still communicate recency using `createdAt`
- confirm the behavior feels right in real use, especially after edits that should visibly bubble up

Resume notes:
- The DB-side cascade logic already exists in `packages/db/prisma/sql/timestamps.sql`.
- A recent bug turned out to be mostly display-layer confusion because the UI was still showing `createdAt`.
- If this comes up again, check both:
  - whether the DB/API value actually changed
  - whether the UI surface is accidentally rendering the wrong timestamp field

### 7. Notes Create/Edit Reliability
Current state:
- long note reference/context pastes are now allowed
- task-note creation no longer bounces through transient local state before saving

What still needs attention:
- pressure-test long note create/edit flows with real pasted LLM transcripts
- look for any similar "set local state, then immediately read it" patterns elsewhere

Resume notes:
- The recent silent-fail-on-first-tries bug came from `TaskNotesPane.tsx` setting local state and then immediately calling a handler that read stale state.
- The fix was to add a direct `createTaskNoteWithValues(body, referenceUrl)` path in `useTasksPanelModel.ts`.
- If similar symptoms appear in other forms, look for that same pattern first.

## Explicitly Out Of Scope
- CI pipeline setup
- AuthN/AuthZ
- formal release automation

## Reliability Work Worth Keeping
- data safety via `npm run db:export:json` / `npm run db:import:json`
- local environment sanity via `npm run doctor`
- `npm run check:all` as the main local quality gate
