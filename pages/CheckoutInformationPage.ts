import { expect, type Locator, type Page } from '@playwright/test';
import { BasePage } from './BasePage';
import type { CustomerInfo } from '../test-data/checkout';

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

  constructor(page: Page) {
    super(page);
    this.title = page.getByTestId('title');
    this.firstNameInput = page.getByTestId('firstName');
    this.lastNameInput = page.getByTestId('lastName');
    this.postalCodeInput = page.getByTestId('postalCode');
    this.continueButton = page.getByTestId('continue');
    this.cancelButton = page.getByTestId('cancel');
    this.errorMessage = page.getByTestId('error');
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
}
