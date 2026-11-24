import { test, expect } from '../../fixtures/api.fixture';
import {
  API_MESSAGES,
  INCOMPLETE_BOOKING,
  buildUpdatedBooking,
  type Booking,
} from '../../test-data/booking';

const JSON_CONTENT_TYPE = 'application/json';

test.describe('API: booking', () => {
  test('POST /booking membuat booking dan mengembalikan field yang sama', async ({ createBooking }) => {
    const { response, sent, id } = await createBooking();

    expect(response.status()).toBe(200);
    expect(response.headers()['content-type']).toContain(JSON_CONTENT_TYPE);
    expect(id).toBeGreaterThan(0);

    const body = await response.json();
    expect(body).toEqual({ bookingid: id, booking: sent });
  });

  test('GET /booking/{id} mengembalikan booking yang sama', async ({ createBooking, bookingClient }) => {
    const { sent, id } = await createBooking();

    const response = await bookingClient.get(id);

    expect(response.status()).toBe(200);
    expect(response.headers()['content-type']).toContain(JSON_CONTENT_TYPE);
    expect(await response.json()).toEqual(sent);
  });

  test('PUT /booking/{id} dengan token mengubah setiap field', async ({
    createBooking,
    bookingClient,
    authToken,
  }) => {
    const { sent, id } = await createBooking();
    const updated = buildUpdatedBooking(sent);

    const response = await bookingClient.update(id, updated, authToken);

    expect(response.status()).toBe(200);
    expect(response.headers()['content-type']).toContain(JSON_CONTENT_TYPE);
    expect(await response.json()).toEqual(updated);

    // Verifikasi lewat GET lanjutan bahwa perubahan benar-benar tersimpan.
    const followUp = await bookingClient.get(id);
    expect(followUp.status()).toBe(200);
    expect(await followUp.json()).toEqual(updated);
  });

  test('DELETE /booking/{id} menghapus booking, GET berikutnya 404', async ({
    createBooking,
    bookingClient,
    authToken,
  }) => {
    const { id } = await createBooking();

    const response = await bookingClient.delete(id, authToken);
    expect(response.status()).toBe(201);

    const followUp = await bookingClient.get(id);
    expect(followUp.status()).toBe(404);
    expect(await followUp.text()).toBe(API_MESSAGES.notFound);
  });
});

test.describe('API: booking (negatif)', () => {
  test('PUT tanpa token ditolak 403 dan data tidak berubah', async ({ createBooking, bookingClient }) => {
    const { sent, id } = await createBooking();

    const response = await bookingClient.update(id, buildUpdatedBooking(sent));

    expect(response.status()).toBe(403);
    expect(await response.text()).toBe(API_MESSAGES.forbidden);

    const followUp = await bookingClient.get(id);
    expect(await followUp.json()).toEqual(sent);
  });

  test('POST dengan payload tidak lengkap ditolak', async ({ createBooking }) => {
    // Lewat fixture createBooking (bukan client langsung) agar tetap dibersihkan bila API ternyata menerimanya.
    const { response, id } = await createBooking(INCOMPLETE_BOOKING as Booking);

    // Restful-Booker tidak memvalidasi dengan 400; payload tidak lengkap menghasilkan 500.
    expect(response.status()).toBe(500);
    expect(await response.text()).toBe(API_MESSAGES.serverError);
    expect(id).toBeUndefined();
  });
});
