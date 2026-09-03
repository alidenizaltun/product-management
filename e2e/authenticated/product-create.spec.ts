import { test, expect } from "@playwright/test";

// Faz 7 kritik akış: ürün oluşturma. Gerçekten submit edip DB'ye yazıyor - bu
// yüzden SADECE izole e2e CI ortamında çalışır (E2E_API_BASE_URL set edilmişse,
// bkz. playwright.config.ts). Paylaşımlı dev DB'ye karşı yerel/manuel koşularda
// atlanır ki gerçek veritabanına çöp ürün yazılmasın.
test.describe("Product creation (authenticated, isolated DB only)", () => {
  test.skip(
    !process.env.E2E_API_BASE_URL,
    "Gerçekten ürün oluşturuyor; sadece izole e2e DB'sine karşı çalışır."
  );

  test("yeni ürün oluşturulup detay sayfasına yönlendiriyor", async ({ page }) => {
    await page.goto("/products/new");
    await expect(page.getByRole("heading", { name: "Yeni Ürün" })).toBeVisible();

    const productName = `E2E Test Ürünü ${Date.now()}`;
    await page.getByLabel("Ürün Adı").fill(productName);
    await page.getByRole("button", { name: /oluştur ve devam et/i }).click();

    await expect(page).toHaveURL(/\/products\/[^/]+$/, { timeout: 15_000 });
    await expect(page.getByRole("heading", { name: productName }).first()).toBeVisible();
  });
});
