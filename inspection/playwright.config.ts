import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './specs',
  outputDir: './output/.playwright',
  reporter: 'list',
  use: {
    baseURL: 'http://localhost:5173',
    headless: true,
    ...devices['Desktop Chrome'],
  },
  webServer: {
    // cwd '..' is required: Playwright runs this from the config dir
    // (inspection/), which has no dev:ui script — it lives at the repo root.
    command: 'npm run dev:ui',
    cwd: '..',
    url: 'http://localhost:5173',
    reuseExistingServer: true,
    timeout: 120_000,
  },
})
