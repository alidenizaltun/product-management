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
    .locator(".placeholder-glow")
    .first()
    .waitFor({ state: "detached", timeout })
    .catch(() => {});
  await page
    .getByRole("status", { name: "Yükleniyor..." })
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

/**
 * Paylaşımlı dev veritabanındaki gerçek kayıtlara (İKNET, İNŞAAT 360 gibi)
 * dayanan testler için atlama koşulu.
 *
 * Faz 7'nin izole CI job'u taze/boş bir veritabanına karşı koşuyor ve bu
 * fikstürler orada yok; o job kendini E2E_SKIP_VISUAL ile işaretliyor.
 */
export const SKIP_WITHOUT_SHARED_DATA = Boolean(process.env.E2E_SKIP_VISUAL);

/**
 * Gerçekten kayıt oluşturan/değiştiren testler için atlama koşulu: yalnızca
 * E2E_API_BASE_URL ile açıkça bir API hedeflendiğinde çalışırlar, böylece
 * gelişigüzel bir koşu paylaşımlı veritabanına yazmaz.
 */
export const SKIP_WITHOUT_WRITABLE_API = !process.env.E2E_API_BASE_URL || SKIP_WITHOUT_SHARED_DATA;
