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
  const base = process.env.PB_URL ?? "http://127.0.0.1:8090";
  const res = await fetch(
    `${base}/api/collections/laptops/records?perPage=500&sort=brand,model`,
    { next: { tags: ["products"], revalidate: 300 } }
  );
  if (!res.ok) throw new Error("PocketBase error");
  const data = await res.json();
  return (data.items as RecordModel[]).map(toProduct);
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