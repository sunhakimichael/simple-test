import { ENV } from './env';

export interface WriteGuard {
  allowWrite: boolean;
  envName: string;
}

/** Guard sesuai env aktif. */
export const ENV_WRITE_GUARD: WriteGuard = { allowWrite: ENV.allowWrite, envName: ENV.name };

/** Alasan skip yang tampil di laporan untuk test yang mengubah data. */
export const WRITE_SKIP_REASON = `Operasi write dinonaktifkan di env "${ENV.name}" (read-only).`;

export class WriteBlockedError extends Error {
  constructor(operation: string, envName: string) {
    super(`Diblokir: "${operation}" mengubah data dan tidak diizinkan di env "${envName}".`);
    this.name = 'WriteBlockedError';
  }
}

/**
 * Lapis keras: dipanggil di setiap operasi yang mengubah data SEBELUM request dikirim.
 * Walau sebuah test lupa di-skip, data di env read-only (prod) tetap tidak tersentuh.
 */
export function assertWriteAllowed(operation: string, guard: WriteGuard = ENV_WRITE_GUARD): void {
  if (!guard.allowWrite) {
    throw new WriteBlockedError(operation, guard.envName);
  }
}
