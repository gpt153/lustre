import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'node',
    globals: false,
    include: ['src/**/*.test.ts'],
    exclude: ['dist/**'],
  },
  resolve: {
    // Allow vitest to resolve .js imports as TypeScript source files
    extensions: ['.ts', '.js'],
  },
})
