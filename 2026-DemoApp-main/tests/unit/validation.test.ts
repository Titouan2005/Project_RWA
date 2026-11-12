import { describe, expect, it } from "vitest";
import { validateProduct } from "@/lib/validation";

const base = { brand: "Dell", model: "XPS 13", price: 1199, description: "Bon laptop", stock: 8 };
const check = (overrides: Record<string, unknown>) => validateProduct({ ...base, ...overrides });
const errorsOf = (r: ReturnType<typeof validateProduct>) => (r.ok ? [] : r.errors);

const weirdStrings = [
  "%", "*", "_", "?", "0", "12345", "' OR 1=1 --", "<script>alert(1)</script>",
  "Ünïcödé é à ç", "日本語", "😀💻", "a\nb", "\ttabs", "../../etc/passwd", "{{7*7}}", "\\",
];

describe("validateProduct : cas valides", () => {
  it("V1 accepte un produit complet", () => {
    expect(check({})).toEqual({ ok: true, data: base });
  });

  it("V2 nettoie les espaces autour des textes", () => {
    const r = check({ brand: "  Dell  ", model: " XPS ", description: "  ok  " });
    expect(r).toEqual({ ok: true, data: { ...base, brand: "Dell", model: "XPS", description: "ok" } });
  });

  it("V3 description absente donne vide et stock absent donne 0", () => {
    const r = validateProduct({ brand: "A", model: "B", price: 1 });
    expect(r).toEqual({ ok: true, data: { brand: "A", model: "B", price: 1, description: "", stock: 0 } });
  });

  it("V4 accepte les limites exactes", () => {
    const r = check({
      brand: "a".repeat(50), model: "b".repeat(100), description: "c".repeat(1000),
      price: 100000, stock: 100000,
    });
    expect(r.ok).toBe(true);
    expect(check({ price: 0, stock: 0 }).ok).toBe(true);
  });
});

describe("validateProduct : chaînes étranges", () => {
  it.each(weirdStrings)("V5 accepte %j comme marque et modèle", (s) => {
    const r = check({ brand: s, model: s });
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.data.brand).toBe(s.trim());
      expect(r.data.model).toBe(s.trim());
    }
  });
});

describe("validateProduct : cas invalides", () => {
  const cases = [
    { label: "brand vide", o: { brand: "" }, field: "brand" },
    { label: "brand espaces seuls", o: { brand: "   " }, field: "brand" },
    { label: "brand 51 caractères", o: { brand: "a".repeat(51) }, field: "brand" },
    { label: "brand nombre", o: { brand: 123 }, field: "brand" },
    { label: "brand null", o: { brand: null }, field: "brand" },
    { label: "model vide", o: { model: "" }, field: "model" },
    { label: "model 101 caractères", o: { model: "b".repeat(101) }, field: "model" },
    { label: "model nombre", o: { model: 42 }, field: "model" },
    { label: "price négatif", o: { price: -1 }, field: "price" },
    { label: "price NaN", o: { price: NaN }, field: "price" },
    { label: "price Infinity", o: { price: Infinity }, field: "price" },
    { label: "price texte", o: { price: "100" }, field: "price" },
    { label: "price trop grand", o: { price: 100001 }, field: "price" },
    { label: "price null", o: { price: null }, field: "price" },
    { label: "description 1001 caractères", o: { description: "c".repeat(1001) }, field: "description" },
    { label: "description nombre", o: { description: 5 }, field: "description" },
    { label: "stock décimal", o: { stock: 1.5 }, field: "stock" },
    { label: "stock négatif", o: { stock: -1 }, field: "stock" },
    { label: "stock texte", o: { stock: "8" }, field: "stock" },
    { label: "stock trop grand", o: { stock: 100001 }, field: "stock" },
  ];

  it.each(cases)("V6 refuse : $label", ({ o, field }) => {
    const r = check(o);
    expect(r.ok).toBe(false);
    expect(errorsOf(r).some((e) => e.startsWith(field))).toBe(true);
  });

  it("V6 refuse un prix absent", () => {
    const r = validateProduct({ brand: "A", model: "B" });
    expect(errorsOf(r).some((e) => e.startsWith("price"))).toBe(true);
  });

  it("V6 cumule plusieurs erreurs", () => {
    expect(errorsOf(check({ brand: "", model: "", price: -1 }))).toHaveLength(3);
  });

  it.each([null, undefined, [], "texte", 42, true])("V7 refuse un corps non objet : %j", (body) => {
    expect(validateProduct(body)).toEqual({ ok: false, errors: ["Le corps doit être un objet JSON"] });
  });
});