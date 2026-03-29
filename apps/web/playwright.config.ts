import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  timeout: 30_000,
  retries: 1,
  reporter: [['list'], ['html']],
  outputDir: 'test-results/',
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL ?? 'https://app.lovelustre.com',
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: process.env.CI
    ? undefined
    : {
        command: 'pnpm dev',
        url: 'https://app.lovelustre.com',
        reuseExistingServer: true,
        cwd: __dirname,
        timeout: 120_000,
      },
})
