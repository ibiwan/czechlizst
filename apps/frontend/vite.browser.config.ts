import { defineConfig } from 'vite';
import path from 'node:path';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@api': path.resolve(__dirname, './src/api'),
      '@store': path.resolve(__dirname, './src/store'),
      '@utilities': path.resolve(__dirname, './src/components/utilities'),
      '@state': path.resolve(__dirname, './src/components/state'),
      '@lib': path.resolve(__dirname, './src/lib'),
      '@app-types': path.resolve(__dirname, './src/types')
    }
  },
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
