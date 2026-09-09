import { test, expect } from "@playwright/test";
import { SKIP_WITHOUT_WRITABLE_API } from "../utils";
import {
  createSoftwareProduct,
  defaultSoftwareProductGeneralInfo,
  deleteSoftwareProductIfSupported,
  expectGeneralInfoValues,
  fillSoftwareProductGeneralInfo,
  openGeneralInfo,
  saveGeneralInfo,
} from "./helpers/softwareProduct";

/**
 * Faz 7 kritik akış: yazılım ürünü oluşturma ve Genel Bilgiler kaydı.
 * Gerçekten submit edip DB'ye yazıyor — yalnızca E2E_API_BASE_URL set
 * edildiğinde çalışır (bkz. SKIP_WITHOUT_WRITABLE_API).
 */
test.describe("Yazılım ürünü oluşturma ve genel bilgiler", () => {
  test.skip(SKIP_WITHOUT_WRITABLE_API, "Gerçekten ürün oluşturuyor; yazılabilir API olmadan atlanır.");

  test("yazılım türüyle ürün oluşturup detay sayfasına yönlendiriyor", async ({ page }) => {
    const created = await createSoftwareProduct(page);

    try {
      await expect(page).toHaveURL(new RegExp(`/products/${created.id}$`));
      await expect(page.getByRole("heading", { name: created.name }).first()).toBeVisible();
      await expect(page.locator(".nk-content .badge", { hasText: /^Yazılım$/ }).first()).toBeVisible();
    } finally {
      await deleteSoftwareProductIfSupported(page, created.id);
    }
  });

  test("genel bilgiler kaydı yenileme sonrası aynı değerleri korur", async ({ page }) => {
    const created = await createSoftwareProduct(page);

    try {
      const values = defaultSoftwareProductGeneralInfo(created.name);

      await openGeneralInfo(page, created.id);
      await fillSoftwareProductGeneralInfo(page, values);
      await saveGeneralInfo(page);

      await expect(page.getByText("Güncel").first()).toBeVisible({ timeout: 10_000 });
      await page.reload();
      await expect(page.getByLabel("Ürün Adı")).toBeVisible({ timeout: 20_000 });
      await expect(page.getByLabel("Ürün Adı")).toHaveValue(created.name);
      await expectGeneralInfoValues(page, values);
    } finally {
      await deleteSoftwareProductIfSupported(page, created.id);
    }
  });
});
