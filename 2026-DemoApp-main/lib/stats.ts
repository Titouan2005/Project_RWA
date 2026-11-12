import type { Product } from "./types";

export function stockByBrand(products: Product[]) {
  const totals: Record<string, number> = {};
  for (const p of products) {
    totals[p.brand] = (totals[p.brand] ?? 0) + p.stock;
  }
  return Object.entries(totals).map(([brand, stock]) => ({ brand, stock }));
}

export function pricePerModel(products: Product[]) {
  return products
    .map((p) => ({ label: `${p.brand} ${p.model}`, price: p.price }))
    .sort((a, b) => a.price - b.price);
}