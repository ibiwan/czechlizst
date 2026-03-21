# Technical Debt Notes

## Scope
Current technical debt and polish work that still feels real after the project-model and blocker refactors.

## Active Areas

### 1. Placeholder Lifecycle Coverage
Current state:
- placeholder creation/recreation is DB-backed
- placeholder promotion-on-touch is implemented in app flow

What still needs attention:
- stronger automated coverage for the exact "untouched placeholder gets replaced by real task" flow
- clearer tests around what counts as touching a placeholder

### 2. Blocker UX Polish
Current state:
- task blockers work
- effective blocked status is derived correctly
- pane 3 supports blocker add/remove

What still needs attention:
- better wording and affordances in blocker UI
- decide whether cross-project blockers should be supported
- decide whether cycle prevention should remain minimal or become explicit

### 3. Activation Semantics Hardening
Current state:
- task activation/suspension exists
- blocked tasks are not activatable
- project display status is derived from tasks

What still needs attention:
- verify that "one active task at a time" behavior always feels correct across projects
- reduce any remaining manual refetches that exist only to paper over status/activation timing

### 4. Drift-Proofing DB Behavior
Current state:
- canonical DB behavior SQL now lives near Prisma
- migrations are forward-only rollout history

What still needs attention:
- decide whether more of the SQL logic should be generated or checked automatically
- keep the canonical SQL files and migrations aligned as future changes land

### 5. MCP Coverage
Current state:
- MCP CRUD surface exists and builds

What still needs attention:
- more MCP-specific automated coverage so tool behavior is verified independently of the frontend

## Explicitly Out Of Scope
- CI pipeline setup
- AuthN/AuthZ
- formal release automation

## Reliability Work Worth Keeping
- data safety via `npm run db:export:json` / `npm run db:import:json`
- local environment sanity via `npm run doctor`
- `npm run check:all` as the main local quality gate
