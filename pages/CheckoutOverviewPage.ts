import { expect, type Locator, type Page } from '@playwright/test';
import { BasePage } from './BasePage';
import type { Product } from '../test-data/products';
import type { OrderTotals } from '../test-data/order-calculator';
import { assertWriteAllowed } from '../config/write-guard';

/** Checkout Step Two: ringkasan pesanan, info pembayaran, dan pengiriman. */
export class CheckoutOverviewPage extends BasePage {
  protected readonly urlPattern = /\/checkout-step-two\.html$/;

  readonly title: Locator;
  readonly items: Locator;
  readonly paymentValue: Locator;
  readonly shippingValue: Locator;
  readonly subtotalLabel: Locator;
  readonly taxLabel: Locator;
  readonly totalLabel: Locator;
  readonly finishButton: Locator;
  readonly cancelButton: Locator;

  constructor(page: Page) {
    super(page);
    this.title = page.getByTestId('title');
    this.items = page.getByTestId('inventory-item');
    this.paymentValue = page.getByTestId('payment-info-value');
    this.shippingValue = page.getByTestId('shipping-info-value');
    this.subtotalLabel = page.getByTestId('subtotal-label');
    this.taxLabel = page.getByTestId('tax-label');
    this.totalLabel = page.getByTestId('total-label');
    this.finishButton = page.getByTestId('finish');
    this.cancelButton = page.getByTestId('cancel');
  }

  async expectLoaded(): Promise<void> {
    await this.expectToBeOnPage();
    await expect(this.title).toHaveText('Checkout: Overview');
  }

  async expectOrderItems(products: readonly Product[]): Promise<void> {
    await expect(this.items).toHaveCount(products.length);
    for (const product of products) {
      const row = this.items.filter({ hasText: product.name });
      await expect(row).toHaveCount(1);
      await expect(row.getByTestId('inventory-item-price')).toHaveText(`$${product.price.toFixed(2)}`);
      await expect(row.getByTestId('item-quantity')).toHaveText('1');
    }
  }

  async expectPaymentInfo(expected: string): Promise<void> {
    await expect(this.page.getByTestId('payment-info-label')).toHaveText('Payment Information:');
    await expect(this.paymentValue).toHaveText(expected);
  }

  async expectShippingInfo(expected: string): Promise<void> {
    await expect(this.page.getByTestId('shipping-info-label')).toHaveText('Shipping Information:');
    await expect(this.shippingValue).toHaveText(expected);
  }

  async expectTotals(totals: OrderTotals): Promise<void> {
    await expect(this.subtotalLabel).toHaveText(`Item total: $${totals.subtotal}`);
    await expect(this.taxLabel).toHaveText(`Tax: $${totals.tax}`);
    await expect(this.totalLabel).toHaveText(`Total: $${totals.total}`);
  }

  /** Membuat pesanan, jadi dihitung sebagai operasi write: diblokir di env read-only (prod). */
  async finishOrder(): Promise<void> {
    assertWriteAllowed('Checkout: Finish (membuat pesanan)');
    await expect(this.finishButton).toBeEnabled();
    await this.finishButton.click();
  }
}
