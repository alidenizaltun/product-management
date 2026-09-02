import { test, expect } from "@playwright/test";

// /analytics rota seviyesinde izin gerektirmiyor (bkz. router.tsx) - düşük
// yetkili test hesabıyla da erişilebilir olması garanti.
test.describe("Dashboard (authenticated)", () => {
  test("kimliklendirilmiş kullanıcı dashboard'a erişebilir", async ({ page }) => {
    await page.goto("/analytics");
    await expect(page).not.toHaveURL(/\/login/);
    await expect(page.locator(".nk-sidebar, .nk-header")).toHaveCount(2);
  });
});
