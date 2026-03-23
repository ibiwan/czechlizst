# Migration Sketch

This file describes how the current project-era app could map into the reboot model.

The goal is not just "get the data across." The goal is to land in a model that is internally simpler:
- no projects
- no project notes
- no hierarchy in generic relations
- one primary entity: `tasks`

## Source Model
- `projects`
- `tasks.project_id`
- `project_notes`
- `task_relations` including `has_subtask`

## Target Model
- no `projects`
- no `project_notes`
- `tasks.is_anchor`
- `tasks.parent_task_id`
- `task_relations` only for `blocked_by` and `related_to`

## Target Invariants

After migration:
- every former project exists as one anchor task
- every former project task belongs under that anchor via `parent_task_id`
- every former project note is now a task note on the anchor task
- no `has_subtask` rows remain in `task_relations`
- left-pane candidates are simply `tasks where is_anchor = true`

## Migration Principles

- keep `is_anchor` nullable during migration
- treat `NULL` the same as `false` in app logic until cleanup is complete
- use explicit temporary linkage rather than trying to infer where migrated rows went
- make each stage independently inspectable before dropping old structures
- preserve timestamps where possible instead of re-stamping everything with migration time

## Suggested Staged Plan

### Stage 0: Snapshot And Audit
Before touching schema:
- export a JSON snapshot
- count current rows in:
  - `projects`
  - `tasks`
  - `project_notes`
  - `task_notes`
  - `task_relations` by `relation_type`
- inspect whether any real `has_subtask` rows exist

This stage gives us a baseline for verifying the migration later.

### Stage 1: Add New Task Fields
Add to `tasks`:
- nullable `is_anchor`
- nullable `parent_task_id`

Temporary behavior:
- existing tasks keep `is_anchor = null`
- existing tasks keep `parent_task_id = null`

This should be a non-destructive migration.

### Stage 2: Add Temporary Project Linkage
Add a temporary column to `projects`:
- `is_task_id`

Purpose:
- record which new anchor task replaces each legacy project
- avoid fuzzy joins during note/task remapping

This column exists only for migration safety and later verification.

### Stage 3: Create Anchor Tasks From Projects
For each existing project:
- create one task
- set:
  - `title = project.name`
  - `is_anchor = true`
  - `parent_task_id = null`
  - `status = a reasonable initial carryover`
  - `created_at = project.created_at`
  - `updated_at = project.updated_at`
- write the new task id into `projects.is_task_id`

Status carryover note:
- if the old system still has project statuses, this is the place to decide whether to preserve them or normalize them
- for the reboot sketch, preserving the stored value is acceptable as migration convenience even if the reboot later treats status more simply

### Stage 4: Rehome Project Tasks Under Their Anchor
For each legacy task:
- find its project
- find `projects.is_task_id`
- set:
  - `parent_task_id = projects.is_task_id`
  - `is_anchor = null` unless we intentionally promote it later

Result:
- former project membership becomes first-level hierarchy
- every imported non-anchor task starts as a direct child of its anchor task

### Stage 5: Migrate Project Notes Onto Anchor Tasks
For each `project_note`:
- create a `task_note`
- set:
  - `task_id = projects.is_task_id`
  - `body = project_note.body`
  - `reference_url = project_note.reference_url`
  - `created_at = project_note.created_at`
  - `updated_at = project_note.updated_at`

Result:
- anchor tasks inherit the broad/project-like note history

### Stage 6: Remove Hierarchy From Generic Relations
Review `task_relations where relation_type = 'has_subtask'`.

Expected current-case:
- few or none in real data

Migration rule:
- if a `has_subtask` row expresses the same hierarchy we now want in `parent_task_id`, convert that into `parent_task_id`
- after reconciliation, delete all `has_subtask` rows

If there is ambiguous or conflicting data:
- prefer preserving the row in an export/audit artifact
- do not invent complex conflict resolution inside the migration itself

### Stage 7: Verify Post-Migration Shape
Checks worth doing before destructive cleanup:
- every old project has exactly one `is_task_id`
- every legacy task formerly under a project now has `parent_task_id` set
- every `project_note` has a corresponding migrated `task_note`
- no `has_subtask` rows remain
- anchor task count matches legacy project count

Useful spot checks:
- sample a few projects and confirm:
  - anchor title matches old project title
  - child tasks appear under the right anchor
  - project notes landed on the anchor task

### Stage 8: Cut Over Application Reads
Only after data verifies cleanly:
- left pane reads anchor tasks
- pane 2 reads `parent_task_id`
- pane 3 reads selected task notes and generic relations
- project-era reads become compatibility shims or are removed

This stage should happen before dropping legacy tables so the app can be exercised against migrated-but-not-yet-dropped data.

### Stage 9: Remove Project-Era Schema
After the reboot app path is proven:
- drop `tasks.project_id`
- drop `project_notes`
- drop `projects`
- drop any old project-status helpers
- remove `has_subtask` from relation enums/contracts if still present anywhere

### Stage 10: Normalize Cleanup
After cutover is stable:
- optionally backfill `is_anchor = false` where it is currently `null`
- decide whether to make `is_anchor` non-nullable later
- simplify any temporary compatibility logic

## What This Avoids

This staged path avoids:
- trying to infer migrated anchor ids from titles
- rewriting hierarchy and note ownership at the same time without checkpoints
- dropping projects before the replacement anchor tasks are proven usable
- forcing the final nullability choice for `is_anchor` too early

## Current Assumptions

These assumptions are currently believed to be safe:
- there are few meaningful `has_subtask` rows in real data
- legacy projects map cleanly to one anchor task each
- project notes can become normal task notes without semantic loss
- first-level children under an anchor are a good starting import shape

## Open Questions
- whether migrated anchor tasks should preserve legacy project status literally or be normalized during import
- whether any legacy project metadata should survive beyond title/notes/timestamps
- whether `is_anchor` should remain nullable for a long time or only for migration
- whether a later pass should infer deeper parent chains from existing data beyond the first project-to-anchor mapping
