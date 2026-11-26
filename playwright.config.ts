import { devices } from '@playwright/test';
import type { PlaywrightTestConfig } from '@playwright/test';
import { ENV } from './config/env';

/**
 * Konfigurasi Playwright untuk proyek simple-test.
 * Ditulis kompatibel dengan Playwright 1.28.x (tanpa defineConfig).
 *
 * Env (dev/staging/prod) dipilih lewat TEST_ENV; URL per env ada di config/environments.ts.
 * Cara termudah: `npm run test:staging` (lihat README).
 */

// Tampilkan env aktif sekali di awal run (bukan di setiap worker).
if (!process.env.TEST_WORKER_INDEX) {
  console.log(
    `[env] ${ENV.name} | UI: ${ENV.ui.baseURL} | API: ${ENV.api.baseURL} | write: ${
      ENV.allowWrite ? 'diizinkan' : 'DIBLOKIR (read-only)'
    }`,
  );
}

const config: PlaywrightTestConfig = {
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  timeout: 30_000,
  expect: { timeout: 7_000 },
  reporter: [['list'], ['html', { open: 'never' }]],
  // Tampil di laporan HTML agar jelas test dijalankan di env mana.
  metadata: {
    environment: ENV.name,
    uiBaseURL: ENV.ui.baseURL,
    apiBaseURL: ENV.api.baseURL,
    allowWrite: ENV.allowWrite,
  },

  use: {
    baseURL: ENV.ui.baseURL,
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
        baseURL: ENV.api.baseURL,
        extraHTTPHeaders: ENV.api.headers,
      },
    },
    // Aktifkan bila OS/versi Playwright mendukung:
    // { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    // { name: 'webkit', use: { ...devices['Desktop Safari'] } },
  ],
};

export default config;
