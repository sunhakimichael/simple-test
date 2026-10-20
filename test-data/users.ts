export interface Credentials {
  username: string;
  password: string;
}

/** Kredensial publik yang disediakan oleh Sauce Demo. */
export const USERS = {
  standard: { username: 'standard_user', password: 'secret_sauce' },
  lockedOut: { username: 'locked_out_user', password: 'secret_sauce' },
  invalid: { username: 'invalid_user', password: 'wrong_password' },
} as const;
