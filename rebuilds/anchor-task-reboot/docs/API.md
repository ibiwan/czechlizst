# API Sketch

## Principles
- task-only public model
- no project endpoints
- no project-note endpoints
- hierarchy is part of `tasks`, not `task_relations`

## Tables Exposed Through PostgREST
- `tasks`
- `task_notes`
- `task_relations`

## Task Shape

Important fields:
- `id`
- `title`
- `status`
- `is_anchor`
- `parent_task_id`
- `created_at`
- `updated_at`

## Relations

`task_relations` should be used only for:
- `blocked_by`
- `related_to`

Suggested body shape:

```ts
type CreateTaskRelationBody = {
  task_id: number;
  related_task_id: number;
  relation_type: 'blocked_by' | 'related_to';
  commentary?: string | null;
};
```

## Suggested Route Helpers

Even if PostgREST remains the transport, these are the useful logical queries:

- `listAnchorTasks()`
  - `tasks?is_anchor=is.true&select=*`
- `listChildren(taskId)`
  - `tasks?parent_task_id=eq.${taskId}&select=*`
- `listRootTasks()`
  - `tasks?parent_task_id=is.null&select=*`
- `listTaskRelations(taskId)`
  - `task_relations?task_id=eq.${taskId}&select=*`
- `listTaskNotes(taskId)`
  - `task_notes?task_id=eq.${taskId}&select=*`

## Shared Helper Sketches

- `computeEffectiveTaskStatus(task, relations, tasks)`
- `findTaskChildren(taskId, tasks)`
- `findTaskParentChain(taskId, tasks)`
- `findAnchorForTask(taskId, tasks)`
- `isLeafTask(taskId, tasks)`

These helpers should replace most of the current project-derived logic.
