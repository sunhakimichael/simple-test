import type { APIRequestContext, APIResponse } from '@playwright/test';
import type { Booking, BookingSearch } from '../test-data/booking';

export interface AuthCredentials {
  username: string;
  password: string;
}

/**
 * Pembungkus endpoint Restful-Booker (padanan Page Object untuk API).
 * Method mengembalikan APIResponse mentah agar test bisa memeriksa
 * status code, header, dan body sendiri.
 */
export class BookingClient {
  constructor(private readonly request: APIRequestContext) {}

  auth(credentials: AuthCredentials): Promise<APIResponse> {
    return this.request.post('/auth', { data: credentials });
  }

  create(booking: Partial<Booking>): Promise<APIResponse> {
    return this.request.post('/booking', { data: booking });
  }

  get(id: number): Promise<APIResponse> {
    return this.request.get(`/booking/${id}`);
  }

  /** Tanpa token, Restful-Booker menolak dengan 403. */
  update(id: number, booking: Booking, token?: string): Promise<APIResponse> {
    return this.request.put(`/booking/${id}`, {
      data: booking,
      headers: token ? authCookie(token) : {},
    });
  }

  /** Hanya field yang dikirim yang diubah. Tanpa token, ditolak 403. */
  partialUpdate(id: number, patch: Partial<Booking>, token?: string): Promise<APIResponse> {
    return this.request.patch(`/booking/${id}`, {
      data: patch,
      headers: token ? authCookie(token) : {},
    });
  }

  /** GET /booking dengan filter opsional; mengembalikan daftar `{ bookingid }`. */
  search(filter: BookingSearch = {}): Promise<APIResponse> {
    const params: Record<string, string> = {};
    for (const [key, value] of Object.entries(filter)) {
      if (value !== undefined) params[key] = value;
    }
    return this.request.get('/booking', { params });
  }

  delete(id: number, token: string): Promise<APIResponse> {
    return this.request.delete(`/booking/${id}`, { headers: authCookie(token) });
  }
}

const authCookie = (token: string): Record<string, string> => ({ Cookie: `token=${token}` });
