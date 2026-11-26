import { test } from '../../../fixtures/pages.fixture';
import { USERS } from '../../../test-data/users';
import { PRODUCTS, INVENTORY_SIZE } from '../../../test-data/products';
import { CUSTOMER, EXPECTED_TEXT } from '../../../test-data/checkout';
import { calculateOrderTotals } from '../../../test-data/order-calculator';
import { ENV } from '../../../config/env';
import { WRITE_SKIP_REASON } from '../../../config/write-guard';

/**
 * E2E user journey utama:
 *   1. User Login
 *   2. Product Checkout (tambah produk -> keranjang)
 *   3. Form Submission (data shipping/billing)
 *   4. Payment Completion (review pembayaran -> Finish)
 *   5. Verifikasi layar konfirmasi akhir
 */
test.describe('E2E: Login -> Checkout -> Konfirmasi Pesanan', () => {
  // Journey ini menyelesaikan pesanan (write), jadi di-skip di env read-only (prod).
  test.skip(!ENV.allowWrite, WRITE_SKIP_REASON);

  const orderedProducts = [PRODUCTS.backpack, PRODUCTS.bikeLight];
  const totals = calculateOrderTotals(orderedProducts);

  test('user dapat menyelesaikan pembelian dari login sampai konfirmasi', async ({
    loginPage,
    inventoryPage,
    cartPage,
    checkoutInfoPage,
    checkoutOverviewPage,
    checkoutCompletePage,
  }) => {
    await test.step('1. User Login', async () => {
      await loginPage.goto();
      await loginPage.expectLoginFormVisible();
      await loginPage.login(USERS.standard);

      await inventoryPage.expectLoaded(INVENTORY_SIZE);
      await inventoryPage.expectCartBadgeCount(0);
    });

    await test.step('2. Product Checkout: tambah produk ke keranjang', async () => {
      for (const product of orderedProducts) {
        await inventoryPage.expectProductListed(product);
        await inventoryPage.addToCart(product);
        await inventoryPage.expectProductInCart(product);
      }
      await inventoryPage.expectCartBadgeCount(orderedProducts.length);

      await inventoryPage.openCart();
      await cartPage.expectLoaded();
      await cartPage.expectContainsExactly(orderedProducts);
      await cartPage.proceedToCheckout();
    });

    await test.step('3. Form Submission: isi data shipping/billing', async () => {
      await checkoutInfoPage.expectLoaded();
      await checkoutInfoPage.fillForm(CUSTOMER);
      await checkoutInfoPage.expectFormValues(CUSTOMER);
      await checkoutInfoPage.submit();
    });

    await test.step('4. Payment Completion: review pembayaran lalu Finish', async () => {
      await checkoutOverviewPage.expectLoaded();
      await checkoutOverviewPage.expectOrderItems(orderedProducts);
      await checkoutOverviewPage.expectPaymentInfo(EXPECTED_TEXT.paymentInfo);
      await checkoutOverviewPage.expectShippingInfo(EXPECTED_TEXT.shippingInfo);
      await checkoutOverviewPage.expectTotals(totals);
      await checkoutOverviewPage.finishOrder();
    });

    await test.step('5. Verifikasi layar konfirmasi akhir', async () => {
      await checkoutCompletePage.expectOrderConfirmed(
        EXPECTED_TEXT.confirmationHeader,
        EXPECTED_TEXT.confirmationBody,
      );

      // Setelah order selesai, keranjang harus kosong kembali.
      await checkoutCompletePage.backToProducts();
      await inventoryPage.expectLoaded(INVENTORY_SIZE);
      await inventoryPage.expectCartBadgeCount(0);
    });
  });
});
