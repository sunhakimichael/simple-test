import { expect, type Page } from '@playwright/test';

/**
 * Kelas dasar untuk semua Page Object.
 * Setiap halaman wajib mendefinisikan pola URL-nya sehingga
 * `expectToBeOnPage()` bisa dipakai sebagai assertion navigasi.
 */
export abstract class BasePage {
  protected abstract readonly urlPattern: RegExp;

  constructor(protected readonly page: Page) {}

  async expectToBeOnPage(): Promise<void> {
    await expect(this.page).toHaveURL(this.urlPattern);
  }
}
