import { expect, type Locator, type Page } from '@playwright/test';
import { BasePage } from './BasePage';
import type { Product } from '../test-data/products';

export class CartPage extends BasePage {
  protected readonly urlPattern = /\/cart\.html$/;

  readonly title: Locator;
  readonly items: Locator;
  readonly checkoutButton: Locator;
  readonly continueShoppingButton: Locator;

  constructor(page: Page) {
    super(page);
    this.title = page.getByTestId('title');
    this.items = page.getByTestId('inventory-item');
    this.checkoutButton = page.getByTestId('checkout');
    this.continueShoppingButton = page.getByTestId('continue-shopping');
  }

  async expectLoaded(): Promise<void> {
    await this.expectToBeOnPage();
    await expect(this.title).toHaveText('Your Cart');
  }

  /** Memastikan isi keranjang persis sama dengan produk yang diharapkan (nama, harga, qty). */
  async expectContainsExactly(products: readonly Product[]): Promise<void> {
    await expect(this.items).toHaveCount(products.length);
    for (const product of products) {
      const row = this.items.filter({ hasText: product.name });
      await expect(row).toHaveCount(1);
      await expect(row.getByTestId('inventory-item-price')).toHaveText(`$${product.price.toFixed(2)}`);
      await expect(row.getByTestId('item-quantity')).toHaveText('1');
    }
  }

  async removeProduct(product: Product): Promise<void> {
    await this.items.filter({ hasText: product.name }).getByRole('button', { name: 'Remove' }).click();
  }

  async proceedToCheckout(): Promise<void> {
    await expect(this.checkoutButton).toBeEnabled();
    await this.checkoutButton.click();
  }
}
