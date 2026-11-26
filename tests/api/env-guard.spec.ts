import { test, expect, type APIRequestContext } from '@playwright/test';
import { BookingClient } from '../../api/BookingClient';
import { resolveEnvironment } from '../../config/env';
import { MissingCredentialError, resolveApiCredentials, resolveUiUsers } from '../../config/credentials';
import { WriteBlockedError } from '../../config/write-guard';
import { buildBooking, buildUpdatedBooking, uniqueTag } from '../../test-data/booking';

/**
 * Test konfigurasi env, guard write, dan keunikan data.
 * Tidak memanggil jaringan sama sekali, jadi aman dijalankan di env mana pun (termasuk prod).
 */

/** APIRequestContext palsu yang hanya mencatat panggilan, untuk membuktikan tidak ada request terkirim. */
function recordingRequest(): { request: APIRequestContext; calls: string[] } {
  const calls: string[] = [];
  const record = (method: string) => async (url: string) => {
    calls.push(`${method} ${url}`);
    return {} as never;
  };
  const request = {
    get: record('GET'),
    post: record('POST'),
    put: record('PUT'),
    patch: record('PATCH'),
    delete: record('DELETE'),
  } as unknown as APIRequestContext;
  return { request, calls };
}

test.describe('Env: pemilihan env & URL', () => {
  test('default ke dev dengan URL publik dan write diizinkan', () => {
    const env = resolveEnvironment({});
    expect(env.name).toBe('dev');
    expect(env.ui.baseURL).toBe('https://www.saucedemo.com');
    expect(env.api.baseURL).toBe('https://restful-booker.herokuapp.com');
    expect(env.allowWrite).toBe(true);
  });

  test('prod selalu read-only, termasuk saat URL di-override', () => {
    const env = resolveEnvironment({
      TEST_ENV: 'prod',
      BASE_URL: 'https://www.saucedemo.com',
      API_BASE_URL: 'https://restful-booker.herokuapp.com',
    });
    expect(env.name).toBe('prod');
    expect(env.ui.baseURL).toBe('https://www.saucedemo.com');
    expect(env.allowWrite).toBe(false);
  });

  test('TEST_ENV tidak peka huruf besar/kecil', () => {
    expect(resolveEnvironment({ TEST_ENV: 'Staging' }).name).toBe('staging');
  });

  test('TEST_ENV yang tidak dikenal langsung error dan menyebut pilihan yang valid', () => {
    expect(() => resolveEnvironment({ TEST_ENV: 'production' })).toThrow(/dev, staging, prod/);
  });
});

test.describe('Env: kredensial', () => {
  test('dev memakai kredensial demo bila env var tidak diset', () => {
    const dev = resolveEnvironment({ TEST_ENV: 'dev' });
    expect(resolveApiCredentials(dev, {})).toEqual({ username: 'admin', password: 'password123' });
    expect(resolveUiUsers(dev, {}).standard).toEqual({ username: 'standard_user', password: 'secret_sauce' });
  });

  test('env var selalu menang atas kredensial demo', () => {
    const dev = resolveEnvironment({ TEST_ENV: 'dev' });
    expect(resolveApiCredentials(dev, { API_USERNAME: 'u', API_PASSWORD: 'p' })).toEqual({
      username: 'u',
      password: 'p',
    });
  });

  for (const name of ['staging', 'prod']) {
    test(`${name} tanpa env var kredensial: error menyebut variabel yang hilang`, () => {
      const env = resolveEnvironment({ TEST_ENV: name });
      expect(() => resolveApiCredentials(env, {})).toThrow(MissingCredentialError);
      expect(() => resolveApiCredentials(env, {})).toThrow(/API_USERNAME/);
      expect(() => resolveApiCredentials(env, { API_USERNAME: 'u' })).toThrow(/API_PASSWORD/);
      expect(() => resolveUiUsers(env, {})).toThrow(/UI_USERNAME/);
    });
  }

  test('akun terkunci opsional di luar dev', () => {
    const staging = resolveEnvironment({ TEST_ENV: 'staging' });
    const users = resolveUiUsers(staging, { UI_USERNAME: 'u', UI_PASSWORD: 'p' });
    expect(users.lockedOut).toBeUndefined();
  });
});

test.describe('Guard write di env read-only', () => {
  const READ_ONLY = { allowWrite: false, envName: 'prod' };

  test('create/update/partialUpdate/delete diblokir dan TIDAK mengirim request', async () => {
    const { request, calls } = recordingRequest();
    const client = new BookingClient(request, READ_ONLY);
    const booking = buildBooking();

    await expect(client.create(booking)).rejects.toThrow(WriteBlockedError);
    await expect(client.update(1, buildUpdatedBooking(booking), 'token')).rejects.toThrow(WriteBlockedError);
    await expect(client.partialUpdate(1, { firstname: 'x' }, 'token')).rejects.toThrow(WriteBlockedError);
    await expect(client.delete(1, 'token')).rejects.toThrow(/DELETE \/booking\/1.*"prod"/);

    expect(calls).toEqual([]);
  });

  test('operasi baca (auth, get, search) tetap diteruskan', async () => {
    const { request, calls } = recordingRequest();
    const client = new BookingClient(request, READ_ONLY);

    await client.auth({ username: 'u', password: 'p' });
    await client.get(1);
    await client.search({ firstname: 'x' });

    expect(calls).toEqual(['POST /auth', 'GET /booking/1', 'GET /booking']);
  });

  test('di env yang mengizinkan write, request diteruskan', async () => {
    const { request, calls } = recordingRequest();
    const client = new BookingClient(request, { allowWrite: true, envName: 'dev' });

    await client.create(buildBooking());

    expect(calls).toEqual(['POST /booking']);
  });
});

test.describe('Isolasi data paralel', () => {
  test('uniqueTag tidak pernah berulang dalam satu worker', () => {
    const tags = Array.from({ length: 10_000 }, () => uniqueTag());
    expect(new Set(tags).size).toBe(tags.length);
  });

  test('setiap buildBooking punya firstname berbeda', () => {
    const names = Array.from({ length: 1_000 }, () => buildBooking().firstname);
    expect(new Set(names).size).toBe(names.length);
  });
});
