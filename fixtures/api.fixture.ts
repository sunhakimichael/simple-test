import { test as base, expect, type APIResponse } from '@playwright/test';
import { BookingClient } from '../api/BookingClient';
import { ENV } from '../config/env';
import { resolveApiCredentials } from '../config/credentials';
import { WRITE_SKIP_REASON } from '../config/write-guard';
import { buildBooking, type Booking } from '../test-data/booking';

export interface CreatedBooking {
  response: APIResponse;
  /** Payload yang dikirim, untuk dibandingkan dengan respons. */
  sent: Booking;
  id: number;
}

interface ApiWorkerFixtures {
  /**
   * Token admin. Diambil SEKALI per worker, bukan di setiap test.
   * Aman dipakai bersama: berupa string immutable yang hanya dibaca.
   */
  authToken: string;
}

interface ApiTestFixtures {
  bookingClient: BookingClient;
  /**
   * Membuat booking baru; semua booking yang dibuat dihapus otomatis setelah test selesai.
   * Di env read-only (prod) test yang memakai fixture ini otomatis di-skip.
   */
  createBooking: (booking?: Booking) => Promise<CreatedBooking>;
}

/** 201 = berhasil dihapus saat cleanup, 405 = sudah dihapus lebih dulu oleh test itu sendiri. */
const CLEANUP_OK_STATUSES = [201, 405];

export const test = base.extend<ApiTestFixtures, ApiWorkerFixtures>({
  authToken: [
    async ({ playwright }, use) => {
      const context = await playwright.request.newContext({
        baseURL: ENV.api.baseURL,
        extraHTTPHeaders: ENV.api.headers,
      });
      const response = await new BookingClient(context).auth(resolveApiCredentials());
      expect(response.status(), 'POST /auth harus berhasil untuk menyiapkan token').toBe(200);
      const { token } = await response.json();
      expect(typeof token, 'POST /auth harus mengembalikan token').toBe('string');
      await context.dispose();

      await use(token);
    },
    { scope: 'worker' },
  ],

  // Scope test: setiap test punya client & daftar ID sendiri, tidak ada state yang dibagi.
  bookingClient: async ({ request }, use) => {
    await use(new BookingClient(request));
  },

  createBooking: async ({ bookingClient, authToken }, use, testInfo) => {
    // Lapis lunak guard write: tampil sebagai "skipped" beserta alasannya, bukan gagal.
    testInfo.skip(!ENV.allowWrite, WRITE_SKIP_REASON);

    const createdIds: number[] = [];

    await use(async (booking = buildBooking()) => {
      const response = await bookingClient.create(booking);
      const body = response.ok() ? await response.json() : {};
      const id: number = body.bookingid;
      if (typeof id === 'number') createdIds.push(id);
      return { response, sent: booking, id };
    });

    // Cleanup independen: hanya menghapus ID milik test ini, tetap jalan walau test gagal.
    // Status dicek (soft) supaya booking yang gagal dihapus terlihat, bukan bocor diam-diam.
    for (const id of createdIds) {
      const response = await bookingClient.delete(id, authToken);
      expect
        .soft(CLEANUP_OK_STATUSES, `cleanup: DELETE /booking/${id} membalas ${response.status()}`)
        .toContain(response.status());
    }
  },
});

export { expect };
