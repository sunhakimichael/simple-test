import { test, expect } from '../../fixtures/api.fixture';
import type { BookingClient } from '../../api/BookingClient';
import type { BookingSearch } from '../../test-data/booking';

/**
 * Setiap booking punya firstname unik (`QA-<tag>`), sehingga hasil filter
 * bisa dibandingkan PERSIS walaupun API publik ini dipakai banyak orang.
 */
async function searchIds(client: BookingClient, filter: BookingSearch): Promise<unknown> {
  const response = await client.search(filter);
  expect(response.status()).toBe(200);
  return response.json();
}

test.describe('API: GET /booking dengan filter', () => {
  test('filter firstname mengembalikan tepat booking tersebut', async ({ createBooking, bookingClient }) => {
    const { sent, id } = await createBooking();
    expect(await searchIds(bookingClient, { firstname: sent.firstname })).toEqual([{ bookingid: id }]);
  });

  test('filter firstname + lastname mengembalikan tepat booking tersebut', async ({
    createBooking,
    bookingClient,
  }) => {
    const { sent, id } = await createBooking();
    expect(
      await searchIds(bookingClient, { firstname: sent.firstname, lastname: sent.lastname }),
    ).toEqual([{ bookingid: id }]);
  });

  test('firstname cocok tetapi lastname salah: kosong (filter digabung AND)', async ({
    createBooking,
    bookingClient,
  }) => {
    const { sent } = await createBooking();
    expect(
      await searchIds(bookingClient, { firstname: sent.firstname, lastname: `${sent.lastname}-salah` }),
    ).toEqual([]);
  });

  test('nama yang tidak ada: 200 dengan daftar kosong', async ({ bookingClient }) => {
    expect(await searchIds(bookingClient, { firstname: `QA-tidak-ada-${Date.now()}` })).toEqual([]);
  });

  test('setelah PATCH nama: ditemukan dengan nama baru, tidak dengan nama lama', async ({
    createBooking,
    bookingClient,
    authToken,
  }) => {
    const { sent, id } = await createBooking();
    const newFirstname = `${sent.firstname}-patched`;

    expect((await bookingClient.partialUpdate(id, { firstname: newFirstname }, authToken)).status()).toBe(200);

    expect(await searchIds(bookingClient, { firstname: newFirstname })).toEqual([{ bookingid: id }]);
    expect(await searchIds(bookingClient, { firstname: sent.firstname })).toEqual([]);
  });

  test('setelah DELETE: tidak lagi ditemukan', async ({ createBooking, bookingClient, authToken }) => {
    const { sent, id } = await createBooking();
    expect(await searchIds(bookingClient, { firstname: sent.firstname })).toEqual([{ bookingid: id }]);

    expect((await bookingClient.delete(id, authToken)).status()).toBe(201);

    expect(await searchIds(bookingClient, { firstname: sent.firstname })).toEqual([]);
  });
});
