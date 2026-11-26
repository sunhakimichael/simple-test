import { test, expect } from '../../fixtures/api.fixture';
import { API_MESSAGES, NAME_PATCH_CASES } from '../../test-data/booking';

test.describe('API: PATCH /booking/{id} (ubah nama saja)', () => {
  for (const { label, build } of NAME_PATCH_CASES) {
    test(`PATCH ${label}: nama berubah, field lain tetap`, async ({ createBooking, bookingClient, authToken }) => {
      const { sent, id } = await createBooking();
      const patch = build(sent);
      // Ekspektasi dibangun dari payload ASLI: hanya key di `patch` yang boleh berbeda.
      // toEqual membandingkan seluruh objek, jadi totalprice, depositpaid,
      // bookingdates, dan additionalneeds ikut dibuktikan tidak berubah.
      const expected = { ...sent, ...patch };

      const response = await bookingClient.partialUpdate(id, patch, authToken);
      expect(response.status()).toBe(200);
      expect(await response.json()).toEqual(expected);

      // GET lanjutan: perubahan tersimpan di server dan field lain tetap utuh.
      const followUp = await bookingClient.get(id);
      expect(followUp.status()).toBe(200);
      expect(await followUp.json()).toEqual(expected);
    });
  }
});

test.describe('API: PATCH /booking/{id} (negatif)', () => {
  test('PATCH tanpa token ditolak 403 dan data tidak berubah', async ({ createBooking, bookingClient }) => {
    const { sent, id } = await createBooking();

    const response = await bookingClient.partialUpdate(id, { firstname: `${sent.firstname}-patched` });

    expect(response.status()).toBe(403);
    expect(await response.text()).toBe(API_MESSAGES.forbidden);

    const followUp = await bookingClient.get(id);
    expect(await followUp.json()).toEqual(sent);
  });

  test('PATCH booking yang sudah dihapus ditolak 405', async ({ createBooking, bookingClient, authToken }) => {
    const { sent, id } = await createBooking();
    expect((await bookingClient.delete(id, authToken)).status()).toBe(201);

    const response = await bookingClient.partialUpdate(id, { firstname: `${sent.firstname}-patched` }, authToken);

    // Restful-Booker mengembalikan 405 (bukan 404) untuk ID yang tidak ada.
    expect(response.status()).toBe(405);
    expect(await response.text()).toBe(API_MESSAGES.methodNotAllowed);
    expect((await bookingClient.get(id)).status()).toBe(404);
  });
});
