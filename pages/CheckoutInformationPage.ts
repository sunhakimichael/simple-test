import { expect, type Locator, type Page } from '@playwright/test';
import { BasePage } from './BasePage';
import type { CustomerField, CustomerInfo } from '../test-data/checkout';

/** Checkout Step One: form data pengiriman / penagihan. */
export class CheckoutInformationPage extends BasePage {
  protected readonly urlPattern = /\/checkout-step-one\.html$/;

  readonly title: Locator;
  readonly firstNameInput: Locator;
  readonly lastNameInput: Locator;
  readonly postalCodeInput: Locator;
  readonly continueButton: Locator;
  readonly cancelButton: Locator;
  readonly errorMessage: Locator;
  readonly cartBadge: Locator;

  constructor(page: Page) {
    super(page);
    this.title = page.getByTestId('title');
    this.firstNameInput = page.getByTestId('firstName');
    this.lastNameInput = page.getByTestId('lastName');
    this.postalCodeInput = page.getByTestId('postalCode');
    this.continueButton = page.getByTestId('continue');
    this.cancelButton = page.getByTestId('cancel');
    this.errorMessage = page.getByTestId('error');
    this.cartBadge = page.getByTestId('shopping-cart-badge');
  }

  async expectLoaded(): Promise<void> {
    await this.expectToBeOnPage();
    await expect(this.title).toHaveText('Checkout: Your Information');
    await expect(this.firstNameInput).toBeEmpty();
    await expect(this.lastNameInput).toBeEmpty();
    await expect(this.postalCodeInput).toBeEmpty();
  }

  /** Mengisi form; field yang bernilai undefined dibiarkan kosong. */
  async fillForm(info: Partial<CustomerInfo>): Promise<void> {
    if (info.firstName !== undefined) await this.firstNameInput.fill(info.firstName);
    if (info.lastName !== undefined) await this.lastNameInput.fill(info.lastName);
    if (info.postalCode !== undefined) await this.postalCodeInput.fill(info.postalCode);
  }

  async expectFormValues(info: CustomerInfo): Promise<void> {
    await expect(this.firstNameInput).toHaveValue(info.firstName);
    await expect(this.lastNameInput).toHaveValue(info.lastName);
    await expect(this.postalCodeInput).toHaveValue(info.postalCode);
  }

  async submit(): Promise<void> {
    await this.continueButton.click();
  }

  async expectError(message: string): Promise<void> {
    await expect(this.errorMessage).toHaveText(message);
    await this.expectToBeOnPage();
  }

  /**
   * Memastikan validasi menolak submit dan checkout TIDAK berlanjut:
   * - pesan error yang tepat tampil,
   * - user tetap di Checkout Step One (URL, judul, tombol Continue masih ada),
   * - field yang kosong tetap kosong, dan isian lain tidak hilang,
   * - isi keranjang tidak berubah (pesanan belum dibuat).
   */
  async expectCheckoutBlocked(params: {
    error: string;
    /** Field yang diisi; field lain harus tetap kosong. */
    filled: Partial<CustomerInfo>;
    cartCount: number;
  }): Promise<void> {
    await expect(this.errorMessage).toHaveText(params.error);

    await this.expectToBeOnPage();
    await expect(this.title).toHaveText('Checkout: Your Information');
    await expect(this.continueButton).toBeVisible();

    for (const [field, input] of this.inputs()) {
      await expect(input).toHaveValue(params.filled[field] ?? '');
    }

    await expect(this.cartBadge).toHaveText(String(params.cartCount));
  }

  input(field: CustomerField): Locator {
    return new Map(this.inputs()).get(field) as Locator;
  }

  private inputs(): [CustomerField, Locator][] {
    return [
      ['firstName', this.firstNameInput],
      ['lastName', this.lastNameInput],
      ['postalCode', this.postalCodeInput],
    ];
  }
}
