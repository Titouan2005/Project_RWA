// @vitest-environment node
import { revalidateTag } from "next/cache";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { DELETE, GET, PUT } from "@/app/api/products/[id]/route";
import { deleteProduct, getProduct, updateProduct } from "@/lib/products";

vi.mock("@/lib/products", () => ({
  getProduct: vi.fn(), updateProduct: vi.fn(), deleteProduct: vi.fn(),
}));
vi.mock("next/cache", () => ({ revalidateTag: vi.fn() }));

const valid = { brand: "Dell", model: "XPS 13", price: 1199, description: "d", stock: 8 };
const saved = { id: "abc", ...valid };
const ctx = { params: Promise.resolve({ id: "abc" }) };
const put = (body: string) =>
  PUT(new Request("http://localhost/api/products/abc", { method: "PUT", body }), ctx);
const req = (method: string) => new Request("http://localhost/api/products/abc", { method });

beforeEach(() => vi.clearAllMocks());

describe("GET /api/products/[id]", () => {
  it("A2 renvoie 200 et le produit", async () => {
    vi.mocked(getProduct).mockResolvedValue(saved);
    const res = await GET(req("GET"), ctx);
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual(saved);
  });
  it("A2 renvoie 404 si introuvable", async () => {
    vi.mocked(getProduct).mockResolvedValue(null);
    expect((await GET(req("GET"), ctx)).status).toBe(404);
  });
  it("A2 renvoie 500 en cas d'erreur", async () => {
    vi.mocked(getProduct).mockRejectedValue(new Error("x"));
    expect((await GET(req("GET"), ctx)).status).toBe(500);
  });
});

describe("PUT /api/products/[id]", () => {
  it("A2 renvoie 200 et invalide le cache", async () => {
    vi.mocked(updateProduct).mockResolvedValue(saved);
    const res = await put(JSON.stringify(valid));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual(saved);
    expect(revalidateTag).toHaveBeenCalledWith("products", { expire: 0 });
  });
  it("A2 renvoie 400 si le JSON est invalide", async () => {
    expect((await put("{pas du json")).status).toBe(400);
  });
  it("A2 renvoie 400 si la validation échoue", async () => {
    const res = await put(JSON.stringify({ ...valid, price: -1 }));
    expect(res.status).toBe(400);
    expect(updateProduct).not.toHaveBeenCalled();
  });
  it("A2 renvoie 404 si introuvable", async () => {
    vi.mocked(updateProduct).mockResolvedValue(null);
    const res = await put(JSON.stringify(valid));
    expect(res.status).toBe(404);
    expect(revalidateTag).not.toHaveBeenCalled();
  });
  it("A2 renvoie 500 en cas d'erreur", async () => {
    vi.mocked(updateProduct).mockRejectedValue(new Error("x"));
    expect((await put(JSON.stringify(valid))).status).toBe(500);
  });
});

describe("DELETE /api/products/[id]", () => {
  it("A2 renvoie 204 et invalide le cache", async () => {
    vi.mocked(deleteProduct).mockResolvedValue(true);
    const res = await DELETE(req("DELETE"), ctx);
    expect(res.status).toBe(204);
    expect(revalidateTag).toHaveBeenCalledWith("products", { expire: 0 });
  });
  it("A2 renvoie 404 si introuvable", async () => {
    vi.mocked(deleteProduct).mockResolvedValue(false);
    const res = await DELETE(req("DELETE"), ctx);
    expect(res.status).toBe(404);
    expect(revalidateTag).not.toHaveBeenCalled();
  });
  it("A2 renvoie 500 en cas d'erreur", async () => {
    vi.mocked(deleteProduct).mockRejectedValue(new Error("x"));
    expect((await DELETE(req("DELETE"), ctx)).status).toBe(500);
  });
});