#!/usr/bin/env node
/**
 * Menjalankan Playwright di env tertentu, sama di Windows, macOS, dan Linux.
 *
 *   node scripts/run-tests.js <dev|staging|prod> [argumen playwright...]
 *
 * Contoh (lewat npm):
 *   npm run test:staging
 *   npm run test:staging -- --project=api
 *   npm run test:prod -- -g "login"
 *
 * Script ini ada karena `TEST_ENV=staging npm test` tidak jalan di PowerShell/CMD.
 */
const { spawnSync } = require('child_process');
const path = require('path');

const ENV_NAMES = ['dev', 'staging', 'prod'];
const [envName, ...playwrightArgs] = process.argv.slice(2);

if (!ENV_NAMES.includes(envName)) {
  console.error(`Env "${envName ?? ''}" tidak dikenal. Pilih salah satu: ${ENV_NAMES.join(', ')}.`);
  console.error('Contoh: npm run test:staging');
  process.exit(2);
}

// Memanggil CLI Playwright langsung lewat Node (tanpa shell), sehingga argumen
// yang mengandung spasi seperti -g "password kosong" tetap utuh di semua OS.
const cli = path.join(path.dirname(require.resolve('@playwright/test/package.json')), 'cli.js');

const result = spawnSync(process.execPath, [cli, 'test', ...playwrightArgs], {
  stdio: 'inherit',
  env: { ...process.env, TEST_ENV: envName },
});

process.exit(result.status === null ? 1 : result.status);
