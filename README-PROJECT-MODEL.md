# Project Model Redesign Plan

## Goal
Simplify the app around one core rule:
- every project always has at least one task

If that invariant holds, then:
- tasks are the only actionable work items
- projects become containers with derived status
- the BEV can stay task-only
- blocking stays task-to-task
- the old "empty project behaves like a task" logic can be removed entirely

This plan is intentionally coupled to the blocker work. The clean end state is:
- stored task statuses only
- derived project status only
- placeholder bootstrap tasks for new and newly-emptied projects
- `updated_at` timestamps that cascade on meaningful descendant activity

## Core Decisions

### 1. Every project always has a task
Projects should never exist in an empty state.

Rules:
- creating a project also creates one placeholder task
- deleting the last remaining task in a project immediately creates a new placeholder task
- the UI and backend should both preserve this invariant

This removes the need for:
- special BEV handling for empty projects
- project-as-task fallback behavior
- dual-path random selection logic

### 2. Tasks are the only stored workflow items
Tasks keep stored statuses:
- `todo`
- `started`
- `active`
- `done`
- `dropped`

`blocked` stays derived from unresolved task blockers.

Projects should no longer store workflow status once this redesign is complete.
Instead:
- project effective status is derived from effective task statuses
- project "active" means it contains the active task, not that it owns an independent stored status

### 3. Placeholder tasks are explicit, not inferred from title alone
Recommended schema addition:
- `Task.isPlaceholder boolean`

Default placeholder title:
- `•`

Why this should be explicit:
- the bullet title is a UI convention, not enough by itself for reliable logic
- users may legitimately want a bullet-only title later
- cleanup rules become much safer with an explicit flag

### 4. Placeholder lifecycle
A placeholder task is temporary bootstrap scaffolding.

Initial behavior:
- new project gets one placeholder task
- if another task is added before the placeholder is ever meaningfully touched, delete the placeholder automatically

A placeholder becomes a normal task if any of these happen:
- title changes from `•`
- status changes
- a note is added
- a blocker is added or removed
- the task is otherwise explicitly edited as real work

Recommended first-pass deletion rule:
- auto-delete placeholder only when:
  - it is still marked `isPlaceholder = true`
  - its title is still `•`
  - it has no notes
  - it has no blockers
  - it is not the newly-added second task

Once touched, it should behave exactly like a normal task.

## Timestamp Semantics

### Stored timestamps that remain
Keep these stored fields:
- `project.created_at`
- `project.updated_at`
- `task.created_at`
- `task.updated_at`

### Meaning of `project.created_at`
Keep current behavior:
- the timestamp when the project itself was created

Do not derive this from tasks.
Reason:
- all tasks could be deleted and replaced over time
- the project identity should remain older than its current task set

### Meaning of `project.updated_at`
`project.updated_at` should mean:
- latest meaningful activity within the project

That should include:
- project note create/edit/delete
- task create/edit/delete
- task status change
- task note create/edit/delete
- task blocker create/delete
- placeholder regeneration when the last task is deleted

Recommended implementation rule:
- whenever descendant activity occurs, update the owning project's `updated_at`

This should be stored and maintained in the database, not recomputed ad hoc in the UI.

### Meaning of `task.updated_at`
`task.updated_at` should move on:
- task title edits
- task status changes
- task note create/edit/delete
- task blocker create/delete

This keeps task timestamps aligned with actual task activity, not just task-row edits.

## Schema Direction

### Task changes
Recommended additions:
- `isPlaceholder Boolean @default(false)`

No task status enum expansion is needed beyond the current stored task statuses.

### Project changes
Likely end state:
- remove stored `Project.status`

That is not the first migration to do, but it is the target.

Why:
- status becomes redundant if all projects always have tasks
- it creates divergence and cascade logic we no longer need

### Blockers
No change to current direction:
- task blockers remain task-to-task
- `blocked` remains derived

## Backend Invariants

The invariant "every project always has a task" should not live only in the frontend.
The backend/data layer should also enforce it.

There are two main ways to do that:

### Option A: enforce in application flows
- create project API always creates placeholder task
- delete-task flow recreates placeholder if it removed the last task

Pros:
- simpler to reason about initially
- easier to implement incrementally

Cons:
- invariant can be broken by direct DB/API writes outside the intended flow

### Option B: enforce in database triggers/functions
- create project trigger auto-seeds placeholder task
- delete last task trigger auto-recreates placeholder task

Pros:
- invariant is truly global
- protects against drift and side-channel writes

Cons:
- more delicate SQL logic
- placeholder-touch semantics still need app-aware rules

Recommended path:
1. first implement in application/API flows
2. then decide whether to harden with DB enforcement once behavior is proven

## Frontend Consequences

### BEV
BEV becomes task-only with no exceptions.

That means removing any remaining logic that treats:
- a project with zero tasks
- or a project card as a fallback BEV item

### Random task picker
Random selection becomes simpler:
- pick from tasks only
- no project-without-tasks branch

### Project list
Project status display becomes purely derived from task effective statuses.

Eventually:
- remove project manual status controls
- remove project activation/suspend controls

### Pane 3
Pane 3 remains task detail only.
No mixed “project surrogate task” behavior remains.

## Recommended Migration Order

Do this in phases to keep the repo coherent.

### Phase 1: Introduce placeholder support
1. Add `Task.isPlaceholder`.
2. Update create-project flow to create placeholder task automatically.
3. Update task-creation flow to auto-delete untouched placeholder when a real second task is added.
4. Update task-deletion flow to recreate placeholder if the deleted task was the last task.

### Phase 2: Timestamp cascade
1. Add/update DB logic so task note changes update `task.updated_at`.
2. Add/update DB logic so blocker changes update `task.updated_at`.
3. Add/update DB logic so task and note changes update owning `project.updated_at`.
4. Add/update delete/create flows so placeholder regeneration also updates project timestamps.

### Phase 3: Remove empty-project behavior from frontend
1. Remove any remaining BEV logic for empty projects.
2. Simplify random selection and any placeholder-empty-state handling.
3. Remove project/task equivalence logic in selectors and display helpers.

### Phase 4: Remove stored project status
1. Stop writing project status from frontend.
2. Make project status display fully derived in all panes.
3. Remove project activation/suspend controls.
4. Remove backend project-status mutation paths if they are no longer needed.
5. Drop `Project.status` from schema and contracts.

## Tests To Add

### Placeholder behavior
- creating a project creates exactly one placeholder task
- adding a second task deletes untouched placeholder
- edited placeholder is preserved when another task is added
- deleting last task recreates placeholder immediately

### Timestamp behavior
- task note create/edit/delete updates task and project `updated_at`
- project note create/edit/delete updates project `updated_at`
- task create/edit/delete updates project `updated_at`
- blocker create/delete updates task and project `updated_at`

### Derived status behavior
- project status is derived only from tasks
- no empty project status edge case remains
- active task implies active project display

## Open Questions

### Should selecting a placeholder task count as "touching" it?
Recommended answer:
- no, selection alone should not promote it to a normal task

### Should adding a note to a placeholder promote it immediately?
Recommended answer:
- yes

### Should placeholder tasks be visually styled differently?
Recommended answer:
- yes, but lightly
- enough to signal "bootstrap task" without making it feel fake or broken

### Should last-task deletion recreate placeholder synchronously or after delete success?
Recommended answer:
- after delete success, immediately in the same flow

## Success Criteria
- no project is ever empty
- tasks are the only actionable work items
- project status is derived only
- placeholder tasks handle project bootstrap cleanly
- `updated_at` reflects meaningful descendant activity
- empty-project fallback logic disappears from BEV and related UI
