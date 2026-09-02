import type { Page } from "@playwright/test";

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
