# Database Sketch

This reboot keeps the database opinionated where the product clearly needs it, and permissive everywhere else.

## Core Tables

### `tasks`
Primary entity for everything meaningful in the app.

Important fields:
- `is_anchor BOOLEAN NULL`
- `parent_task_id INTEGER NULL`
- `status`
- `created_at`
- `updated_at`

Notes:
- `is_anchor = true` means the task appears in pane 1
- `is_anchor = null` is treated the same as `false` during migration and early rollout
- `parent_task_id` encodes the primary hierarchy spine used by pane 2 and breadcrumbs

### `task_relations`
Only non-hierarchy edges live here.

Allowed relation types:
- `blocked_by`
- `related_to`

Important fields:
- `task_id`
- `related_task_id`
- `relation_type`
- `commentary`
- `created_at`
- `updated_at`

### `task_notes`
All notes belong to tasks, including notes that used to belong to projects.

## Integrity Rules

### Enforced in the Database
- `task_relations.task_id != task_relations.related_task_id`
- no duplicate relation with the same `(task_id, related_task_id, relation_type)`
- `parent_task_id` must reference an existing task or be `null`

### Intentionally Not Enforced Yet
- no global cycle detection on `parent_task_id`
- no global cycle detection on `blocked_by`
- no restriction that a task may have only one anchor ancestor
- no restriction that a task must be reachable from an anchor

These are treated as modeling/usage concerns for now, not hard DB integrity problems.

## Timestamp Semantics

### Local Touches
These should update the touched task's `updated_at`:
- task insert/update
- task note insert/update/delete
- task relation insert/update/delete where the task participates

### Parent Propagation
Parent propagation follows only `parent_task_id`.

If a task changes in a meaningful way:
- update the task itself
- update its parent
- update the parent's parent
- continue upward until there is no parent

This propagation should ignore generic relations:
- `blocked_by` should not recursively update ancestors of the blocking task
- `related_to` should not recursively update either side's ancestor chain beyond the directly touched tasks

### Why
This keeps left-pane anchor recency aligned with descendant work without turning the lateral relationship graph into a timestamp cascade machine.

## Anchor Behavior

Anchors are normal tasks with one extra role:
- they show in pane 1

The database should not otherwise special-case them much.

Notably:
- an anchor may also have a parent
- an anchor may also be blocked
- an anchor may also be a leaf

If later product decisions want stronger anchor semantics, they can be added after real usage proves they are needed.

## Deletion Behavior

Deletion semantics should be driven by `parent_task_id`, not by generic relations.

### What Survives
- tasks with valid surviving structural attachment
- anchors, if they are intentionally preserved

### What Does Not Keep A Task Alive
- `blocked_by`
- `related_to`

Those relations should be treated as:
- meaningful while both endpoint tasks exist
- safe to delete automatically when one endpoint disappears

### Orphan Rule
For this reboot, an orphan is:
- a non-anchor task
- with `parent_task_id = null`

When a task is deleted:
- remove the task
- remove its relation rows through FK cascade
- recursively delete only descendants that become true orphans because of that deletion

### Important Product Consequence
A surviving blocker task must continue to block other tasks even if its own former parent was deleted.

That means:
- deletion may prune the hierarchy
- but it should not silently reinterpret surviving `blocked_by` edges as gone

### Where To Enforce
This rule is subtle enough that it is better to prove first in application logic.

If it holds up in use, it can later move into DB functions for stronger enforcement.

## Canonical SQL

The companion SQL sketches in [`../prisma/sql/timestamps.sql`](../prisma/sql/timestamps.sql) and [`../prisma/sql/integrity.sql`](../prisma/sql/integrity.sql) are the current-state source-of-truth for intended DB behavior in this reboot sandbox.

They are not wired into migrations yet, but they capture the intended semantics more clearly than migration history would.
