import { test, expect, type Page } from "@playwright/test";

/**
 * Panelin tamamını gezen tarama testi: her sayfa hatasız açılıyor mu, konsola
 * hata düşüyor mu, API 5xx dönüyor mu?
 *
 * Salt okunur - hiçbir kayıt oluşturmaz/silmez.
 */

interface PageProblems {
  consoleErrors: string[];
  pageErrors: string[];
  serverErrors: string[];
}

/** Sayfa hatalarını toplamaya başlar; dönen nesne test boyunca dolar. */
function collectProblems(page: Page): PageProblems {
  const problems: PageProblems = { consoleErrors: [], pageErrors: [], serverErrors: [] };

  page.on("console", (msg) => {
    if (msg.type() !== "error") return;
    const text = msg.text();
    // React Router'ın gelecek sürüm uyarıları ve favicon 404'ü gürültü.
    if (/React Router Future Flag|favicon/i.test(text)) return;
    problems.consoleErrors.push(text);
  });

  page.on("pageerror", (error) => problems.pageErrors.push(error.message));

  page.on("response", (response) => {
    if (response.status() >= 500) {
      problems.serverErrors.push(`${response.status()} ${response.request().method()} ${response.url()}`);
    }
  });

  return problems;
}

function formatProblems(route: string, problems: PageProblems): string {
  return [
    `Rota: ${route}`,
    problems.pageErrors.length ? `  Yakalanmamış JS hatası: ${problems.pageErrors.join(" | ")}` : "",
    problems.consoleErrors.length ? `  Konsol hatası: ${problems.consoleErrors.join(" | ")}` : "",
    problems.serverErrors.length ? `  Sunucu hatası: ${problems.serverErrors.join(" | ")}` : "",
  ]
    .filter(Boolean)
    .join("\n");
}

// Ürün seçici gerektirmeyen, doğrudan açılabilen sayfalar.
const ROUTES = [
  "/products",
  "/products/new",
  "/pricing/product-pricing",
  "/pricing/campaign-rules",
  "/product-info/general",
  "/product-info/classification",
  "/product-info/regions",
  "/product-info/media",
  "/product-info/advanced",
  "/physical-products/variants",
  "/physical-products/inventory-supply",
  "/software-products/modules",
  "/inventory/stock",
  "/inventory/transactions",
  "/inventory/transactions/new",
  "/inventory/reservations",
  "/inventory/warehouse-stock",
  "/definitions/categories",
  "/definitions/categories/new",
  "/definitions/attributes",
  "/definitions/attributes/new",
  "/definitions/attribute-sets",
  "/definitions/attribute-sets/new",
  "/definitions/software-units",
  "/definitions/software-units/new",
  "/definitions/regions",
  "/definitions/regions/new",
  "/definitions/suppliers",
  "/definitions/suppliers/new",
  "/definitions/warehouses",
  "/definitions/warehouses/new",
  "/pricing/price-lists",
  "/pricing/price-lists/new",
  "/pricing/templates",
  "/pricing/templates/new",
  "/pricing/revisions",
  "/pricing/revisions/new",
  "/identity/users",
  "/identity/users/new",
  "/identity/login-audit",
  "/identity/roles",
  "/identity/roles/new",
  "/identity/permissions",
  "/system/settings",
  "/system/integrations",
  "/system/logs",
  "/system/audit",
  "/analytics",
];

test.describe("UI taraması - tüm sayfalar hatasız açılıyor", () => {
  for (const route of ROUTES) {
    test(`sayfa hatasız açılıyor: ${route}`, async ({ page }) => {
      const problems = collectProblems(page);

      await page.goto(route);
      // Ana içerik alanı render olmalı; boş/beyaz sayfa kabul edilmez.
      await expect(page.locator(".nk-content").first()).toBeVisible({ timeout: 20_000 });
      await page.waitForLoadState("networkidle", { timeout: 20_000 }).catch(() => {});

      // Hata sınırının "bir şeyler ters gitti" ekranına düşmediğini doğrula.
      await expect(page.getByText(/beklenmeyen bir hata|something went wrong/i)).toHaveCount(0);

      const hasProblem =
        problems.pageErrors.length > 0 || problems.consoleErrors.length > 0 || problems.serverErrors.length > 0;
      expect(hasProblem, formatProblems(route, problems)).toBe(false);
    });
  }
});
