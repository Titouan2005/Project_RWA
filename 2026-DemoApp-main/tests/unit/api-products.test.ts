// @vitest-environment node
import { revalidateTag } from "next/cache";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { GET, POST } from "@/app/api/products/route";
import { createProduct, listProducts } from "@/lib/products";

vi.mock("@/lib/products", () => ({ listProducts: vi.fn(), createProduct: vi.fn() }));
vi.mock("next/cache", () => ({ revalidateTag: vi.fn() }));

const valid = { brand: "Dell", model: "XPS 13", price: 1199, description: "d", stock: 8 };
const saved = { id: "abc", ...valid };
const post = (body: string) =>
  POST(new Request("http://localhost/api/products", { method: "POST", body }));

beforeEach(() => vi.clearAllMocks());

describe("GET /api/products", () => {
  it("A1 renvoie 200 et la liste", async () => {
    vi.mocked(listProducts).mockResolvedValue([saved]);
    const res = await GET();
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual([saved]);
  });
  it("A1 renvoie 500 si PocketBase échoue", async () => {
    vi.mocked(listProducts).mockRejectedValue(new Error("x"));
    expect((await GET()).status).toBe(500);
  });
});

describe("POST /api/products", () => {
  it("A1 renvoie 201, le produit créé, et invalide le cache", async () => {
    vi.mocked(createProduct).mockResolvedValue(saved);
    const res = await post(JSON.stringify(valid));
    expect(res.status).toBe(201);
    expect(await res.json()).toEqual(saved);
    expect(revalidateTag).toHaveBeenCalledWith("products", { expire: 0 });
  });
  it("A1 renvoie 400 si le JSON est invalide", async () => {
    const res = await post("{pas du json");
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ errors: ["JSON invalide"] });
    expect(createProduct).not.toHaveBeenCalled();
  });
  it("A1 renvoie 400 avec la liste des erreurs si la validation échoue", async () => {
    const res = await post(JSON.stringify({ brand: "", price: -5 }));
    expect(res.status).toBe(400);
    expect((await res.json()).errors.length).toBeGreaterThan(0);
    expect(createProduct).not.toHaveBeenCalled();
    expect(revalidateTag).not.toHaveBeenCalled();
  });
  it("A1 renvoie 500 si la création échoue, sans invalider le cache", async () => {
    vi.mocked(createProduct).mockRejectedValue(new Error("x"));
    const res = await post(JSON.stringify(valid));
    expect(res.status).toBe(500);
    expect(revalidateTag).not.toHaveBeenCalled();
  });
});