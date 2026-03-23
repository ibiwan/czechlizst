# Architecture Sketch

## Product Model

### Task
Every meaningful item is a task.

Fields that matter most:
- `id`
- `title`
- `status`
- `is_anchor`
- `parent_task_id`
- `created_at`
- `updated_at`

### Anchor Tasks
Anchor tasks replace projects.

Rules:
- `is_anchor = true` means the task appears in the left pane
- anchors are normal tasks, not restricted containers
- anchors can have notes, statuses, blockers, and related links

### Hierarchy
Hierarchy is first-class and not stored in the generic relation table.

Rules:
- `parent_task_id` points to the direct parent task
- pane 2 shows direct children only
- breadcrumbs walk `parent_task_id` upward
- random-eligible tasks are leaves, meaning tasks with no children

### Generic Relations
Only non-hierarchy links remain in the relation table.

Allowed relation types:
- `blocked_by`
- `related_to`

Rules:
- `blocked_by` affects effective status
- `related_to` is navigational/contextual only
- self-links should be rejected
- commentary remains optional

## Deletion Semantics

Deletion follows the hierarchy spine, not the lateral graph.

Rules:
- `parent_task_id` determines structural attachment
- `blocked_by` does not preserve existence
- `related_to` does not preserve existence
- lateral relations are meaningful only while both endpoint tasks survive

### If A Task Is Deleted
- delete the task itself
- delete any `blocked_by` / `related_to` rows that reference it
- then evaluate its children structurally

### If A Child Still Has Structural Attachment
It survives.

Examples:
- child is explicitly reparented upward
- child still has a valid parent after the operation

### If A Child Becomes A True Orphan
It should be deleted, and the same orphan check should repeat downward.

For this reboot, "true orphan" means:
- non-anchor task
- no surviving `parent_task_id`

### Important Consequence
A blocker task should survive deletion of its own parent if the blocker task itself still survives structurally.

Example:
- `A blocked_by B`
- `B` loses its parent
- if `B` is still structurally kept alive, then `A` remains blocked by `B`

So:
- hierarchy controls existence
- lateral links do not
- but surviving lateral links still keep their meaning

## Pane Model

### Pane 1
- shows only anchor tasks
- selection here is anchor selection

### Pane 2
- shows direct children of the currently focused task
- initially, focus and left-pane selection may match when an anchor is selected
- later, focus can move deeper while pane 1 remains on the active anchor

### Pane 3
- shows the selected task
- includes notes and generic relations

## Timestamp Semantics
- task-local edits update that task
- task-note edits update that task
- relation edits update involved tasks
- child activity should propagate upward through `parent_task_id`
- `blocked_by` and `related_to` should not trigger recursive timestamp propagation beyond the directly involved tasks

## State Model Notes
- current anchor selection should be explicit UI state, not inferred fresh every render
- current focused task should also be explicit UI state
- breadcrumb path should come from `parent_task_id`, not graph search
