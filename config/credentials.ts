import { ENV, type EnvVars, type ResolvedEnvironment } from './env';

export interface Credentials {
  username: string;
  password: string;
}

/**
 * Kredensial demo PUBLIK dari dokumentasi Restful-Booker & Sauce Demo (bukan rahasia).
 * Hanya dipakai di env yang `demoCredentials: true` (dev).
 */
const DEMO = {
  API_USERNAME: 'admin',
  API_PASSWORD: 'password123',
  UI_USERNAME: 'standard_user',
  UI_PASSWORD: 'secret_sauce',
  UI_LOCKED_USERNAME: 'locked_out_user',
} as const;

type DemoKey = keyof typeof DEMO;

export class MissingCredentialError extends Error {
  constructor(variable: string, envName: string) {
    super(
      `Env var ${variable} wajib diisi untuk env "${envName}". ` +
        'Isi lewat terminal atau GitHub Secrets; lihat .env.example.',
    );
    this.name = 'MissingCredentialError';
  }
}

function required(key: DemoKey, env: ResolvedEnvironment, vars: EnvVars): string {
  const value = vars[key];
  if (value) return value;
  if (env.demoCredentials) return DEMO[key];
  throw new MissingCredentialError(key, env.name);
}

function optional(key: DemoKey, env: ResolvedEnvironment, vars: EnvVars): string | undefined {
  return vars[key] || (env.demoCredentials ? DEMO[key] : undefined);
}

/** Kredensial admin API. Dibaca saat dipanggil (lazy), bukan saat file di-import. */
export function resolveApiCredentials(env: ResolvedEnvironment = ENV, vars: EnvVars = process.env): Credentials {
  return {
    username: required('API_USERNAME', env, vars),
    password: required('API_PASSWORD', env, vars),
  };
}

export interface UiUsers {
  standard: Credentials;
  /** Opsional di luar dev: tidak semua env punya akun yang sengaja dikunci. */
  lockedOut?: Credentials;
}

export function resolveUiUsers(env: ResolvedEnvironment = ENV, vars: EnvVars = process.env): UiUsers {
  const standard = {
    username: required('UI_USERNAME', env, vars),
    password: required('UI_PASSWORD', env, vars),
  };
  const lockedUsername = optional('UI_LOCKED_USERNAME', env, vars);
  return {
    standard,
    lockedOut: lockedUsername
      ? { username: lockedUsername, password: vars.UI_LOCKED_PASSWORD || standard.password }
      : undefined,
  };
}
