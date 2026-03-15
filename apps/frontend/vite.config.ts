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
    port: 5173
  },
  test: {
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    exclude: ['src/test/browser/**'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json-summary'],
      all: true,
      include: ['src/**/*.{ts,tsx}'],
      exclude: ['src/main.tsx', 'src/test/**']
    }
  }
});
