import { expect, type Locator, type Page } from '@playwright/test';
import { BasePage } from './BasePage';

/** Halaman konfirmasi akhir setelah pesanan selesai. */
export class CheckoutCompletePage extends BasePage {
  protected readonly urlPattern = /\/checkout-complete\.html$/;

  readonly title: Locator;
  readonly header: Locator;
  readonly body: Locator;
  readonly image: Locator;
  readonly backHomeButton: Locator;

  constructor(page: Page) {
    super(page);
    this.title = page.getByTestId('title');
    this.header = page.getByTestId('complete-header');
    this.body = page.getByTestId('complete-text');
    this.image = page.getByTestId('pony-express');
    this.backHomeButton = page.getByTestId('back-to-products');
  }

  async expectOrderConfirmed(expectedHeader: string, expectedBody: string): Promise<void> {
    await this.expectToBeOnPage();
    await expect(this.title).toHaveText('Checkout: Complete!');
    await expect(this.header).toHaveText(expectedHeader);
    await expect(this.body).toHaveText(expectedBody);
    await expect(this.image).toBeVisible();
    await expect(this.backHomeButton).toBeEnabled();
  }

  async backToProducts(): Promise<void> {
    await this.backHomeButton.click();
  }
}
