# Task Relationship Model

## Goal
Generalize the current task-blocker system into a typed task-relationship graph without reintroducing unnecessary enterprise complexity.

This change should preserve the current blocker behavior while opening the door to additional relationship types that remain lightweight and flexible.

## Chosen Model

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

## Target Schema Direction

Likely target:
- rename `task_blockers` -> `task_relations`

Likely fields:
- `id`
- `task_id`
- `related_task_id`
- `relation_type`
- `commentary`
- `created_at`
- `updated_at`

Likely enum:
- `TaskRelationType`
  - `blocked_by`
  - `has_subtask`
  - `related_to`

Uniqueness:
- unique `(task_id, related_task_id, relation_type)`

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

## Recommended Migration Path

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
Status: not started.

1. Replace the blocker-only section with a generic relationships section.
2. Support creating/viewing `blocked_by`, `has_subtask`, and `related_to`.
3. Add `commentary` editing/display.

## Practical Next Step When Resuming
If resuming cold, start here:

1. expand pane 3 from blocker-only controls to generic relationship controls
2. support `has_subtask` and `related_to` creation without changing blocked-status logic
3. decide how `commentary` should be entered and displayed
4. add frontend/browser coverage for mixed relation sets

That should move the product from “generic relationship engine with blocker UI” to a genuinely multi-relation task graph.
