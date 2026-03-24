import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'node',
    globals: false,
  },
  resolve: {
    // Allow vitest to resolve .js imports as TypeScript source files
    extensions: ['.ts', '.js'],
  },
})
