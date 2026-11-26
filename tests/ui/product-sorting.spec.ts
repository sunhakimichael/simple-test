import { test } from '../../fixtures/pages.fixture';
import { USERS } from '../../test-data/users';
import {
  DEFAULT_SORT,
  INVENTORY_SIZE,
  SORT_OPTIONS,
  expectedOrder,
} from '../../test-data/products';

/**
 * Multi-sorting: satu skenario reusable dijalankan untuk setiap opsi di SORT_OPTIONS.
 *
 * Expected order TIDAK dibaca dari UI. Nilainya dihitung dari katalog statis
 * (test-data/products.ts → CATALOG) dengan aturan sort masing-masing opsi.
 * Assertion membandingkan SELURUH daftar (jumlah, nama, harga, per posisi),
 * bukan hanya item pertama.
 */
test.describe('Sorting produk', () => {
  test.beforeEach(async ({ loginPage, inventoryPage }) => {
    await loginPage.goto();
    await loginPage.login(USERS.standard);
    await inventoryPage.expectLoaded(INVENTORY_SIZE);
  });

  test(`urutan default saat halaman dibuka adalah "${DEFAULT_SORT.label}"`, async ({ inventoryPage }) => {
    await inventoryPage.expectActiveSort(DEFAULT_SORT);
    await inventoryPage.expectProductsInOrder(expectedOrder(DEFAULT_SORT));
  });

  // Satu test per opsi sort: Name A-Z, Name Z-A, Price low-high, Price high-low.
  for (const option of Object.values(SORT_OPTIONS)) {
    test(`sort "${option.label}" mengurutkan seluruh daftar produk`, async ({ inventoryPage }) => {
      await inventoryPage.sortBy(option);
      await inventoryPage.expectProductsInOrder(expectedOrder(option));
    });
  }

  test('ganti sort berturut-turut di halaman yang sama tetap menghasilkan urutan yang benar', async ({
    inventoryPage,
  }) => {
    // Mulai dari opsi non-default dan akhiri kembali ke default, agar setiap
    // perpindahan berangkat dari urutan yang berbeda.
    const sequence = [
      SORT_OPTIONS.priceHighToLow,
      SORT_OPTIONS.nameZToA,
      SORT_OPTIONS.priceLowToHigh,
      SORT_OPTIONS.nameAToZ,
    ];

    for (const option of sequence) {
      await test.step(option.label, async () => {
        await inventoryPage.sortBy(option);
        await inventoryPage.expectProductsInOrder(expectedOrder(option));
      });
    }
  });
});
