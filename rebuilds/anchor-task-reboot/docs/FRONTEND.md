# Frontend Sketch

## Pane Semantics

### Pane 1: Anchors
Purpose:
- show only anchor tasks
- provide the main jump-in list

Rules:
- ordered primarily by effective status, then recency
- selecting an anchor sets:
  - `selectedAnchorId`
  - `focusedTaskId`
  - `selectedTaskId`
- creating from pane 1 creates a task with `is_anchor = true`

### Pane 2: Children
Purpose:
- show direct children of the focused task

Rules:
- pane 2 is driven by `focusedTaskId`, not directly by the left-pane selection
- it shows tasks where `parent_task_id = focusedTaskId`
- selecting a child in pane 2 sets:
  - `focusedTaskId = child.id`
  - `selectedTaskId = child.id`
  - `selectedAnchorId` remains unchanged

Implication:
- once the user moves down the tree, pane 1 stays on the anchor while pane 2 tracks the current branch

### Pane 3: Task Detail
Purpose:
- show detail for `selectedTaskId`

Content:
- task card / status / title
- task notes
- generic relations (`blocked_by`, `related_to`)

## Selection Model

Three distinct state values are useful:
- `selectedAnchorId`
- `focusedTaskId`
- `selectedTaskId`

In normal use:
- selecting an anchor sets all three to the anchor id
- selecting a child changes `focusedTaskId` and `selectedTaskId`, but not `selectedAnchorId`
- clicking a relation target can move `focusedTaskId`/`selectedTaskId`; if it crosses anchors, update `selectedAnchorId` too

## Breadcrumbs

Breadcrumbs should be built from the `parent_task_id` chain:
- start at `selectedTaskId`
- walk upward through `parent_task_id`
- stop at root
- reverse for display

Because hierarchy is no longer in the generic relation graph:
- no graph search
- no shortest-path logic
- no ambiguity unless data is malformed

## Random Pick

Random pick should choose from leaf tasks only.

Leaf definition:
- task has no children by `parent_task_id`

When a random task is chosen:
- set `selectedAnchorId` to the root anchor in its parent chain
- set `focusedTaskId` to the chosen task
- set `selectedTaskId` to the chosen task
- render breadcrumbs from the parent chain

## Notes

There should be only one notes surface:
- task notes

Anchor tasks can carry broad, project-like notes without needing a separate note type.

## Status Behavior

Status remains per-task, not derived from hierarchy.

That means:
- parent tasks can be active/done/etc. independently
- child tasks can influence recency, but not directly override parent status

Blocked status remains derived:
- only from `blocked_by` relations

## Initial UI Build Order

1. left pane lists anchors
2. middle pane lists direct children of focused task
3. bottom-right pane shows selected task
4. breadcrumbs above pane 2 or pane 3
5. random-pick from leaf tasks

This is enough to validate the reboot before reintroducing richer views.
