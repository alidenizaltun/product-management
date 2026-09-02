import { test as setup } from "@playwright/test";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const authFile = path.join(__dirname, "../playwright/.auth/user.json");

setup("authenticate", async ({ page }) => {
  const email = process.env.E2E_TEST_EMAIL;
  const password = process.env.E2E_TEST_PASSWORD;

  if (!email || !password) {
    throw new Error(
      "E2E_TEST_EMAIL / E2E_TEST_PASSWORD tanımlı değil. Kimlik gerektiren e2e testleri için " +
        ".env.test dosyasına düşük yetkili bir test hesabının bilgilerini ekleyin (bkz. .env.test.example)."
    );
  }

  await page.goto("/login");
  await page.getByLabel(/e-posta/i).fill(email);
  await page.getByLabel(/şifre/i).fill(password);
  await page.getByRole("button", { name: /giriş yap/i }).click();

  // Login sonrası dashboard/ürün listesine yönlendirme bekleniyor.
  await page.waitForURL((url) => !url.pathname.includes("/login"), { timeout: 15_000 });

  await page.context().storageState({ path: authFile });
});
