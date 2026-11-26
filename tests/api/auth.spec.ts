import { test, expect } from '../../fixtures/api.fixture';
import { resolveApiCredentials } from '../../config/credentials';
import { API_MESSAGES, INVALID_CREDENTIALS } from '../../test-data/booking';

test.describe('API: POST /auth', () => {
  test('kredensial admin valid mengembalikan token', async ({ bookingClient }) => {
    const response = await bookingClient.auth(resolveApiCredentials());

    expect(response.status()).toBe(200);
    expect(response.headers()['content-type']).toContain('application/json');
    const body = await response.json();
    expect(body).toEqual({ token: expect.stringMatching(/^\w+$/) });
  });

  test('negatif: kredensial salah tidak mengembalikan token', async ({ bookingClient }) => {
    const response = await bookingClient.auth(INVALID_CREDENTIALS);

    // Restful-Booker membalas 200 dengan alasan penolakan, bukan 401.
    expect(response.status()).toBe(200);
    expect(response.headers()['content-type']).toContain('application/json');
    const body = await response.json();
    expect(body).toEqual({ reason: API_MESSAGES.badCredentials });
    expect(body).not.toHaveProperty('token');
  });
});
