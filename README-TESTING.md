# Testing

## Test Framework
Vitest is the unified framework for frontend and backend-adjacent tests.

## Test Types
- Unit/integration (frontend and store/API behavior):
  `apps/frontend/src/test/*.spec.ts*`
- API integration/E2E against PostgREST:
  `apps/backend/test/e2e/**/*.test.ts`

The PostgREST tests are integration tests (automated HTTP checks against a real database-backed API).

Current E2E assertions include:
- project/task CRUD basics
- project/task note CRUD basics
- task transition parity with shared contract rules
- placeholder-task bootstrap and never-empty-project behavior
- derived project status from task state

## Commands
- `npm run test`: workspace tests (`--if-present`)
- `npm run test:frontend`: frontend test suite
- `npm run test:frontend:coverage`: frontend coverage run
- `npm run test:postgrest:e2e`: PostgREST E2E suite
- `npm run test:postgrest:e2e:watch`: watch mode for PostgREST E2E
- `npm run test:all`: frontend tests + PostgREST E2E
- `npm run test:coverage`: frontend coverage alias

## Running E2E Reliably
1. Ensure Docker is running.
2. Start backend with migrations: `npm run postgrest:start`
3. Run E2E tests: `npm run test:postgrest:e2e`

## Coverage Notes
- Frontend source coverage is reported through Vitest v8 provider.
- PostgREST E2E coverage measures integration test files, not PostgREST internals.
