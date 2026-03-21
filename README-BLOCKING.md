# Blocking Model Plan

## Goal
Add explicit dependency tracking so items are blocked by other items, while preserving the project goal of minimizing drift and simplifying the work-item model.

Primary design decision:
- tasks become the only actionable work item
- projects remain containers/context
- `blocked` becomes a derived effective/display status, not a stored underlying workflow state

## Chosen Direction
### Work-item simplification
- Birds-eye view items should become tasks only.
- A project with no tasks should no longer be treated as a peer to tasks in the domain model.
- If a project needs immediate actionable presence, the app can later auto-seed an initial task, but that is separate from the dependency model itself.

### Blocking semantics
- A task may be blocked by zero, one, or many other tasks.
- The stored task status should exclude `blocked`.
- The effective/display task status is:
  - `blocked` if the task has at least one unresolved blocker
  - otherwise the stored underlying status

### Project status semantics
- Project effective status should be computed from effective task statuses, not raw stored task statuses.
- A blocked task should contribute to project-level blocked projection the same way current blocked tasks do now.

## Why This Direction
- It avoids dual-state repair problems like “real status” plus “blocked status” fighting each other.
- It allows automatic unblocking when blockers resolve.
- It avoids modeling task-project and project-project dependency combinations.
- It aligns with pane 3 becoming a task workspace rather than a mixed task/project inspector.

## Scope Breakdown
The work should be done in phases so the repo stays coherent at each checkpoint.

### Phase 1: Domain and Schema
1. Remove `blocked` from the stored `WorkStatus` enum in Prisma.
2. Add a new dependency table for task blockers.
3. Keep dependencies task-to-task only.
4. Decide what counts as a resolved blocker.

Recommended resolution rule:
- a blocker is resolved when the blocking task status is `done` or `dropped`

Recommended table shape:
- `task_blockers`
- fields:
  - `id`
  - `taskId`
  - `blockingTaskId`
  - `createdAt`
  - `updatedAt`

Recommended constraints:
- foreign keys to `tasks`
- unique `(taskId, blockingTaskId)`
- check `taskId != blockingTaskId`

Potential future constraint:
- cycle detection is desirable, but may be deferred if it is too heavy for the first pass

### Phase 2: Generated Contracts
After Prisma changes:
- run `npm run contracts:generate`
- ensure generated public types and public wrappers include the new `task_blockers` model

Manual contract work likely needed:
- helper for effective task status
- helper for blocker resolution
- project aggregate status helper updates

### Phase 3: Status Policy Rewrite
Stored statuses should become:
- `todo`
- `started`
- `active`
- `done`
- `dropped`

Derived status:
- `blocked`

This means:
- `allowedWorkStatusTransitions` in [`packages/contracts/src/index.mjs`](/Users/jkent/Documents/git/czhechlizst/packages/contracts/src/index.mjs) must be rewritten
- frontend status controls must operate on stored statuses only
- display helpers must present `blocked` based on unresolved blockers

Open question for implementation:
- should a blocked task still be allowed to transition its underlying stored status while blocked?

Recommended first-pass answer:
- yes, but the UI should probably bias toward reducing available actions while blocked
- at minimum, avoid allowing a blocked task to become `active`

### Phase 4: Backend Query and API Surface
Need to support:
- list blockers for a task
- add blocker to task
- remove blocker from task

Likely frontend API additions:
- `listTaskBlockers`
- `createTaskBlocker`
- `deleteTaskBlocker`

Potential optimization later:
- a view or RPC that returns tasks with blocker metadata pre-joined

For first pass, keep it simple:
- tasks query stays as-is
- blockers come from dedicated endpoints
- effective status is computed in frontend/contracts helper logic

### Phase 5: Frontend Model Changes
Main frontend consequences:
- BEV should show tasks only
- pane 2 project details still include task list
- pane 3 remains task detail

Task UI additions needed:
- show current blockers on selected task
- add dependency picker
- remove blocker action
- effective blocked display in row card, detail card, and status pills

