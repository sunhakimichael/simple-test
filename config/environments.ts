/**
 * Daftar env yang didukung. File ini HANYA berisi data yang tidak rahasia
 * (URL dan aturan). Kredensial tidak pernah ditulis di sini; lihat `config/credentials.ts`.
 *
 * URL staging/prod adalah placeholder: ganti di sini, atau override saat run
 * lewat env var `BASE_URL` (UI) dan `API_BASE_URL` (API).
 */
export interface EnvironmentDefinition {
  /** Base URL aplikasi web (Sauce Demo). */
  uiBaseURL: string;
  /** Base URL API (Restful-Booker). */
  apiBaseURL: string;
  /** false = operasi yang mengubah data (buat/ubah/hapus booking, menyelesaikan pesanan) diblokir. */
  allowWrite: boolean;
  /** true = boleh memakai kredensial demo publik bila env var kredensial tidak diset. */
  demoCredentials: boolean;
}

export const ENVIRONMENTS = {
  dev: {
    uiBaseURL: 'https://www.saucedemo.com',
    apiBaseURL: 'https://restful-booker.herokuapp.com',
    allowWrite: true,
    demoCredentials: true,
  },
  staging: {
    uiBaseURL: 'https://staging.saucedemo.example',
    apiBaseURL: 'https://staging.restful-booker.example',
    allowWrite: true,
    demoCredentials: false,
  },
  prod: {
    uiBaseURL: 'https://saucedemo.example',
    apiBaseURL: 'https://restful-booker.example',
    // Tidak bisa di-override: test tidak boleh mengubah data di production.
    allowWrite: false,
    demoCredentials: false,
  },
} as const;

export type EnvName = keyof typeof ENVIRONMENTS;

export const ENV_NAMES = Object.keys(ENVIRONMENTS) as EnvName[];

export const DEFAULT_ENV: EnvName = 'dev';
