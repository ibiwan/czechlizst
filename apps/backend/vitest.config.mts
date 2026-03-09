import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    name: 'postgrest-e2e',
    environment: 'node',
    include: ['apps/backend/test/e2e/**/*.test.ts'],
    testTimeout: 20000,
    hookTimeout: 20000,
    globals: false,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json-summary'],
      all: true,
      include: ['apps/backend/test/e2e/**/*.test.ts'],
      exclude: []
    }
  }
});
