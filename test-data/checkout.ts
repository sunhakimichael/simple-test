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

export const LOGIN_ERRORS = {
  invalidCredentials:
    'Epic sadface: Username and password do not match any user in this service',
  lockedOut: 'Epic sadface: Sorry, this user has been locked out.',
  usernameRequired: 'Epic sadface: Username is required',
  passwordRequired: 'Epic sadface: Password is required',
} as const;
