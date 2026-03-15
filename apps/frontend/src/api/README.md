# API Module Layout

This folder uses a single RTK Query `api` instance plus `injectEndpoints` per domain.

## Files
- `base.ts`: shared `api` instance, headers, and common helpers.
- `health.ts`: health probe endpoint.
- `projects.ts`: project endpoints and types.
- `tasks.ts`: task endpoints and types.
- `notes.ts`: project/task note endpoints and types.
- `index.ts`: re-exports the `api` and all hooks.

## Adding An Endpoint
1. Pick the correct domain file (or create a new one).
2. Define domain-scoped types near the top of that file.
3. Use `api.injectEndpoints` to add the endpoint and export its hook.
4. Re-export the hook from `index.ts`.
