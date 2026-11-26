import { test } from '../../fixtures/pages.fixture';
import { USERS } from '../../test-data/users';
import { PRODUCTS } from '../../test-data/products';
import {
  CHECKOUT_ERRORS,
  CUSTOMER,
  REQUIRED_FIELD_CASES,
  customerWithout,
} from '../../test-data/checkout';

const CART = [PRODUCTS.backpack];

test.describe('Validasi form checkout (Shipping/Billing Info)', () => {
  test.beforeEach(async ({ loginPage, inventoryPage, cartPage, checkoutInfoPage }) => {
    await loginPage.goto();
    await loginPage.login(USERS.standard);
    for (const product of CART) {
      await inventoryPage.addToCart(product);
    }
    await inventoryPage.openCart();
    await cartPage.proceedToCheckout();
    await checkoutInfoPage.expectLoaded();
  });

  // Negatif: satu test per field wajib (First Name, Last Name, Postal Code).
  for (const { field, label, expectedError } of REQUIRED_FIELD_CASES) {
    test(`${label} kosong: error tampil dan checkout tidak berlanjut`, async ({
      checkoutInfoPage,
      checkoutOverviewPage,
    }) => {
      const filled = customerWithout(field);

      await test.step(`isi form tanpa ${label}, lalu Continue`, async () => {
        await checkoutInfoPage.fillForm(filled);
        await checkoutInfoPage.submit();
      });

      await test.step('error tampil dan user tertahan di Checkout Step One', async () => {
        await checkoutInfoPage.expectCheckoutBlocked({ error: expectedError, filled, cartCount: CART.length });
      });

      await test.step('Continue diklik lagi tanpa perbaikan: tetap ditolak', async () => {
        await checkoutInfoPage.submit();
        await checkoutInfoPage.expectCheckoutBlocked({ error: expectedError, filled, cartCount: CART.length });
      });

      // Kontrol: membuktikan penyebab blokir memang field ini, bukan hal lain.
      await test.step(`setelah ${label} diisi, checkout baru berlanjut`, async () => {
        await checkoutInfoPage.input(field).fill(CUSTOMER[field]);
        await checkoutInfoPage.submit();
        await checkoutOverviewPage.expectLoaded();
        await checkoutOverviewPage.expectOrderItems(CART);
      });
    });
  }

  test('semua field kosong: error First Name tampil lebih dulu dan checkout tidak berlanjut', async ({
    checkoutInfoPage,
  }) => {
    await checkoutInfoPage.submit();
    await checkoutInfoPage.expectCheckoutBlocked({
      error: CHECKOUT_ERRORS.firstNameRequired,
      filled: {},
      cartCount: CART.length,
    });
  });

  test('cancel mengembalikan user ke keranjang dengan isi tetap', async ({ checkoutInfoPage, cartPage }) => {
    await checkoutInfoPage.cancelButton.click();
    await cartPage.expectLoaded();
    await cartPage.expectContainsExactly(CART);
  });
});
