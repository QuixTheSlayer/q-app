import { defineConfig, devices } from '@playwright/test';

/**
 * Editor end-to-end tests. They run against the Vite dev server and the
 * json-server mock API that `npm run dev` starts (see webServer below).
 * Chromium only: the editor is built and used in Chrome.
 */
export default defineConfig({
  testDir: './playwright-test',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  // The first page load after the dev server starts compiles the whole app,
  // so keep local parallelism modest and the timeouts generous.
  workers: process.env.CI ? 1 : 3,
  timeout: 60_000,
  expect: { timeout: 10_000 },
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    // Vite's dev server port is pinned to 5173 in vite.config.ts.
    baseURL: 'http://localhost:5173',
    navigationTimeout: 60_000,
    trace: 'on-first-retry',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'], viewport: { width: 1600, height: 900 } },
    },
  ],

  /* Starts Vite on 5173 and json-server on 3030. */
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
