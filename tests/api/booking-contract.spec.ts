import { test, expect } from '../../fixtures/api.fixture';
import type { APIResponse } from '@playwright/test';
import { resolveApiCredentials } from '../../config/credentials';
import {
  AUTH_CONTRACT,
  BOOKING_CONTRACT,
  BOOKING_ID_CONTRACT,
  CREATE_BOOKING_CONTRACT,
} from '../../api/contracts';
import { buildUpdatedBooking } from '../../test-data/booking';

/** Status 200 + JSON, lalu kembalikan body untuk dicocokkan dengan contract. */
async function jsonBody(response: APIResponse): Promise<unknown> {
  expect(response.status()).toBe(200);
  expect(response.headers()['content-type']).toContain('application/json');
  return response.json();
}

test.describe('API: contract respons', () => {
  test('POST /auth', async ({ bookingClient }) => {
    const body = await jsonBody(await bookingClient.auth(resolveApiCredentials()));
    expect(body).toEqual(AUTH_CONTRACT);
  });

  test('POST /booking', async ({ createBooking }) => {
    const { response } = await createBooking();
    expect(await jsonBody(response)).toEqual(CREATE_BOOKING_CONTRACT);
  });

  test('GET /booking/{id}', async ({ createBooking, bookingClient }) => {
    const { id } = await createBooking();
    expect(await jsonBody(await bookingClient.get(id))).toEqual(BOOKING_CONTRACT);
  });

  test('GET /booking: setiap item berbentuk { bookingid }', async ({ createBooking, bookingClient }) => {
    const { id } = await createBooking();

    const body = await jsonBody(await bookingClient.search());

    expect(Array.isArray(body)).toBe(true);
    const items = body as unknown[];
    expect(items.length).toBeGreaterThan(0);
    expect(items).toContainEqual({ bookingid: id });
    for (const item of items) {
      expect(item).toEqual(BOOKING_ID_CONTRACT);
    }
  });

  test('PUT /booking/{id}', async ({ createBooking, bookingClient, authToken }) => {
    const { sent, id } = await createBooking();
    const response = await bookingClient.update(id, buildUpdatedBooking(sent), authToken);
    expect(await jsonBody(response)).toEqual(BOOKING_CONTRACT);
  });

  test('PATCH /booking/{id}', async ({ createBooking, bookingClient, authToken }) => {
    const { sent, id } = await createBooking();
    const response = await bookingClient.partialUpdate(id, { firstname: `${sent.firstname}-patched` }, authToken);
    expect(await jsonBody(response)).toEqual(BOOKING_CONTRACT);
  });
});
