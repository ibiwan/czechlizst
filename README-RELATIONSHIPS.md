# Task Relationship Model

## Goal
Document the relationship-system work in two layers:
- what has already been implemented
- what design pivot is now intended next

The original goal for this file was:
- generalize the current task-blocker system into a typed task-relationship graph without reintroducing unnecessary enterprise complexity

This change should preserve the current blocker behavior while opening the door to additional relationship types that remain lightweight and flexible.

## Phase 1: Implemented Relationship Graph

This section describes the model that has already been built in the repo.

### One graph, typed edges
The system should be treated as one task graph with different-colored edges, not as separate tree/DAG/graph subsystems in the user’s mind.

The relationship types currently intended are:
- `blocked_by`
- `has_subtask`
- `related_to`

These are directional and should be read from the current task’s perspective.

Examples:
- `A blocked_by B`
- `A has_subtask B`
- `A related_to B`

### Inverse relations
Inverse relations are implicit, not stored separately.

Examples:
- if `A has_subtask B`, the UI may display B as a subtask of A without storing a second inverse edge
- if `A blocked_by B`, the UI may display B as blocking A without storing `B blocks A`

### Commentary
Each relationship should support an optional text field:
- `commentary`

Purpose:
- the enum gives a coarse semantic color
- `commentary` captures the exact intended meaning when the edge type alone is too generic

Examples:
- `blocked_by` + commentary: `waiting on art pass`
- `related_to` + commentary: `alternative approach`

## Constraints

### Keep
- forbid self-links for all relationship types
- allow cycles
- allow the same ordered pair to have multiple different relationship types
- forbid duplicate edges of the same ordered pair and same relationship type

In practice, uniqueness should be:
- `(task_id, related_task_id, relation_type)`

### Do not add
- no general cycle detection
- no tree-only enforcement
- no multiple-parent restrictions
- no inverse-edge duplication

Rationale:
- the user thinks in terms of one graph
- navigation is local
- a human or LLM is always interpreting the graph
- extra integrity rules would add more friction than value at this stage

## Why These Types

### `blocked_by`
Behavioral relationship.

Used for:
- derived `blocked` task status
- blocker UI and status logic

This is the only relationship type that should currently affect task effective status.

### `has_subtask`
Structural decomposition relationship.

Used for:
- breaking larger work into smaller steps
- potential future breadcrumbing or scoped navigation

This replaces the need to introduce a separate `implemented_by` type for now.

### `related_to`
Loose associative link / “see also”.

Used for:
- meaningful but non-hierarchical, non-blocking associations
- cases where the user wants to connect tasks without forcing them into notes

This is important while the app does not yet have rich deep-linking between items.

## Current State
The backend/contracts/model layer now has:
- `task_relations` table
- `TaskRelation` / `TaskRelationType`
- migrated blocker semantics preserved as `relation_type = blocked_by`
- derived `blocked` status computed from `blocked_by` relations only

The frontend UI is still intentionally blocker-focused for now:
- pane 3 still renders a `Blocked By` section
- current create/delete controls only expose `blocked_by`

That means the graph model is now generic underneath, while the relationship UX is still on its first public slice.

## Behavioral Rules

### Effective blocked status
Task effective status should be `blocked` when:
- there exists at least one relation
  - where `task_id = current task`
  - and `relation_type = blocked_by`
  - and the related task is unresolved

Only `blocked_by` should participate in blocked-status computation.

### Other relation types
- `has_subtask` does not affect blocked status
- `related_to` does not affect blocked status

## Phase 1 Progress

### Phase 1: Backend and contracts
Status: done.

1. Introduce generalized relation schema/model.
2. Migrate existing blocker rows to `relation_type = blocked_by`.
3. Regenerate contracts/types.
4. Update shared helpers so blocked-status computation filters by relation type.
5. Keep public behavior blocker-compatible during transition.

### Phase 2: Frontend model rename
Status: done for data/model plumbing, intentionally partial for UI wording.

1. Rename blocker endpoints/hooks/models to relation equivalents.
2. Update task panel model to work with typed relations.
3. Keep pane 3 UI functionally blocker-focused at first if needed.

### Phase 3: UI expansion
Status: started.

1. Replace the blocker-only section with a generic relationships section.
2. Support creating/viewing `blocked_by`, `has_subtask`, and `related_to`.
3. Add `commentary` editing/display.

Current note:
- pane 3 now supports creating, viewing, editing, deleting, and clicking through generic task relations
- UI is still same-project-only for relation creation

## Phase 2: Intended Pivot

The newer direction is to simplify hierarchy further by removing `has_subtask` from the generic relation table and making hierarchy a first-class task field.

### Proposed task model
- remove projects entirely
- add `Task.is_anchor`
- add `Task.parent_task_id`
- keep generic task relations only for:
  - `blocked_by`
  - `related_to`

This means:
- left pane shows only anchor tasks
- pane 2 shows direct children by `parent_task_id`
- pane 3 shows the selected task
- breadcrumbs come from the `parent_task_id` chain, not graph search

### Anchor semantics
- `is_anchor` is both semantic and UI-driving
- anchor tasks are ordinary tasks with no action restrictions
- new task from the left pane should be `is_anchor = true`
- new task from other creation surfaces should be `is_anchor = false`
- during migration, `is_anchor` should be nullable, with `NULL` treated as `false`

### Hierarchy semantics
- direct parent/child hierarchy should use `parent_task_id`
- timestamp propagation should move upward through `parent_task_id`
- random-pick eligibility should be leaf tasks only:
  - tasks with no children
  - `blocked_by` and `related_to` are allowed

### Migration direction
- add a temporary `projects.is_task_id`
- create one anchor task for each existing project
- move project notes onto that new anchor task
- convert former project membership into task hierarchy
- then remove `project_id` from tasks and drop projects/project_notes entirely

## Practical Next Step When Resuming
If resuming cold and following the new intended direction, start here:

1. update docs and migration plan around `is_anchor` + `parent_task_id`
2. treat current generic `has_subtask` work as an intermediate checkpoint, not the final hierarchy model
3. design the project-to-anchor-task migration in detail before touching code
4. keep `blocked_by` and `related_to` as the surviving generic relation types

That should move the product from the current intermediate graph model to the cleaner anchor-task/tree-plus-overlay-links model.
