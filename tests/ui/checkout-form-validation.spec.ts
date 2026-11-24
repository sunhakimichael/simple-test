import { test } from '../../fixtures/pages.fixture';
import { USERS } from '../../test-data/users';
import { PRODUCTS } from '../../test-data/products';
import { CUSTOMER, CHECKOUT_ERRORS } from '../../test-data/checkout';

test.describe('Validasi form checkout (Shipping/Billing Info)', () => {
  test.beforeEach(async ({ loginPage, inventoryPage, cartPage, checkoutInfoPage }) => {
    await loginPage.goto();
    await loginPage.login(USERS.standard);
    await inventoryPage.addToCart(PRODUCTS.backpack);
    await inventoryPage.openCart();
    await cartPage.proceedToCheckout();
    await checkoutInfoPage.expectLoaded();
  });

  test('error muncul bila First Name kosong', async ({ checkoutInfoPage }) => {
    await checkoutInfoPage.fillForm({ lastName: CUSTOMER.lastName, postalCode: CUSTOMER.postalCode });
    await checkoutInfoPage.submit();
    await checkoutInfoPage.expectError(CHECKOUT_ERRORS.firstNameRequired);
  });

  test('error muncul bila Last Name kosong', async ({ checkoutInfoPage }) => {
    await checkoutInfoPage.fillForm({ firstName: CUSTOMER.firstName, postalCode: CUSTOMER.postalCode });
    await checkoutInfoPage.submit();
    await checkoutInfoPage.expectError(CHECKOUT_ERRORS.lastNameRequired);
  });

  test('error muncul bila Postal Code kosong', async ({ checkoutInfoPage }) => {
    await checkoutInfoPage.fillForm({ firstName: CUSTOMER.firstName, lastName: CUSTOMER.lastName });
    await checkoutInfoPage.submit();
    await checkoutInfoPage.expectError(CHECKOUT_ERRORS.postalCodeRequired);
  });

  test('cancel mengembalikan user ke keranjang dengan isi tetap', async ({ checkoutInfoPage, cartPage }) => {
    await checkoutInfoPage.cancelButton.click();
    await cartPage.expectLoaded();
    await cartPage.expectContainsExactly([PRODUCTS.backpack]);
  });
});
