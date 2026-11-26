import { expect } from '@playwright/test';

/**
 * Contract respons Restful-Booker, ditulis dengan asymmetric matcher Playwright.
 *
 * Dipakai lewat `expect(body).toEqual(CONTRACT)`. `toEqual` memeriksa nama key
 * secara ketat (key hilang ATAU key tambahan = gagal), sedangkan matcher di
 * dalamnya memeriksa tipe dan format. Jadi satu assertion = key + tipe + format,
 * tanpa dependency tambahan (ajv/zod).
 */

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

export const BOOKING_CONTRACT = {
  firstname: expect.any(String),
  lastname: expect.any(String),
  totalprice: expect.any(Number),
  depositpaid: expect.any(Boolean),
  bookingdates: {
    checkin: expect.stringMatching(ISO_DATE),
    checkout: expect.stringMatching(ISO_DATE),
  },
  additionalneeds: expect.any(String),
};

/** Respons POST /booking. */
export const CREATE_BOOKING_CONTRACT = {
  bookingid: expect.any(Number),
  booking: BOOKING_CONTRACT,
};

/** Satu item dalam daftar GET /booking. */
export const BOOKING_ID_CONTRACT = {
  bookingid: expect.any(Number),
};

/** Respons POST /auth yang berhasil. */
export const AUTH_CONTRACT = {
  token: expect.any(String),
};
