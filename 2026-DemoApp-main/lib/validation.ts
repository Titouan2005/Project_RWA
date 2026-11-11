import type { ProductInput } from "./types";

export type ValidationResult =
  | { ok: true; data: ProductInput }
  | { ok: false; errors: string[] };

export function validateProduct(body: unknown): ValidationResult {
  const errors: string[] = [];

  if (typeof body !== "object" || body === null || Array.isArray(body)) {
    return { ok: false, errors: ["Le corps doit être un objet JSON"] };
  }
  const b = body as Record<string, unknown>;

  const brand = typeof b.brand === "string" ? b.brand.trim() : "";
  if (brand.length < 1 || brand.length > 50) {
    errors.push("brand : texte de 1 à 50 caractères");
  }

  const model = typeof b.model === "string" ? b.model.trim() : "";
  if (model.length < 1 || model.length > 100) {
    errors.push("model : texte de 1 à 100 caractères");
  }

  const price = b.price;
  if (typeof price !== "number" || !Number.isFinite(price) || price < 0 || price > 100000) {
    errors.push("price : nombre entre 0 et 100000");
  }

  const description = b.description === undefined ? "" : b.description;
  if (typeof description !== "string" || description.length > 1000) {
    errors.push("description : texte de 1000 caractères maximum");
  }

  const stock = b.stock === undefined ? 0 : b.stock;
  if (typeof stock !== "number" || !Number.isInteger(stock) || stock < 0 || stock > 100000) {
    errors.push("stock : entier entre 0 et 100000");
  }

  if (errors.length > 0) return { ok: false, errors };

  return {
    ok: true,
    data: {
      brand,
      model,
      price: price as number,
      description: (description as string).trim(),
      stock: stock as number,
    },
  };
}