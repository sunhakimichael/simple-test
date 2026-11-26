export interface Product {
  name: string;
  /** Harga dalam USD, sesuai yang tampil di Sauce Demo. */
  price: number;
}

/** Produk yang dipakai langsung oleh test (mis. untuk ditambahkan ke keranjang). */
export const PRODUCTS = {
  backpack: { name: 'Sauce Labs Backpack', price: 29.99 },
  bikeLight: { name: 'Sauce Labs Bike Light', price: 9.99 },
  boltTShirt: { name: 'Sauce Labs Bolt T-Shirt', price: 15.99 },
  fleeceJacket: { name: 'Sauce Labs Fleece Jacket', price: 49.99 },
  onesie: { name: 'Sauce Labs Onesie', price: 7.99 },
  redTShirt: { name: 'Test.allTheThings() T-Shirt (Red)', price: 15.99 },
} as const;

/**
 * KATALOG LENGKAP Sauce Demo untuk user `standard_user`: sumber expected data test sorting.
 *
 * Asal data: snapshot nama & harga keenam produk di halaman /inventory.html
 * (dicatat 26 Nov 2026). Sengaja ditulis TIDAK berurutan supaya urutan yang
 * diharapkan benar-benar dihasilkan oleh aturan sort di bawah, bukan kebetulan
 * cocok dengan urutan penulisan.
 *
 * Bila Sauce Labs menambah/mengubah produk, cukup perbarui daftar ini.
 */
export const CATALOG: readonly Product[] = [
  PRODUCTS.fleeceJacket,
  PRODUCTS.onesie,
  PRODUCTS.redTShirt,
  PRODUCTS.backpack,
  PRODUCTS.boltTShirt,
  PRODUCTS.bikeLight,
];

/** Jumlah produk yang tampil di halaman inventory. */
export const INVENTORY_SIZE = CATALOG.length;

// ---------------------------------------------------------------------------
// Aturan sorting
// ---------------------------------------------------------------------------

type Comparator = (a: Product, b: Product) => number;

const byNameAsc: Comparator = (a, b) => a.name.localeCompare(b.name, 'en');

/**
 * Sort harga dengan tie-breaker Name A-Z.
 * Sauce Demo memakai sort stabil dari urutan default (Name A-Z): produk dengan
 * harga sama (Bolt T-Shirt & Test.allTheThings() T-Shirt, $15.99) tetap berurutan
 * A-Z, baik di low-high MAUPUN high-low. Perilaku ini diamati langsung di situs.
 */
const byPrice =
  (direction: 1 | -1): Comparator =>
  (a, b) =>
    (a.price - b.price) * direction || byNameAsc(a, b);

export interface SortOption {
  /** Nilai atribut `value` pada <option> dropdown sort. */
  value: string;
  /** Teks yang tampil setelah opsi dipilih. */
  label: string;
  /** Aturan urutan yang diharapkan, dipakai untuk menghitung expected order dari CATALOG. */
  compare: Comparator;
}

export type SortKey = 'nameAToZ' | 'nameZToA' | 'priceLowToHigh' | 'priceHighToLow';

// Catatan: Playwright 1.28 belum mendukung keyword `satisfies`, jadi pakai anotasi tipe biasa.
export const SORT_OPTIONS: Readonly<Record<SortKey, SortOption>> = {
  nameAToZ: { value: 'az', label: 'Name (A to Z)', compare: byNameAsc },
  nameZToA: { value: 'za', label: 'Name (Z to A)', compare: (a, b) => byNameAsc(b, a) },
  priceLowToHigh: { value: 'lohi', label: 'Price (low to high)', compare: byPrice(1) },
  priceHighToLow: { value: 'hilo', label: 'Price (high to low)', compare: byPrice(-1) },
};

/** Urutan default saat halaman inventory pertama kali dibuka. */
export const DEFAULT_SORT = SORT_OPTIONS.nameAToZ;

/**
 * Expected order: katalog diurutkan dengan aturan opsi sort.
 * Tidak membaca apa pun dari UI, jadi menjadi oracle yang independen.
 */
export function expectedOrder(option: SortOption, catalog: readonly Product[] = CATALOG): Product[] {
  return [...catalog].sort(option.compare);
}
