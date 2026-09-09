import { test, expect } from "@playwright/test";
import { SKIP_WITHOUT_SHARED_DATA, SKIP_WITHOUT_WRITABLE_API, waitForContentLoaded } from "../utils";
import {
  createSoftwareProduct,
  defaultSoftwareProductProfile,
  deleteSoftwareProductIfSupported,
  expectSoftwareProductProfile,
  fillSoftwareProductProfile,
  openAdvancedSettings,
  saveProductSection,
} from "./helpers/softwareProduct";

/**
 * Gelişmiş Ayarlar, ürün tipine göre profil formunu gösterir.
 * Fiyatlandırma ızgarası (`pricing-form-grid`) burada kullanılmamalı; JSON
 * editörleri ve form alanları diğer ürün bilgi sayfalarındaki gibi Bootstrap
 * satırına oturur.
 */
test.describe("Gelişmiş Ayarlar düzeni", () => {
  test.skip(SKIP_WITHOUT_SHARED_DATA, "Ürün seçici paylaşımlı dev verisine dayanır.");

  test("ürün seçilince profil alanları tam genişlikte açılır", async ({ page }) => {
    await page.goto("/product-info/advanced");
    await expect(page.getByRole("heading", { name: "Gelişmiş Ayarlar" })).toBeVisible({ timeout: 20_000 });
    await waitForContentLoaded(page);

    await page.getByPlaceholder("Ürün adı veya kodu ile ara").click();
    const firstProduct = page.locator(".link-list-plain button").first();
    await expect(firstProduct).toBeVisible({ timeout: 20_000 });
    await firstProduct.click();

    await expect(
      page
        .getByText("Yazılım Kimliği")
        .or(page.getByText("Boyutlar ve Ağırlık"))
        .or(page.getByText("Hizmet Bilgileri"))
        .or(page.getByText("Faturalama"))
    ).toBeVisible({ timeout: 20_000 });

    await expect(page.locator(".pricing-form-grid")).toHaveCount(0);
    await expect(page.getByRole("alert").getByRole("link", { name: "Genel Bilgiler" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Profil ve Teknik Detaylar" })).toBeVisible();

    const profileCard = page.locator("section.card.card-bordered").filter({
      has: page.getByRole("heading", { name: "Profil ve Teknik Detaylar" }),
    });
    await expect(profileCard).toBeVisible();

    // Capture the profile card only. fullPage shots after a late viewport
    // change still include the desktop sidebar because the shell does not
    // re-layout until reload.
    await profileCard.screenshot({
      path: "test-results/advanced-settings-desktop.png",
    });
    await page.setViewportSize({ width: 768, height: 1024 });
    await profileCard.screenshot({
      path: "test-results/advanced-settings-tablet.png",
    });
    await page.setViewportSize({ width: 390, height: 844 });
    await profileCard.screenshot({
      path: "test-results/advanced-settings-mobile.png",
    });
  });
});

test.describe("Yazılım profili kaydı", () => {
  test.skip(SKIP_WITHOUT_WRITABLE_API, "Gerçekten kayıt yazar; yazılabilir API olmadan atlanır.");
  test.describe.configure({ timeout: 90_000 });

  test("yazılım profili kaydı yenileme sonrası aynı değerleri korur", async ({ page }) => {
    const created = await createSoftwareProduct(page);

    try {
      const values = defaultSoftwareProductProfile(created.name);

      await openAdvancedSettings(page, created.id);
      await expect(page.locator(".pricing-form-grid")).toHaveCount(0);
      await expect(page.getByRole("heading", { name: "Profil ve Teknik Detaylar" })).toBeVisible();

      await fillSoftwareProductProfile(page, values);
      await saveProductSection(page, "Gelişmiş Ayarlar güncellendi");
      await expect(page.getByText("Güncel").first()).toBeVisible({ timeout: 10_000 });

      await page.reload();
      await expect(page.getByRole("heading", { name: "Gelişmiş Ayarlar" }).first()).toBeVisible({
        timeout: 20_000,
      });
      await waitForContentLoaded(page);
      await expect(page.getByText("Yazılım Kimliği")).toBeVisible({ timeout: 20_000 });
      await expect(page.locator(".pricing-form-grid")).toHaveCount(0);
      await expectSoftwareProductProfile(page, values);
    } finally {
      await deleteSoftwareProductIfSupported(page, created.id);
    }
  });
});

