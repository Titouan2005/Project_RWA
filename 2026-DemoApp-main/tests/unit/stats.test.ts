import { describe, expect, it } from "vitest";
import { stockByBrand } from "@/lib/stats";
import type { Product } from "@/lib/types";

const p = (brand: string, model: string, price: number, stock: number): Product => ({
  id: model, brand, model, price, description: "", stock,
});

describe("stockByBrand", () => {
  it("S1 adds up the stock per brand", () => {
    const result = stockByBrand([p("Dell", "A", 1, 8), p("Dell", "B", 1, 5), p("Acer", "C", 1, 18)]);
    expect(result).toEqual([{ brand: "Dell", stock: 13 }, { brand: "Acer", stock: 18 }]);
  });
  it("S1 returns an empty list with no product", () => {
    expect(stockByBrand([])).toEqual([]);
  });
  it("S1 keeps brands with a stock of 0", () => {
    expect(stockByBrand([p("Lenovo", "A", 1, 0)])).toEqual([{ brand: "Lenovo", stock: 0 }]);
  });
  it("S1 does not modify the original list", () => {
    const input = [p("Dell", "XPS", 1199, 1), p("Acer", "Aspire", 549, 1)];
    stockByBrand(input);
    expect(input.map((x) => x.model)).toEqual(["XPS", "Aspire"]);
  });
});
