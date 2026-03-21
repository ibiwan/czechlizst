# Blocking Model

## Current State
Blocking is now modeled explicitly and task-to-task only.

Implemented:
- `blocked` is a derived display status, not a stored task status
- tasks may have zero, one, or many blockers
- blockers are resolved when the blocking task is `done` or `dropped`
- BEV is task-only
- project effective status is derived from effective task statuses

The core schema and contract work is already in place:
- `task_blockers` exists in Prisma and the database
- generated contract types/wrappers include blocker support
- shared helpers compute effective task status from stored status plus unresolved blockers

## UI and Behavior
Current frontend behavior:
- pane 3 shows blocker UI for the selected task
- tasks display effective blocked state in the task list and detail surfaces
- blocked tasks are not activatable
- stored task statuses remain:
  - `todo`
  - `started`
  - `active`
  - `done`
  - `dropped`

Manual status transitions are intentionally permissive now:
- any stored task status can move to any other stored task status
- `blocked` is never manually selected

## Remaining Work
The blocker model is structurally done. What remains is mostly product polish and hardening.

Likely next improvements:
- polish blocker UI and wording in pane 3
- decide whether cross-project blockers should be allowed
- add cycle prevention if the current self-link/duplicate protections prove insufficient
- expand coverage for blocker-heavy edge cases

## Notes
This README is now a current-state reference, not a future implementation plan.
For the broader project/task/container redesign that made blocker logic simpler, see [`README-PROJECT-MODEL.md`](/Users/jkent/Documents/git/czhechlizst/README-PROJECT-MODEL.md).
