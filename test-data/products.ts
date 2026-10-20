export interface Product {
  name: string;
  /** Harga dalam USD, sesuai yang tampil di Sauce Demo. */
  price: number;
}

export const PRODUCTS = {
  backpack: { name: 'Sauce Labs Backpack', price: 29.99 },
  bikeLight: { name: 'Sauce Labs Bike Light', price: 9.99 },
  boltTShirt: { name: 'Sauce Labs Bolt T-Shirt', price: 15.99 },
} as const;

/** Jumlah produk yang tampil di halaman inventory. */
export const INVENTORY_SIZE = 6;
