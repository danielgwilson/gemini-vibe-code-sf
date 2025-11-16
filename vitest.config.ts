import { resolve } from 'node:path';
import react from '@vitejs/plugin-react';
import { config } from 'dotenv';
import tsconfigPaths from 'vite-tsconfig-paths';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  test: {
    env: { ...config({ path: '.env.test' }).parsed },
    environment: 'jsdom',
    alias: {
      'server-only': resolve(__dirname, 'src/tests/server-only-mock.ts'),
    },
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
});
