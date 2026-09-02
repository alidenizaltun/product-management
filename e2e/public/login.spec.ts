import { test, expect } from "@playwright/test";

test.describe("Login page (public, no auth)", () => {
  test("renders the login form", async ({ page }) => {
    await page.goto("/login");
    await expect(page.getByRole("heading", { name: "Giriş Yap" })).toBeVisible();
    await expect(page.getByLabel(/e-posta/i)).toBeVisible();
    await expect(page.getByRole("button", { name: /giriş yap/i })).toBeVisible();
  });

  test("matches visual baseline", async ({ page }) => {
    await page.goto("/login");
    await expect(page.getByRole("heading", { name: "Giriş Yap" })).toBeVisible();
    await expect(page).toHaveScreenshot("login-page.png", { fullPage: true });
  });
});
