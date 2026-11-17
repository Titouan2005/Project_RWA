import type { Product } from "./types";

export function stockByBrand(products: Product[]) {
  const totals: Record<string, number> = {};
  for (const p of products) {
    totals[p.brand] = (totals[p.brand] ?? 0) + p.stock;
  }
  return Object.entries(totals).map(([brand, stock]) => ({ brand, stock }));
}
