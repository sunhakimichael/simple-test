import { expect, type Locator, type Page } from '@playwright/test';
import { BasePage } from './BasePage';
import type { Product, SortOption } from '../test-data/products';

export class InventoryPage extends BasePage {
  protected readonly urlPattern = /\/inventory\.html$/;

  readonly title: Locator;
  readonly items: Locator;
  readonly cartLink: Locator;
  readonly cartBadge: Locator;
  readonly menuButton: Locator;
  readonly logoutLink: Locator;
  readonly sortSelect: Locator;
  readonly activeSortOption: Locator;
  readonly itemPrices: Locator;

  constructor(page: Page) {
    super(page);
    this.title = page.getByTestId('title');
    this.items = page.getByTestId('inventory-item');
    this.cartLink = page.getByTestId('shopping-cart-link');
    this.cartBadge = page.getByTestId('shopping-cart-badge');
    this.menuButton = page.getByRole('button', { name: 'Open Menu' });
    this.logoutLink = page.getByTestId('logout-sidebar-link');
    this.sortSelect = page.getByTestId('product-sort-container');
    this.activeSortOption = page.getByTestId('active-option');
    this.itemPrices = this.items.getByTestId('inventory-item-price');
  }

  async sortBy(option: SortOption): Promise<void> {
    await this.sortSelect.selectOption(option.value);
    await expect(this.activeSortOption).toHaveText(option.label);
  }

  /** Harga semua produk sesuai urutan tampil di halaman, mis. "$7.99" -> 7.99. */
  async getDisplayedPrices(): Promise<number[]> {
    const texts = await this.itemPrices.allTextContents();
    return texts.map((text) => Number(text.replace('$', '')));
  }

  private itemByName(name: string): Locator {
    return this.items.filter({ hasText: name });
  }

  async expectLoaded(expectedItemCount: number): Promise<void> {
    await this.expectToBeOnPage();
    await expect(this.title).toHaveText('Products');
    await expect(this.items).toHaveCount(expectedItemCount);
  }

  async expectProductListed(product: Product): Promise<void> {
    const item = this.itemByName(product.name);
    await expect(item).toHaveCount(1);
    await expect(item.getByTestId('inventory-item-price')).toHaveText(`$${product.price.toFixed(2)}`);
  }

  async addToCart(product: Product): Promise<void> {
    await this.itemByName(product.name).getByRole('button', { name: 'Add to cart' }).click();
  }

  async removeFromCart(product: Product): Promise<void> {
    await this.itemByName(product.name).getByRole('button', { name: 'Remove' }).click();
  }

  async expectProductInCart(product: Product): Promise<void> {
    await expect(this.itemByName(product.name).getByRole('button', { name: 'Remove' })).toBeVisible();
  }

  /** Jika count = 0, badge tidak boleh ada di DOM. */
  async expectCartBadgeCount(count: number): Promise<void> {
    if (count === 0) {
      await expect(this.cartBadge).toHaveCount(0);
    } else {
      await expect(this.cartBadge).toHaveText(String(count));
    }
  }

  async openCart(): Promise<void> {
    await this.cartLink.click();
  }

  async logout(): Promise<void> {
    await this.menuButton.click();
    await this.logoutLink.click();
  }
}
