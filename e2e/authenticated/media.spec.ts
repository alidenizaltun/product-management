import { test, expect } from "@playwright/test";
import { SKIP_WITHOUT_WRITABLE_API, waitForContentLoaded } from "../utils";
import {
  createSoftwareProduct,
  deleteSoftwareProductIfSupported,
  openMedia,
  saveProductSection,
} from "./helpers/softwareProduct";

const MAX_FILE_SIZE = 8 * 1024 * 1024;

function isMediaUpload(url: string): boolean {
  return /\/api\/products\/[^/?]+\/media\/?$/.test(new URL(url).pathname);
}

/** 1×1 PNG — gerçek kullanıcı fotoğrafına dayanmaz. */
function tinyPng(): Buffer {
  return Buffer.from(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
    "base64"
  );
}

test.describe("Yazılım ürünü medya yükleme", () => {
  test.skip(SKIP_WITHOUT_WRITABLE_API, "Gerçekten medya yükler; yazılabilir API olmadan atlanır.");
  test.describe.configure({ timeout: 90_000 });

  test("küçük bir görsel yüklenir, kaydedilir ve yenileme sonrası galeride durur", async ({ page }) => {
    const created = await createSoftwareProduct(page);

    try {
      await openMedia(page, created.id);
      await expect(page.getByText("Henüz medya eklenmedi.")).toBeVisible();

      const uploaded = page.waitForResponse(
        (response) => response.request().method() === "POST" && isMediaUpload(response.url()),
        { timeout: 30_000 }
      );

      await page.getByLabel("Dosya seç").setInputFiles({
        name: "e2e-cover.png",
        mimeType: "image/png",
        buffer: tinyPng(),
      });

      const response = await uploaded;
      expect(response.status(), await response.text().catch(() => "")).toBeLessThan(400);
      expect(response.ok(), `medya yükleme ${response.status()}`).toBe(true);

      await expect(page.getByText("Görsel yüklendi.")).toBeVisible({ timeout: 15_000 });
      await expect(page.getByText("Henüz medya eklenmedi.")).toHaveCount(0);
      await expect(page.getByText("Kapak adayı")).toBeVisible();
      await expect(page.locator(".pricing-sortable-item img")).toBeVisible();
      await expect(page.getByLabel("Birincil Görsel")).toBeChecked();
      await expect(page.locator(".pricing-sortable-item")).toHaveCount(1);

      await saveProductSection(page, "Medya güncellendi");
      await expect(page.getByText("Güncel").first()).toBeVisible({ timeout: 10_000 });

      await page.reload();
      await expect(page.getByRole("heading", { name: "Medya" }).first()).toBeVisible({ timeout: 20_000 });
      await waitForContentLoaded(page);
      await expect(page.getByText("Henüz medya eklenmedi.")).toHaveCount(0);
      await expect(page.getByText("Kapak adayı")).toBeVisible();
      await expect(page.locator(".pricing-sortable-item img")).toBeVisible();
      await expect(page.getByLabel("Birincil Görsel")).toBeChecked();
      await expect(page.locator(".pricing-sortable-item")).toHaveCount(1);
    } finally {
      await deleteSoftwareProductIfSupported(page, created.id);
    }
  });

  test("boyutu aşan dosya reddedilir ve galeri boş kalır", async ({ page }) => {
    const created = await createSoftwareProduct(page);

    try {
      await openMedia(page, created.id);
      await expect(page.getByText("Henüz medya eklenmedi.")).toBeVisible();

      let uploadAttempted = false;
      page.on("request", (request) => {
        if (request.method() === "POST" && isMediaUpload(request.url())) {
          uploadAttempted = true;
        }
      });

      await page.getByLabel("Dosya seç").setInputFiles({
        name: "e2e-too-large.png",
        mimeType: "image/png",
        buffer: Buffer.alloc(MAX_FILE_SIZE + 1),
      });

      await expect(page.getByRole("alert").filter({ hasText: /çok büyük/i })).toBeVisible({
        timeout: 10_000,
      });
      await expect(page.getByText("Henüz medya eklenmedi.")).toBeVisible();
      await expect(page.getByText("Kapak adayı")).toHaveCount(0);
      expect(uploadAttempted, "reddedilen dosya sunucuya gitmemeli").toBe(false);
    } finally {
      await deleteSoftwareProductIfSupported(page, created.id);
    }
  });
});
