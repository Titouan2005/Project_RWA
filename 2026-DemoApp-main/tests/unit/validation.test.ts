import { describe, expect, it } from "vitest";
import { validateProduct } from "@/lib/validation";

const base = { brand: "Dell", model: "XPS 13", price: 1199, description: "Good laptop", stock: 8 };
const check = (overrides: Record<string, unknown>) => validateProduct({ ...base, ...overrides });
const errorsOf = (r: ReturnType<typeof validateProduct>) => (r.ok ? [] : r.errors);

const weirdStrings = [
  "%", "*", "_", "?", "0", "12345", "' OR 1=1 --", "<script>alert(1)</script>",
  "Ünïcödé é à ç", "日本語", "😀💻", "a\nb", "\ttabs", "../../etc/passwd", "{{7*7}}", "\\",
];

describe("validateProduct: valid cases", () => {
  it("V1 accepts a complete product", () => {
    expect(check({})).toEqual({ ok: true, data: base });
  });

  it("V2 trims spaces around texts", () => {
    const r = check({ brand: "  Dell  ", model: " XPS ", description: "  ok  " });
    expect(r).toEqual({ ok: true, data: { ...base, brand: "Dell", model: "XPS", description: "ok" } });
  });

  it("V3 missing description gives empty text and missing stock gives 0", () => {
    const r = validateProduct({ brand: "A", model: "B", price: 1 });
    expect(r).toEqual({ ok: true, data: { brand: "A", model: "B", price: 1, description: "", stock: 0 } });
  });

  it("V4 accepts the exact limits", () => {
    const r = check({
      brand: "a".repeat(50), model: "b".repeat(100), description: "c".repeat(1000),
      price: 100000, stock: 100000,
    });
    expect(r.ok).toBe(true);
    expect(check({ price: 0, stock: 0 }).ok).toBe(true);
  });
});

describe("validateProduct: strange strings", () => {
  it.each(weirdStrings)("V5 accepts %j as brand and model", (s) => {
    const r = check({ brand: s, model: s });
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.data.brand).toBe(s.trim());
      expect(r.data.model).toBe(s.trim());
    }
  });
});

describe("validateProduct: invalid cases", () => {
  const cases = [
    { label: "empty brand", o: { brand: "" }, field: "brand" },
    { label: "brand with only spaces", o: { brand: "   " }, field: "brand" },
    { label: "brand of 51 characters", o: { brand: "a".repeat(51) }, field: "brand" },
    { label: "brand as a number", o: { brand: 123 }, field: "brand" },
    { label: "brand null", o: { brand: null }, field: "brand" },
    { label: "empty model", o: { model: "" }, field: "model" },
    { label: "model of 101 characters", o: { model: "b".repeat(101) }, field: "model" },
    { label: "model as a number", o: { model: 42 }, field: "model" },
    { label: "negative price", o: { price: -1 }, field: "price" },
    { label: "price NaN", o: { price: NaN }, field: "price" },
    { label: "price Infinity", o: { price: Infinity }, field: "price" },
    { label: "price as text", o: { price: "100" }, field: "price" },
    { label: "price too high", o: { price: 100001 }, field: "price" },
    { label: "price null", o: { price: null }, field: "price" },
    { label: "description of 1001 characters", o: { description: "c".repeat(1001) }, field: "description" },
    { label: "description as a number", o: { description: 5 }, field: "description" },
    { label: "decimal stock", o: { stock: 1.5 }, field: "stock" },
    { label: "negative stock", o: { stock: -1 }, field: "stock" },
    { label: "stock as text", o: { stock: "8" }, field: "stock" },
    { label: "stock too high", o: { stock: 100001 }, field: "stock" },
  ];

  it.each(cases)("V6 rejects: $label", ({ o, field }) => {
    const r = check(o);
    expect(r.ok).toBe(false);
    expect(errorsOf(r).some((e) => e.startsWith(field))).toBe(true);
  });

  it("V6 rejects a missing price", () => {
    const r = validateProduct({ brand: "A", model: "B" });
    expect(errorsOf(r).some((e) => e.startsWith("price"))).toBe(true);
  });

  it("V6 returns all errors at once", () => {
    expect(errorsOf(check({ brand: "", model: "", price: -1 }))).toEqual([
      "brand: text of 1 to 50 characters",
      "model: text of 1 to 100 characters",
      "price: number between 0 and 100000",
    ]);
  });

  it.each([null, undefined, [], "text", 42, true])("V7 rejects a body that is not an object: %j", (body) => {
    expect(validateProduct(body)).toEqual({ ok: false, errors: ["The body must be a JSON object"] });
  });
});
