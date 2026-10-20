import type { Product } from './products';

/** Tarif pajak yang diterapkan Sauce Demo (8%). */
const TAX_RATE = 0.08;

export interface OrderTotals {
  subtotal: string;
  tax: string;
  total: string;
}

const toUsd = (cents: number): string => (cents / 100).toFixed(2);

/**
 * Menghitung subtotal, pajak, dan total pesanan.
 * Perhitungan dilakukan dalam satuan sen agar terhindar dari error floating point.
 */
export function calculateOrderTotals(products: readonly Product[]): OrderTotals {
  const subtotalCents = products.reduce((sum, p) => sum + Math.round(p.price * 100), 0);
  const taxCents = Math.round(subtotalCents * TAX_RATE);
  return {
    subtotal: toUsd(subtotalCents),
    tax: toUsd(taxCents),
    total: toUsd(subtotalCents + taxCents),
  };
}
