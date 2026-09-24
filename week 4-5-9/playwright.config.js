// @ts-check
const { defineConfig } = require('@playwright/test');
const path = require('path');
const dotenv = require('dotenv');

// This project is self-contained, so its .env lives here too (not shared with the
// other week_* projects). See .env.example for the expected variables.
dotenv.config({ path: path.resolve(__dirname, '.env') });

module.exports = defineConfig({
  testDir: './tests',
  // demoqa.com's Book Store search can render very slowly - well beyond the default
  // 30s - especially in a run that also makes several API calls; see the "Findings
  // during implementation" section of docs/book-store-test-plan.md for the measured evidence.
  timeout: 60_000,
  expect: {
    timeout: 10_000,
  },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  // demoqa.com's Book Store search occasionally hangs on first render (confirmed to be
  // the live site's own flakiness, not a locator/timing bug - see docs/book-store-test-plan.md).
  // One local retry absorbs that without masking a real regression, which would fail twice.
  retries: process.env.CI ? 2 : 1,
  workers: 1,
  reporter: 'html',
  use: {
    // Comes from the local .env (BASE_URL=https://demoqa.com), falls back to the
    // same value if that file or variable is missing.
    baseURL: process.env.BASE_URL || 'https://demoqa.com',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: {
        browserName: 'chromium',
        viewport: null,
        launchOptions: {
          args: ['--start-maximized'],
        },
      },
    },
  ],
});
