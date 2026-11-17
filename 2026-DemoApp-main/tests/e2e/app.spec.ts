import { expect, test } from "@playwright/test";

const unique = () => `E2E${Date.now()}`;

test("E1 create, edit and delete a laptop", async ({ page }) => {
  const brand = unique();

  await page.goto("/products/new");
  await page.getByLabel(/Brand/).fill(brand);
  await page.getByLabel(/Model/).fill("Test Model");
  await page.getByLabel(/Price/).fill("999");
  await page.getByLabel(/Stock/).fill("3");
  await page.getByLabel(/Description/).fill("Created by Playwright");
  await page.getByRole("button", { name: "Add" }).click();

  await expect(page.getByRole("heading", { name: `${brand} Test Model` })).toBeVisible();
  await expect(page.getByText("Price: 999 €")).toBeVisible();

  await page.getByRole("link", { name: "Edit" }).click();
  await page.getByLabel(/Price/).fill("1234");
  await page.getByRole("button", { name: "Save" }).click();
  await expect(page.getByText("Price: 1234 €")).toBeVisible();

  page.once("dialog", (dialog) => dialog.accept());
  await page.getByRole("button", { name: "Delete" }).click();
  await expect(page).toHaveURL(/\/products$/);
  await expect(page.getByText(`${brand} Test Model`)).toHaveCount(0);
});

test("E2 the form shows the server validation error", async ({ page }) => {
  await page.goto("/products/new");
  await page.getByLabel(/Brand/).fill("a".repeat(51));
  await page.getByLabel(/Model/).fill("Model");
  await page.getByLabel(/Price/).fill("100");
  await page.getByRole("button", { name: "Add" }).click();
  await expect(page.getByText("brand: text of 1 to 50 characters")).toBeVisible();
});

test("E3 a page that does not exist shows Page not found", async ({ page }) => {
  await page.goto("/products/unknownid123");
  await expect(page.getByRole("heading", { name: "Page not found" })).toBeVisible();
});

test("E4 the admin page shows both charts", async ({ page }) => {
  await page.goto("/admin");
  await expect(page.getByRole("heading", { name: /Recharts/ })).toBeVisible();
  await expect(page.getByRole("heading", { name: /Chart\.js/ })).toBeVisible();
  await expect(page.locator(".recharts-surface").first()).toBeVisible();
  await expect(page.locator("canvas").first()).toBeVisible();
});

test.describe("E5 API", () => {
  test("lists the laptops", async ({ request }) => {
    const res = await request.get("/api/products");
    expect(res.status()).toBe(200);
    expect(Array.isArray(await res.json())).toBe(true);
  });

  test("rejects an invalid body with 400", async ({ request }) => {
    const res = await request.post("/api/products", { data: { brand: "", price: -1 } });
    expect(res.status()).toBe(400);
  });

  test("returns 404 for an unknown id", async ({ request }) => {
    expect((await request.get("/api/products/unknownid123")).status()).toBe(404);
  });

  for (const weird of ["%", "*", "' OR 1=1 --", "<script>alert(1)</script>", "😀💻", "日本語"]) {
    test(`stores then deletes the strange text ${weird}`, async ({ request }) => {
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

test("E6 the home page shows the text from Redis", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(page.getByText(/Content unavailable/)).toHaveCount(0);
});

test("E7 the navigation links the main pages", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: "Products" }).click();
  await expect(page).toHaveURL(/\/products$/);
  await page.getByRole("link", { name: "Add", exact: true }).click();
  await expect(page).toHaveURL(/\/products\/new$/);
  await page.getByRole("link", { name: "Admin" }).click();
  await expect(page).toHaveURL(/\/admin$/);
});
