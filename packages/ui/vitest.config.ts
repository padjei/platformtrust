import { defineConfig } from 'vitest/config';

export default defineConfig({
  // Use esbuild's automatic JSX runtime so no extra Babel/React plugin is needed.
  esbuild: { jsx: 'automatic' },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.test.{ts,tsx}'],
  },
});