Places likely impacted:
- [`apps/frontend/src/components/App/ProjectDetailPane/BirdsEyeView.tsx`](/Users/jkent/Documents/git/czhechlizst/apps/frontend/src/components/App/ProjectDetailPane/BirdsEyeView.tsx)
- [`apps/frontend/src/components/App/ProjectDetailPane/ProjectDetailView/TaskListCard.tsx`](/Users/jkent/Documents/git/czhechlizst/apps/frontend/src/components/App/ProjectDetailPane/ProjectDetailView/TaskListCard.tsx)
- [`apps/frontend/src/components/App/TaskNotesPane.tsx`](/Users/jkent/Documents/git/czhechlizst/apps/frontend/src/components/App/TaskNotesPane.tsx)
- task status display/select utilities
- task panel model hooks

### Phase 6: Birds-Eye Simplification
Current BEV item model:
- task
- or project with no tasks

Target BEV item model:
- task only

Options for empty projects:
1. Show empty projects elsewhere, but not in BEV.
2. Prompt user to create a first task.
3. Auto-seed an initial task on project creation.

Recommended first pass:
- remove empty projects from BEV
- keep project creation unchanged for now
- evaluate auto-seed later if empty projects feel too invisible

Important caveat:
- new-project semantics need more design attention before being locked in
- one promising option is to auto-seed a single placeholder task whose title is a bullet point, such as `•`
- if the user adds a second task before ever editing that placeholder task, the placeholder task should disappear automatically
- if the user edits the placeholder task, it becomes a normal first task and should no longer be treated specially

### Phase 7: Testing
Need new coverage for:
- task with zero blockers is not effectively blocked
- task with one unresolved blocker is effectively blocked
- task with multiple blockers remains blocked until all are resolved
- resolving blocker reveals underlying stored status
- BEV no longer treats empty projects as work items
- project effective status uses effective task statuses
- invalid blocker relationships are rejected
  - self-block
  - duplicate blocker link

Also revisit:
- existing status transition tests that currently assume `blocked` is a stored enum state

## Migration Strategy
This is not a small change. Do it in this order:

1. Introduce `task_blockers` table and generated artifacts.
2. Add effective-status helpers while `blocked` still exists if needed for transitional safety.
3. Update frontend to understand blockers.
4. Remove `blocked` from stored enum only when all reads/writes are ready.
5. Update tests and snapshots.

Safer alternative:
- do the enum removal in the same migration if you want to avoid a long mixed state
- but only after the implementation branch is ready end-to-end

## Recommended Implementation Order
Tomorrow’s execution order should be:

1. Finalize design decisions:
   - task-only blocking
   - multiple blockers
   - blocker resolved on `done` or `dropped`
   - BEV tasks only
2. Update Prisma schema and add migration.
3. Regenerate contracts.
4. Update contract helpers and project status computation.
5. Add frontend API endpoints for blocker CRUD.
6. Update task panel state/model.
7. Update task detail UI to display and edit blockers.
8. Update BEV to task-only model.
9. Rewrite tests and run `npm run check:all`.

## Open Questions
- Should blocked tasks be selectable for activation but fail gracefully, or should activation be hidden/disabled?
- Should a task be allowed to block a task in another project?
- Should dropped blockers count as resolved permanently, or should the UI warn that the blocker was dropped rather than completed?
- Do we want cycle prevention in v1, or only self-link and duplicate-link prevention?
- What should the exact new-project bootstrap behavior be once BEV becomes task-only?

Recommended answers for v1:
- activation disabled while effectively blocked
- cross-project blockers allowed only if it clearly helps the workflow; otherwise start same-project only
- dropped counts as resolved
- no full cycle detection in v1
- leave new-project placeholder-task behavior open until the UX is tried deliberately

## Tomorrow’s Success Criteria
- Schema supports multi-blocker task dependencies.
- Stored workflow statuses no longer need `blocked`.
- Effective blocked display works in contracts/frontend.
- BEV is task-only.
- Tests cover blocker semantics and no drift checks fail.
