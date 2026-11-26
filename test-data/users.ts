import { resolveUiUsers, type Credentials } from '../config/credentials';

export type { Credentials };

/**
 * User untuk test UI.
 * - `standard` & `lockedOut` diambil dari env aktif (lihat `config/credentials.ts`):
 *   di dev memakai akun demo publik Sauce Demo, di staging/prod wajib dari env var.
 *   Dibaca saat dipakai (getter), sehingga run khusus API tidak meminta kredensial UI.
 * - `invalid` sengaja salah, jadi tetap ditulis langsung di sini.
 */
export const USERS = {
  get standard(): Credentials {
    return resolveUiUsers().standard;
  },
  /** undefined bila env ini tidak punya akun terkunci; test terkait akan di-skip. */
  get lockedOut(): Credentials | undefined {
    return resolveUiUsers().lockedOut;
  },
  invalid: { username: 'invalid_user', password: 'wrong_password' } as Credentials,
};
