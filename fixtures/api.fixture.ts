import { test as base, expect, type APIResponse } from '@playwright/test';
import { BookingClient } from '../api/BookingClient';
import { API_CONFIG } from '../config/api.config';
import { buildBooking, type Booking } from '../test-data/booking';

export interface CreatedBooking {
  response: APIResponse;
  /** Payload yang dikirim, untuk dibandingkan dengan respons. */
  sent: Booking;
  id: number;
}

interface ApiWorkerFixtures {
  /** Token admin. Diambil SEKALI per worker, bukan di setiap test. */
  authToken: string;
}

interface ApiTestFixtures {
  bookingClient: BookingClient;
  /** Membuat booking baru; semua booking yang dibuat dihapus otomatis setelah test selesai. */
  createBooking: (booking?: Booking) => Promise<CreatedBooking>;
}

export const test = base.extend<ApiTestFixtures, ApiWorkerFixtures>({
  authToken: [
    async ({ playwright }, use) => {
      const context = await playwright.request.newContext({
        baseURL: API_CONFIG.baseURL,
        extraHTTPHeaders: API_CONFIG.headers,
      });
      const response = await new BookingClient(context).auth(API_CONFIG.credentials);
      expect(response.status(), 'POST /auth harus berhasil untuk menyiapkan token').toBe(200);
      const { token } = await response.json();
      expect(typeof token, 'POST /auth harus mengembalikan token').toBe('string');
      await context.dispose();

      await use(token);
    },
    { scope: 'worker' },
  ],

  bookingClient: async ({ request }, use) => {
    await use(new BookingClient(request));
  },

  createBooking: async ({ bookingClient, authToken }, use) => {
    const createdIds: number[] = [];

    await use(async (booking = buildBooking()) => {
      const response = await bookingClient.create(booking);
      const body = response.ok() ? await response.json() : {};
      const id: number = body.bookingid;
      if (typeof id === 'number') createdIds.push(id);
      return { response, sent: booking, id };
    });

    // Cleanup: hapus semua booking yang dibuat test ini, walau test gagal.
    // Status tidak di-assert karena test bisa saja sudah menghapusnya sendiri.
    for (const id of createdIds) {
      await bookingClient.delete(id, authToken);
    }
  },
});

export { expect };
