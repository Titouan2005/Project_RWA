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
  it("A1 returns 200 and the list", async () => {
    vi.mocked(listProducts).mockResolvedValue([saved]);
    const res = await GET();
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual([saved]);
  });
  it("A1 returns 500 if PocketBase fails", async () => {
    vi.mocked(listProducts).mockRejectedValue(new Error("x"));
    const res = await GET();
    expect(res.status).toBe(500);
    expect(await res.json()).toEqual({ error: "Server error" });
  });
});

describe("POST /api/products", () => {
  it("A1 returns 201, the created product, and invalidates the cache", async () => {
    vi.mocked(createProduct).mockResolvedValue(saved);
    const res = await post(JSON.stringify(valid));
    expect(res.status).toBe(201);
    expect(await res.json()).toEqual(saved);
    expect(revalidateTag).toHaveBeenCalledWith("products", { expire: 0 });
  });
  it("A1 returns 400 if the JSON is invalid", async () => {
    const res = await post("{not json");
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ errors: ["Invalid JSON"] });
    expect(createProduct).not.toHaveBeenCalled();
  });
  it("A1 returns 400 with the list of errors if validation fails", async () => {
    const res = await post(JSON.stringify({ brand: "", price: -5 }));
    expect(res.status).toBe(400);
    expect((await res.json()).errors.length).toBeGreaterThan(0);
    expect(createProduct).not.toHaveBeenCalled();
    expect(revalidateTag).not.toHaveBeenCalled();
  });
  it("A1 returns 500 if creation fails, without invalidating the cache", async () => {
    vi.mocked(createProduct).mockRejectedValue(new Error("x"));
    const res = await post(JSON.stringify(valid));
    expect(res.status).toBe(500);
    expect(revalidateTag).not.toHaveBeenCalled();
  });
});
