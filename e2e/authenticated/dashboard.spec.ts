import { test, expect } from "@playwright/test";

// /analytics rota seviyesinde izin gerektirmiyor (bkz. router.tsx) - düşük
// yetkili test hesabıyla da erişilebilir olması garanti.
test.describe("Dashboard (authenticated)", () => {
  test("kimliklendirilmiş kullanıcı dashboard'a erişebilir", async ({ page }) => {
    await page.goto("/analytics");
    await expect(page).not.toHaveURL(/\/login/);
    await expect(page.locator(".nk-sidebar, .nk-header")).toHaveCount(2);
  });

  test("matches visual baseline", async ({ page }) => {
    await page.goto("/analytics");
    await expect(page.locator(".nk-sidebar")).toBeVisible();
    // Dashboard verisi asenkron yükleniyor; spinner'lar kaybolana kadar
    // bekle, yoksa taban görüntü ara "yükleniyor" durumunu yakalayabilir.
    await page.locator(".spinner-border").first().waitFor({ state: "detached", timeout: 20_000 }).catch(() => {});
    await expect(page).toHaveScreenshot("dashboard-page.png", {
      fullPage: true,
      mask: [page.locator("[class*='chart']"), page.locator("canvas")],
    });
  });
});
