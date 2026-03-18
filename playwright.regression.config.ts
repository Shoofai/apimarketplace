import { defineConfig, devices } from '@playwright/test';

/**
 * Config for pre-production / regression runs.
 * - Runs only tests in pre-production.spec.ts.
 * - Single project (chromium) for speed.
 * - Writes JSON report to test-results/ for the Regression Dashboard.
 * Run: npx playwright test --config=playwright.regression.config.ts
 * Or: npm run test:e2e:regression
 */
export default defineConfig({
  testDir: './tests/e2e',
  testMatch: /pre-production\.spec\.ts/,
  fullyParallel: false,
  workers: 1,
  retries: process.env.CI ? 1 : 0,
  reporter: [
    ['list'],
    ['html', { outputFolder: 'test-results/regression-html', open: 'never' }],
    ['json', { outputFile: 'test-results/regression-results.json' }],
  ],

  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:3020',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  projects: [
    {
      name: 'regression',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  outputDir: 'test-results/regression-artifacts',

  ...(process.env.BASE_URL
    ? {}
    : {
        webServer: {
          command: 'npm run dev',
          url: process.env.BASE_URL || process.env.PLAYWRIGHT_TEST_BASE_URL || 'http://localhost:3020',
          reuseExistingServer: !process.env.CI,
        },
      }),
});
