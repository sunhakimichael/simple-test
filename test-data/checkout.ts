export interface CustomerInfo {
  firstName: string;
  lastName: string;
  postalCode: string;
}

export const CUSTOMER: CustomerInfo = {
  firstName: 'Jane',
  lastName: 'Doe',
  postalCode: '12345',
};

/** Teks statis yang ditampilkan Sauce Demo pada halaman checkout. */
export const EXPECTED_TEXT = {
  paymentInfo: 'SauceCard #31337',
  shippingInfo: 'Free Pony Express Delivery!',
  confirmationHeader: 'Thank you for your order!',
  confirmationBody:
    'Your order has been dispatched, and will arrive just as fast as the pony can get there!',
} as const;

export const CHECKOUT_ERRORS = {
  firstNameRequired: 'Error: First Name is required',
  lastNameRequired: 'Error: Last Name is required',
  postalCodeRequired: 'Error: Postal Code is required',
} as const;

export type CustomerField = keyof CustomerInfo;

/** Satu kasus negatif: field wajib yang dikosongkan beserta error yang diharapkan. */
export interface RequiredFieldCase {
  field: CustomerField;
  /** Nama field seperti tampil di placeholder form. */
  label: string;
  expectedError: string;
}

/** Field wajib di form checkout. Satu test negatif dibuat untuk setiap entri. */
export const REQUIRED_FIELD_CASES: readonly RequiredFieldCase[] = [
  { field: 'firstName', label: 'First Name', expectedError: CHECKOUT_ERRORS.firstNameRequired },
  { field: 'lastName', label: 'Last Name', expectedError: CHECKOUT_ERRORS.lastNameRequired },
  { field: 'postalCode', label: 'Postal Code', expectedError: CHECKOUT_ERRORS.postalCodeRequired },
];

/** Data customer lengkap KECUALI satu field (field itu tidak diisi sama sekali). */
export function customerWithout(field: CustomerField, customer: CustomerInfo = CUSTOMER): Partial<CustomerInfo> {
  const partial: Partial<CustomerInfo> = { ...customer };
  delete partial[field];
  return partial;
}

export const LOGIN_ERRORS = {
  invalidCredentials:
    'Epic sadface: Username and password do not match any user in this service',
  lockedOut: 'Epic sadface: Sorry, this user has been locked out.',
  usernameRequired: 'Epic sadface: Username is required',
  passwordRequired: 'Epic sadface: Password is required',
  inventoryRequiresLogin: "You can only access '/inventory.html' when you are logged in.",
} as const;
