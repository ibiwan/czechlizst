import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: '127.0.0.1'
  },
  test: {
    include: ['src/test/browser/**/*.spec.tsx'],
    setupFiles: './src/test/setup.ts',
    browser: {
      enabled: true,
      provider: 'playwright',
      headless: true,
      instances: [
        {
          name: 'chromium',
          browser: 'chromium'
        }
      ]
    }
  }
});
