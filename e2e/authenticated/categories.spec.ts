import { test, expect } from "@playwright/test";
import { waitForContentLoaded } from "../utils";

// Kategoriler basit bir List/Detail/Form CRUD üçlüsü - Faz 6'nın "aynı
// kalıptaki sayfalar" hedefi için temsili bir örnek.
test.describe("Categories (authenticated) - list/detail/form", () => {
  test("list page renders and matches visual baseline", async ({ page }) => {
    await page.goto("/definitions/categories");
    await expect(page.getByRole("heading", { name: "Kategori Tanımları" })).toBeVisible();
    await waitForContentLoaded(page);
    await expect(page).toHaveScreenshot("categories-list.png", { fullPage: true });
  });

  test("detail page renders and matches visual baseline", async ({ page }) => {
    await page.goto("/definitions/categories");
    const detailLink = page.getByTitle("Detay").first();
    await expect(detailLink).toBeVisible();
    await detailLink.click();
    await expect(page).toHaveURL(/\/definitions\/categories\/[^/]+$/);
    await waitForContentLoaded(page);
    await expect(page).toHaveScreenshot("categories-detail.png", { fullPage: true });
  });

  test("create form renders and matches visual baseline", async ({ page }) => {
    await page.goto("/definitions/categories/new");
    await expect(page.getByRole("heading", { name: "Yeni Kategori" })).toBeVisible();
    await waitForContentLoaded(page);
    await expect(page).toHaveScreenshot("categories-form.png", { fullPage: true });
  });
});
