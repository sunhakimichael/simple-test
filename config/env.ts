import { DEFAULT_ENV, ENVIRONMENTS, ENV_NAMES, type EnvName } from './environments';

export type EnvVars = Record<string, string | undefined>;

export interface ResolvedEnvironment {
  name: EnvName;
  ui: { baseURL: string };
  api: {
    baseURL: string;
    /** Restful-Booker hanya membalas JSON bila diminta lewat header Accept. */
    headers: Record<string, string>;
  };
  allowWrite: boolean;
  demoCredentials: boolean;
}

/**
 * Menentukan env aktif dari env var:
 * - `TEST_ENV`: dev | staging | prod (default dev)
 * - `BASE_URL` / `API_BASE_URL`: override URL (opsional)
 *
 * `allowWrite` selalu diambil dari `config/environments.ts` dan tidak bisa di-override,
 * sehingga mengganti URL tidak akan pernah membuka akses write di prod.
 */
export function resolveEnvironment(vars: EnvVars = process.env): ResolvedEnvironment {
  const requested = (vars.TEST_ENV || DEFAULT_ENV).trim().toLowerCase();
  if (!(ENV_NAMES as string[]).includes(requested)) {
    throw new Error(`TEST_ENV "${vars.TEST_ENV}" tidak dikenal. Pilihan yang valid: ${ENV_NAMES.join(', ')}.`);
  }
  const name = requested as EnvName;
  const definition = ENVIRONMENTS[name];

  return {
    name,
    ui: { baseURL: vars.BASE_URL || definition.uiBaseURL },
    api: {
      baseURL: vars.API_BASE_URL || definition.apiBaseURL,
      headers: { Accept: 'application/json' },
    },
    allowWrite: definition.allowWrite,
    demoCredentials: definition.demoCredentials,
  };
}

/** Env aktif untuk run ini. */
export const ENV: ResolvedEnvironment = resolveEnvironment();
