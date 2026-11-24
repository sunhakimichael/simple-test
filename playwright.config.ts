import { devices } from '@playwright/test';
import type { PlaywrightTestConfig } from '@playwright/test';
import { API_CONFIG } from './config/api.config';

/**
 * Konfigurasi Playwright untuk proyek simple-test.
 * Ditulis kompatibel dengan Playwright 1.28.x (tanpa defineConfig).
 *
 * BASE_URL dapat di-override lewat environment variable, contoh:
 *   BASE_URL=https://staging.example.com npm test
 */
const config: PlaywrightTestConfig = {
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  timeout: 30_000,
  expect: { timeout: 7_000 },
  reporter: [['list'], ['html', { open: 'never' }]],

  use: {
    baseURL: process.env.BASE_URL ?? 'https://www.saucedemo.com',
    // Sauce Demo memakai atribut data-test (bukan data-testid bawaan Playwright)
    testIdAttribute: 'data-test',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  projects: [
    // Part A: UI test Sauce Demo
    { name: 'chromium', testDir: './tests/ui', use: { ...devices['Desktop Chrome'] } },
    // Part B: API test Restful-Booker (tanpa browser, memakai fixture `request`)
    {
      name: 'api',
      testDir: './tests/api',
      use: {
        baseURL: API_CONFIG.baseURL,
        extraHTTPHeaders: API_CONFIG.headers,
      },
    },
    // Aktifkan bila OS/versi Playwright mendukung:
    // { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    // { name: 'webkit', use: { ...devices['Desktop Safari'] } },
  ],
};

export default config;
