import { expect, type Page } from "@playwright/test";

/**
 * Asenkron veri yükleyen sayfalarda ekran görüntüsünden önce çağrılır;
 * olmadan taban görüntüler ara "Yükleniyor..." durumunu yakalayabiliyor.
 */
export async function waitForContentLoaded(page: Page, timeout = 20_000): Promise<void> {
  await page
    .locator(".spinner-border")
    .first()
    .waitFor({ state: "detached", timeout })
    .catch(() => {});
  await page
    .getByText("Yükleniyor...")
    .first()
    .waitFor({ state: "detached", timeout })
    .catch(() => {});
}

/**
 * Görsel taban görüntüleri paylaşımlı dev DB'nin gerçek verisine göre alındı.
 * Faz 7'nin izole CI job'u (E2E_SKIP_VISUAL=1) taze/boş bir veritabanına karşı
 * koşuyor - ekran görüntüleri kesinlikle uyuşmaz, bu yüzden orada atlanır.
 * Fonksiyonel doğrulama (bu fonksiyondan önceki assert'ler) her koşulda çalışır.
 */
export async function expectScreenshot(
  page: Page,
  name: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  options?: any
): Promise<void> {
  if (process.env.E2E_SKIP_VISUAL) return;
  await expect(page).toHaveScreenshot(name, options);
}
