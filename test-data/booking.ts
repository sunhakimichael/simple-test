export interface BookingDates {
  checkin: string;
  checkout: string;
}

export interface Booking {
  firstname: string;
  lastname: string;
  totalprice: number;
  depositpaid: boolean;
  bookingdates: BookingDates;
  additionalneeds: string;
}

/** Penanda unik agar data milik test ini mudah dikenali di API publik yang dipakai banyak orang. */
const uniqueTag = (): string => `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;

/** Booking baru dengan nama unik. Setiap test membuat datanya sendiri. */
export function buildBooking(overrides: Partial<Booking> = {}): Booking {
  return {
    firstname: `QA-${uniqueTag()}`,
    lastname: 'Tester',
    totalprice: 150,
    depositpaid: true,
    bookingdates: { checkin: '2027-01-10', checkout: '2027-01-15' },
    additionalneeds: 'Breakfast',
    ...overrides,
  };
}

/** Versi baru dari sebuah booking dengan SETIAP field diubah. */
export function buildUpdatedBooking(original: Booking): Booking {
  return {
    firstname: `${original.firstname}-updated`,
    lastname: `${original.lastname}-updated`,
    totalprice: original.totalprice + 75,
    depositpaid: !original.depositpaid,
    bookingdates: { checkin: '2027-02-01', checkout: '2027-02-07' },
    additionalneeds: 'Late checkout',
  };
}

/** Payload tidak lengkap (hanya firstname) untuk test negatif. */
export const INCOMPLETE_BOOKING: Partial<Booking> = { firstname: 'OnlyFirstName' };

export const INVALID_CREDENTIALS = { username: 'admin', password: 'wrong-password' };

/** Respons yang dikembalikan Restful-Booker untuk kasus gagal. */
export const API_MESSAGES = {
  badCredentials: 'Bad credentials',
  forbidden: 'Forbidden',
  notFound: 'Not Found',
  serverError: 'Internal Server Error',
} as const;
