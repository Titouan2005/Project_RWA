import { ClientResponseError } from "pocketbase";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createProduct, deleteProduct, getProduct, listProducts, updateProduct } from "@/lib/products";

const collection = vi.hoisted(() => ({
  getOne: vi.fn(), create: vi.fn(), update: vi.fn(), delete: vi.fn(),
}));
vi.mock("@/lib/pocketbase", () => ({ getPb: () => ({ collection: () => collection }) }));

const record = { id: "abc", brand: "Dell", model: "XPS 13", price: 1199, description: "d", stock: 8 };
const notFound = () => new ClientResponseError({ status: 404 });
const serverError = () => new ClientResponseError({ status: 500 });
const input = { brand: "Dell", model: "XPS 13", price: 1199, description: "d", stock: 8 };

const originalPb = process.env.PB_URL;
beforeEach(() => vi.clearAllMocks());
afterEach(() => {
  vi.unstubAllGlobals();
  if (originalPb === undefined) delete process.env.PB_URL;
  else process.env.PB_URL = originalPb;
});

describe("listProducts", () => {
  it("P1 calls PocketBase with the cache tag and maps the data", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ items: [{ id: "1", brand: "Acer", model: "Aspire 5", price: 549 }] }),
    });
    vi.stubGlobal("fetch", fetchMock);
    process.env.PB_URL = "http://pb.test";

    const result = await listProducts();

    expect(result).toEqual([
      { id: "1", brand: "Acer", model: "Aspire 5", price: 549, description: "", stock: 0 },
    ]);
    const [url, options] = fetchMock.mock.calls[0];
    expect(url).toContain("http://pb.test/api/collections/laptops/records");
    expect(options.next.tags).toEqual(["products"]);
  });

  it("P1 uses the default URL", async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ items: [] }) });
    vi.stubGlobal("fetch", fetchMock);
    delete process.env.PB_URL;
    await listProducts();
    expect(fetchMock.mock.calls[0][0]).toContain("http://127.0.0.1:8090/api/collections/laptops/records");
  });

  it("P3 throws an error if PocketBase responds badly", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false }));
    await expect(listProducts()).rejects.toThrow("PocketBase error");
  });
});

describe("getProduct", () => {
  it("P1 returns the mapped product", async () => {
    collection.getOne.mockResolvedValue(record);
    expect(await getProduct("abc")).toEqual(record);
  });
  it("P1 uses default values if description and stock are missing", async () => {
    collection.getOne.mockResolvedValue({ id: "x", brand: "A", model: "B", price: 1 });
    expect(await getProduct("x")).toEqual({ id: "x", brand: "A", model: "B", price: 1, description: "", stock: 0 });
  });
  it("P2 returns null if not found", async () => {
    collection.getOne.mockRejectedValue(notFound());
    expect(await getProduct("zzz")).toBeNull();
  });
  it("P3 propagates other errors", async () => {
    collection.getOne.mockRejectedValue(serverError());
    await expect(getProduct("abc")).rejects.toBeInstanceOf(ClientResponseError);
  });
});

describe("createProduct", () => {
  it("P1 creates and returns the product", async () => {
    collection.create.mockResolvedValue(record);
    expect(await createProduct(input)).toEqual(record);
    expect(collection.create).toHaveBeenCalledWith(input);
  });
});

describe("updateProduct", () => {
  it("P1 updates and returns the product", async () => {
    collection.update.mockResolvedValue(record);
    expect(await updateProduct("abc", input)).toEqual(record);
    expect(collection.update).toHaveBeenCalledWith("abc", input);
  });
  it("P2 returns null if not found", async () => {
    collection.update.mockRejectedValue(notFound());
    expect(await updateProduct("zzz", input)).toBeNull();
  });
  it("P3 propagates other errors", async () => {
    collection.update.mockRejectedValue(serverError());
    await expect(updateProduct("abc", input)).rejects.toBeInstanceOf(ClientResponseError);
  });
});

describe("deleteProduct", () => {
  it("P1 returns true after deleting", async () => {
    collection.delete.mockResolvedValue(true);
    expect(await deleteProduct("abc")).toBe(true);
  });
  it("P2 returns false if not found", async () => {
    collection.delete.mockRejectedValue(notFound());
    expect(await deleteProduct("zzz")).toBe(false);
  });
  it("P3 propagates other errors", async () => {
    collection.delete.mockRejectedValue(serverError());
    await expect(deleteProduct("abc")).rejects.toBeInstanceOf(ClientResponseError);
  });
  it("P3 propagates an error that does not come from PocketBase", async () => {
    collection.delete.mockRejectedValue(new Error("network"));
    await expect(deleteProduct("abc")).rejects.toThrow("network");
  });
});
