/**
 * Konfigurasi API Restful-Booker.
 * Semua nilai bisa di-override lewat environment variable, contoh:
 *   API_BASE_URL=https://restful-booker.herokuapp.com API_USERNAME=admin API_PASSWORD=password123 npm run test:api
 *
 * Nilai default adalah kredensial admin publik dari dokumentasi Restful-Booker, bukan rahasia.
 */
export const API_CONFIG = {
  baseURL: process.env.API_BASE_URL ?? 'https://restful-booker.herokuapp.com',
  credentials: {
    username: process.env.API_USERNAME ?? 'admin',
    password: process.env.API_PASSWORD ?? 'password123',
  },
  /** Restful-Booker hanya membalas JSON bila diminta lewat header Accept. */
  headers: {
    Accept: 'application/json',
  },
} as const;
