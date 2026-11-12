import { describe, expect, it } from "vitest";
import { pricePerModel, stockByBrand } from "@/lib/stats";
import type { Product } from "@/lib/types";

const p = (brand: string, model: string, price: number, stock: number): Product => ({
  id: model, brand, model, price, description: "", stock,
});

describe("stockByBrand", () => {
  it("additionne le stock par marque", () => {
    const result = stockByBrand([p("Dell", "A", 1, 8), p("Dell", "B", 1, 5), p("Acer", "C", 1, 18)]);
    expect(result).toEqual([{ brand: "Dell", stock: 13 }, { brand: "Acer", stock: 18 }]);
  });
  it("renvoie une liste vide sans produit", () => {
    expect(stockByBrand([])).toEqual([]);
  });
  it("garde les marques à stock 0", () => {
    expect(stockByBrand([p("Lenovo", "A", 1, 0)])).toEqual([{ brand: "Lenovo", stock: 0 }]);
  });
});

describe("pricePerModel", () => {
  it("trie par prix croissant et formate le libellé", () => {
    const result = pricePerModel([p("Dell", "XPS", 1199, 1), p("Acer", "Aspire", 549, 1)]);
    expect(result).toEqual([
      { label: "Acer Aspire", price: 549 },
      { label: "Dell XPS", price: 1199 },
    ]);
  });
  it("ne modifie pas la liste d'origine", () => {
    const input = [p("Dell", "XPS", 1199, 1), p("Acer", "Aspire", 549, 1)];
    pricePerModel(input);
    expect(input[0].model).toBe("XPS");
  });
  it("renvoie une liste vide sans produit", () => {
    expect(pricePerModel([])).toEqual([]);
  });
});