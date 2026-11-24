import { test, expect } from '../../fixtures/pages.fixture';
import { USERS } from '../../test-data/users';
import { INVENTORY_SIZE, SORT_OPTIONS } from '../../test-data/products';

test.describe('Sorting produk', () => {
  test.beforeEach(async ({ loginPage, inventoryPage }) => {
    await loginPage.goto();
    await loginPage.login(USERS.standard);
    await inventoryPage.expectLoaded(INVENTORY_SIZE);
  });

  test('sort "Price (low to high)" mengurutkan seluruh daftar, bukan hanya item pertama', async ({
    inventoryPage,
  }) => {
    await inventoryPage.sortBy(SORT_OPTIONS.priceLowToHigh);

    const prices = await inventoryPage.getDisplayedPrices();
    const expectedOrder = [...prices].sort((a, b) => a - b);

    // Semua produk tetap tampil dan setiap harga valid (bukan NaN).
    expect(prices).toHaveLength(INVENTORY_SIZE);
    prices.forEach((price) => expect(Number.isFinite(price)).toBe(true));

    // Seluruh urutan harus naik: dibandingkan dengan salinan yang diurutkan.
    expect(prices).toEqual(expectedOrder);
  });
});
