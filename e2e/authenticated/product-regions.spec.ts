import { test, expect } from "@playwright/test";
import { SKIP_WITHOUT_WRITABLE_API } from "../utils";

/**
 * Ürüne bölge atarken 400 alınıyordu:
 *   {"Regions.0.ProductId":["Ürün alanı zorunludur."]}
 *
 * CreateProductRegionRequestDtoValidator, ProductId'yi zorunlu tutuyordu; oysa
 * bu alan istemciden hiç okunmuyor - tekil uçta controller rotadan gelen değerle
 * eziyor, tam ürün kaydında ise bölgeler rotadaki productId ile yazılıyor.
 *
 * Test KAYIT OLUŞTURUR; eklediği bölge atamasını sonunda API üzerinden siler.
 */
const PRODUCT_ID = "178AC852-2308-47DE-A2D9-ED806BF9EC2D";

test.describe("Ürüne bölge ataması", () => {
  test.skip(SKIP_WITHOUT_WRITABLE_API, "Gerçekten kayıt yazar ve paylaşımlı dev DB fikstürüne dayanır.");

  test("bölge eklenip kaydedilebiliyor", async ({ page }) => {
    await page.goto(`/product-info/regions?productId=${PRODUCT_ID}`);
    await expect(page.getByRole("button", { name: "Bölge Ekle" })).toBeVisible({ timeout: 20_000 });
    await page.waitForLoadState("networkidle", { timeout: 20_000 }).catch(() => {});

    await page.getByRole("button", { name: "Bölge Ekle" }).click();

    // Bölge seçimi react-select; listedeki ilk kaydı seç.
    const regionSelect = page.locator('input[role="combobox"]').last();
    await regionSelect.click();
    await page.waitForTimeout(500);
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("Enter");

    const saved = page.waitForResponse(
      (response) => response.request().method() === "PUT" && response.url().includes("/api/products/"),
      { timeout: 20_000 }
    );
    await page.getByRole("button", { name: /kaydet/i }).first().click();

    // Düzeltmeden önce burası 400 dönüyordu: "Regions.0.ProductId zorunludur".
    const response = await saved;
    expect(response.status(), await response.text().catch(() => "")).toBe(204);
    await expect(page.getByText("Bölgeler güncellendi").first()).toBeVisible({ timeout: 15_000 });
  });

  test.afterEach(async ({ page }) => {
    // Testin eklediği bölge atamasını kaldır; ürün bölgesiz haline dönsün.
    const token = await page.evaluate(
      () => localStorage.getItem("pm_access_token") ?? sessionStorage.getItem("pm_access_token")
    );
    const apiBase = (process.env.E2E_API_BASE_URL ?? "").replace(/\/$/, "");
    const headers = { Authorization: `Bearer ${token}` };

    const listed = await page.request.get(`${apiBase}/api/products/${PRODUCT_ID}/regions`, { headers });
    if (!listed.ok()) return;

    const rows: { id: string }[] = await listed.json();
    for (const row of rows) {
      const removed = await page.request.delete(`${apiBase}/api/products/regions/${row.id}`, { headers });
      expect(removed.ok(), `temizlik başarısız: ${row.id} -> ${removed.status()}`).toBe(true);
    }
  });
});
