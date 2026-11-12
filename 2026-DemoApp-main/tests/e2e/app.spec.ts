import { expect, test } from "@playwright/test";

const unique = () => `E2E${Date.now()}`;

test("E1 créer, modifier et supprimer un laptop", async ({ page }) => {
  const brand = unique();

  await page.goto("/products/new");
  await page.getByLabel(/Marque/).fill(brand);
  await page.getByLabel(/Modèle/).fill("Modele Test");
  await page.getByLabel(/Prix/).fill("999");
  await page.getByLabel(/Stock/).fill("3");
  await page.getByLabel(/Description/).fill("Créé par Playwright");
  await page.getByRole("button", { name: "Ajouter" }).click();

  await expect(page.getByRole("heading", { name: `${brand} Modele Test` })).toBeVisible();
  await expect(page.getByText("Prix : 999 €")).toBeVisible();

  await page.getByRole("link", { name: "Modifier" }).click();
  await page.getByLabel(/Prix/).fill("1234");
  await page.getByRole("button", { name: "Enregistrer" }).click();
  await expect(page.getByText("Prix : 1234 €")).toBeVisible();

  page.once("dialog", (dialog) => dialog.accept());
  await page.getByRole("button", { name: "Supprimer" }).click();
  await expect(page).toHaveURL(/\/products$/);
  await expect(page.getByText(`${brand} Modele Test`)).toHaveCount(0);
});

test("E2 le formulaire affiche l'erreur de validation du serveur", async ({ page }) => {
  await page.goto("/products/new");
  await page.getByLabel(/Marque/).fill("a".repeat(51));
  await page.getByLabel(/Modèle/).fill("Modele");
  await page.getByLabel(/Prix/).fill("100");
  await page.getByRole("button", { name: "Ajouter" }).click();
  await expect(page.getByText("brand : texte de 1 à 50 caractères")).toBeVisible();
});

test("E3 une page inexistante affiche Page introuvable", async ({ page }) => {
  await page.goto("/products/idinexistant123");
  await expect(page.getByRole("heading", { name: "Page introuvable" })).toBeVisible();
});

test("E3 la page d'accueil affiche le texte venant de Redis", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(page.getByText(/Contenu indisponible/)).toHaveCount(0);
});

test("E3 la navigation relie les pages principales", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: "Products" }).click();
  await expect(page).toHaveURL(/\/products$/);
  await page.getByRole("link", { name: "Add", exact: true }).click();
  await expect(page).toHaveURL(/\/products\/new$/);
  await page.getByRole("link", { name: "Admin" }).click();
  await expect(page).toHaveURL(/\/admin$/);
  await expect(page).toHaveURL(/\/admin$/);
});

test("E4 la page admin affiche les deux graphiques", async ({ page }) => {
  await page.goto("/admin");
  await expect(page.getByRole("heading", { name: /Recharts/ })).toBeVisible();
  await expect(page.getByRole("heading", { name: /Chart\.js/ })).toBeVisible();
  await expect(page.locator(".recharts-surface").first()).toBeVisible();
  await expect(page.locator("canvas").first()).toBeVisible();
});

test.describe("E5 API", () => {
  test("liste les laptops", async ({ request }) => {
    const res = await request.get("/api/products");
    expect(res.status()).toBe(200);
    expect(Array.isArray(await res.json())).toBe(true);
  });

  test("refuse un corps invalide avec 400", async ({ request }) => {
    const res = await request.post("/api/products", { data: { brand: "", price: -1 } });
    expect(res.status()).toBe(400);
  });

  test("renvoie 404 pour un id inconnu", async ({ request }) => {
    expect((await request.get("/api/products/idinexistant123")).status()).toBe(404);
  });

  for (const weird of ["%", "*", "' OR 1=1 --", "<script>alert(1)</script>", "😀💻", "日本語"]) {
    test(`stocke puis supprime le texte étrange ${weird}`, async ({ request }) => {
      const created = await request.post("/api/products", {
        data: { brand: weird, model: weird, price: 10, stock: 1 },
      });
      expect(created.status()).toBe(201);
      const product = await created.json();
      expect(product.brand).toBe(weird);
      expect((await request.delete(`/api/products/${product.id}`)).status()).toBe(204);
    });
  }
});