# Component Sketch

This file describes the smallest component tree that still respects the reboot model.

The goal is not to design the final UI. The goal is to keep implementation aligned with:
- anchor tasks in pane 1
- direct children in pane 2
- selected task detail in pane 3
- hierarchy from `parent_task_id`
- lateral relations only in task detail

## Top-Level Shape

```text
AppShell
  MainLayout
    AnchorPane
    ChildrenPane
    TaskDetailPane
```

This keeps the three-pane mental model intact while removing all project-era concepts.

## Top-Level Responsibilities

### `AppShell`
Owns:
- app bootstrap
- data loading boundaries
- global empty/loading/error states

Should not own:
- tree navigation logic
- task editing details
- pane-specific open/closed form state beyond what truly must be global

### `MainLayout`
Owns:
- wiring the three panes together
- passing selected/focused ids and callbacks
- top-level affordances like random-pick

Can also own:
- breadcrumb rendering, if breadcrumbs conceptually sit above panes 2 and 3

## Pane Components

### `AnchorPane`
Shows:
- only tasks where `is_anchor = true`

Owns:
- anchor list rendering
- anchor create affordance
- anchor selection callback

Does not care about:
- child-task list logic
- relation graph logic

### `ChildrenPane`
Shows:
- only tasks where `parent_task_id = focusedTaskId`

Owns:
- child list rendering
- child create affordance
- selection of a child

May also include:
- breadcrumb trail above the child list

Important:
- this pane is hierarchy-only
- it should not mix in `blocked_by` or `related_to`

### `TaskDetailPane`
Shows:
- the selected task
- task status/title/actions
- task notes
- generic relations (`blocked_by`, `related_to`)

Owns:
- task edit state
- note create/edit/delete state
- relation create/edit/delete state
- click-through navigation to related tasks
- task deletion / reparenting UI

This is where lateral graph behavior belongs.
It is also the right place to surface the subtle deletion rule:
- deleting a task affects hierarchy first
- surviving blocker tasks still block
- `related_to` links can disappear without changing structural existence

## Suggested Child Components

### Pane 1
- `AnchorList`
- `AnchorRow`
- `AnchorCreateRow`

### Pane 2
- `BreadcrumbTrail`
- `ChildTaskList`
- `ChildTaskRow`
- `ChildTaskCreateRow`

### Pane 3
- `TaskCard`
- `TaskStatusRow`
- `TaskActionsRow`
- `TaskNotesSection`
- `TaskRelationsSection`

## Selector/Model Boundaries

The clean split is:

- selectors/helpers compute derived read models
- pane components stay mostly declarative
- mutation handlers live near the pane that owns the interaction

Examples:
- anchor list model:
  - anchor tasks
  - sorted by effective status + updated recency
- children pane model:
  - focused task
  - direct children
  - breadcrumb parent chain
- detail pane model:
  - selected task
  - selected task notes
  - selected task relations
  - effective status

## Navigation Semantics

### Selecting An Anchor
Set:
- `selectedAnchorId`
- `focusedTaskId`
- `selectedTaskId`

### Selecting A Child
Set:
- `focusedTaskId = child.id`
- `selectedTaskId = child.id`
- keep `selectedAnchorId`

### Clicking A Relation Target
If the target shares the same anchor:
- update `focusedTaskId` and `selectedTaskId`
- keep `selectedAnchorId`

If the target belongs under a different anchor:
- update all three selection values

## Empty States

The reboot will need explicit empty states because the old project/task split no longer hides them.

Important empty cases:
- no anchors yet
- selected anchor has no children
- selected task has no notes
- selected task has no generic relations

These should be first-class and calm, not error-like.

## Build Order

Recommended implementation order:

1. `AnchorPane`
2. `ChildrenPane`
3. `TaskDetailPane` with title/status only
4. `BreadcrumbTrail`
5. notes section
6. generic relations section
7. random-pick behavior

That sequence gets the hierarchy spine in place before the richer detail features.
