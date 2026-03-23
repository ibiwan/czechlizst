# Project Model

## Phase 1: Current State
The project model has been simplified around one rule:
- every project always has at least one task

That rule now drives the rest of the app model:
- tasks are the only actionable workflow items
- projects are containers with derived display state
- BEV is task-only
- the old empty-project-as-task behavior is gone

## Implemented Decisions

### Placeholder tasks
Projects are bootstrapped with an explicit placeholder task.

Current model:
- `Task.isPlaceholder` exists
- default placeholder title is `•`
- creating a project auto-seeds a placeholder task
- deleting the last task in a project recreates a placeholder task
- untouched placeholders are removed when a real replacement task is added

Placeholder promotion currently happens when the task is meaningfully touched, including:
- title changes
- status changes
- note changes
- blocker changes

Passive exposure does not promote a placeholder:
- selecting the task does not change it
- opening the project does not change it
- landing on it via random selection does not change it

There is intentionally no special placeholder styling in the UI.
Placeholders are a data/bootstrap concept, not a separate visible task type.

### Task and project roles
Tasks keep the stored workflow state:
- `todo`
- `started`
- `active`
- `done`
- `dropped`

`blocked` remains derived from task blockers.

Projects no longer store workflow status.
Instead:
- project effective status is derived from effective task statuses
- the frontend no longer treats project status as a mutable field

### Timestamp semantics
Stored timestamps remain:
- `project.created_at`
- `project.updated_at`
- `task.created_at`
- `task.updated_at`

Current meaning:
- `project.created_at` is the actual project birth timestamp
- `project.updated_at` reflects latest meaningful activity in the project
- `task.updated_at` reflects latest meaningful activity on that task

The database now cascades `updated_at` on:
- task create/update/delete
- project note create/update/delete
- task note create/update/delete
- task blocker create/update/delete
- placeholder regeneration when the last task is deleted

## Backend Invariants
The “no empty projects” rule is now DB-backed, not just frontend-backed.

Canonical SQL lives near Prisma in:
- [`status.sql`](/Users/jkent/Documents/git/czhechlizst/packages/db/prisma/sql/status.sql)
- [`timestamps.sql`](/Users/jkent/Documents/git/czhechlizst/packages/db/prisma/sql/timestamps.sql)
- [`placeholders.sql`](/Users/jkent/Documents/git/czhechlizst/packages/db/prisma/sql/placeholders.sql)

Migrations remain rollout history; the `packages/db/prisma/sql/*.sql` files are the current-state reference for database behavior.

## Remaining Work
The architectural redesign is mostly done. The remaining items are narrower:
- clearer tests around exactly what counts as “touching” a placeholder
- any final cleanup of stale docs or legacy naming
- product decisions around blocker UX and activation flow

## Notes
This README is now a current-state reference rather than a future implementation plan.
For blocker-specific details, see [`README-BLOCKING.md`](/Users/jkent/Documents/git/czhechlizst/README-BLOCKING.md).
For the newer relationship/anchor-task pivot, see [`README-RELATIONSHIPS.md`](/Users/jkent/Documents/git/czhechlizst/README-RELATIONSHIPS.md).

## Success Criteria
- no project is ever empty
- tasks are the only actionable work items
- project status is derived only
- placeholder tasks handle project bootstrap cleanly
- `updated_at` reflects meaningful descendant activity
- empty-project fallback logic disappears from BEV and related UI

## Phase 2: Intended Replacement
The newer intended direction is to remove projects entirely rather than keep refining the placeholder-project model.

Planned replacement:
- tasks become the only content entity
- some tasks become left-pane entry points via `is_anchor`
- hierarchy becomes first-class via `parent_task_id`
- project notes migrate onto the new anchor task as task notes
- generic relationships remain only for non-hierarchy links

If this direction is taken:
- the placeholder-task invariant disappears
- `projects` and `project_notes` are temporary migration concerns, not long-term entities
- pane 1 becomes an anchor-task list
- pane 2 becomes direct children of the selected task
- pane 3 remains task detail

So this file now describes the current implemented project-era checkpoint, not the final intended end state.
