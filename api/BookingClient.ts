import type { APIRequestContext, APIResponse } from '@playwright/test';
import type { Booking, BookingSearch } from '../test-data/booking';
import type { Credentials } from '../config/credentials';
import { ENV_WRITE_GUARD, assertWriteAllowed, type WriteGuard } from '../config/write-guard';

export type AuthCredentials = Credentials;

/**
 * Pembungkus endpoint Restful-Booker (padanan Page Object untuk API).
 * Method mengembalikan APIResponse mentah agar test bisa memeriksa
 * status code, header, dan body sendiri.
 *
 * Method yang mengubah data (create/update/partialUpdate/delete) melewati
 * `assertWriteAllowed` lebih dulu: di env read-only (prod) method tersebut
 * gagal dengan WriteBlockedError dan TIDAK mengirim request apa pun.
 */
export class BookingClient {
  constructor(
    private readonly request: APIRequestContext,
    private readonly writeGuard: WriteGuard = ENV_WRITE_GUARD,
  ) {}

  /** Login hanya membaca data, jadi tetap diizinkan di prod. */
  auth(credentials: AuthCredentials): Promise<APIResponse> {
    return this.request.post('/auth', { data: credentials });
  }

  async create(booking: Partial<Booking>): Promise<APIResponse> {
    assertWriteAllowed('POST /booking', this.writeGuard);
    return this.request.post('/booking', { data: booking });
  }

  get(id: number): Promise<APIResponse> {
    return this.request.get(`/booking/${id}`);
  }

  /** GET /booking dengan filter opsional; mengembalikan daftar `{ bookingid }`. */
  search(filter: BookingSearch = {}): Promise<APIResponse> {
    const params: Record<string, string> = {};
    for (const [key, value] of Object.entries(filter)) {
      if (value !== undefined) params[key] = value;
    }
    return this.request.get('/booking', { params });
  }

  /** Tanpa token, Restful-Booker menolak dengan 403. */
  async update(id: number, booking: Booking, token?: string): Promise<APIResponse> {
    assertWriteAllowed(`PUT /booking/${id}`, this.writeGuard);
    return this.request.put(`/booking/${id}`, {
      data: booking,
      headers: token ? authCookie(token) : {},
    });
  }

  /** Hanya field yang dikirim yang diubah. Tanpa token, ditolak 403. */
  async partialUpdate(id: number, patch: Partial<Booking>, token?: string): Promise<APIResponse> {
    assertWriteAllowed(`PATCH /booking/${id}`, this.writeGuard);
    return this.request.patch(`/booking/${id}`, {
      data: patch,
      headers: token ? authCookie(token) : {},
    });
  }

  async delete(id: number, token: string): Promise<APIResponse> {
    assertWriteAllowed(`DELETE /booking/${id}`, this.writeGuard);
    return this.request.delete(`/booking/${id}`, { headers: authCookie(token) });
  }
}

const authCookie = (token: string): Record<string, string> => ({ Cookie: `token=${token}` });
