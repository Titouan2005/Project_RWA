import { ClientResponseError, type RecordModel } from "pocketbase";
import { getPb } from "./pocketbase";
import type { Product, ProductInput } from "./types";

function toProduct(r: RecordModel): Product {
  return {
    id: r.id,
    brand: r.brand,
    model: r.model,
    price: r.price,
    description: r.description ?? "",
    stock: r.stock ?? 0,
  };
}

function isNotFound(e: unknown) {
  return e instanceof ClientResponseError && e.status === 404;
}

export async function listProducts(): Promise<Product[]> {
  const records = await getPb().collection("laptops").getFullList({ sort: "brand,model" });
  return records.map(toProduct);
}

export async function getProduct(id: string): Promise<Product | null> {
  try {
    return toProduct(await getPb().collection("laptops").getOne(id));
  } catch (e) {
    if (isNotFound(e)) return null;
    throw e;
  }
}

export async function createProduct(data: ProductInput): Promise<Product> {
  return toProduct(await getPb().collection("laptops").create(data));
}

export async function updateProduct(id: string, data: ProductInput): Promise<Product | null> {
  try {
    return toProduct(await getPb().collection("laptops").update(id, data));
  } catch (e) {
    if (isNotFound(e)) return null;
    throw e;
  }
}

export async function deleteProduct(id: string): Promise<boolean> {
  try {
    await getPb().collection("laptops").delete(id);
    return true;
  } catch (e) {
    if (isNotFound(e)) return false;
    throw e;
  }
}