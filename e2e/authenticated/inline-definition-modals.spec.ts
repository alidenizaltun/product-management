import { test, expect } from "@playwright/test";
import { SKIP_WITHOUT_SHARED_DATA, SKIP_WITHOUT_WRITABLE_API, waitForContentLoaded } from "../utils";
import {
  captureCreatedIds,
  cleanupInlineDefinitions,
  createSoftwareProduct,
  openClassification,
  openRegions,
  saveProductSection,
} from "./helpers/softwareProduct";

const PRODUCT_ID = "178AC852-2308-47DE-A2D9-ED806BF9EC2D";

test.describe("Inline tanım modalları", () => {
  test.skip(SKIP_WITHOUT_SHARED_DATA, "Ürün seçici paylaşımlı dev verisine dayanır.");

  test("sınıflandırma sayfasında yeni kategori ve özellik tanımı ayrı sayfaya gitmeden modal açar", async ({
    page,
  }) => {
    await page.goto(`/product-info/classification?productId=${PRODUCT_ID}`);
    await expect(page.getByRole("heading", { name: "Sınıflandırma" })).toBeVisible({ timeout: 20_000 });
    await waitForContentLoaded(page);

    await expect(page.getByRole("link", { name: "Yeni Kategori Tanımı" })).toHaveCount(0);
    await page.getByRole("button", { name: "Yeni Kategori Tanımı" }).click();
    const categoryDialog = page.getByRole("dialog");
    await expect(categoryDialog).toBeVisible();
    await expect(categoryDialog.getByRole("heading", { name: "Yeni Kategori Tanımı" })).toBeVisible();
    await expect(page).toHaveURL(/\/product-info\/classification/);
    await categoryDialog.screenshot({ path: "test-results/inline-category-modal.png" });
    await page.getByRole("button", { name: "İptal" }).click();
    await expect(page.getByRole("dialog")).toHaveCount(0);

    await page.getByRole("button", { name: "Yeni Özellik Tanımı" }).click();
    const attributeDialog = page.getByRole("dialog");
    await expect(attributeDialog).toBeVisible();
    await expect(attributeDialog.getByRole("heading", { name: "Yeni Özellik Tanımı" })).toBeVisible();
    await expect(page).toHaveURL(/\/product-info\/classification/);
    await attributeDialog.screenshot({ path: "test-results/inline-attribute-modal.png" });
    await page.getByRole("button", { name: "İptal" }).click();
    await expect(page.getByRole("dialog")).toHaveCount(0);
  });

  test("bölgeler sayfasında yeni bölge tanımı ayrı sayfaya gitmeden modal açar", async ({ page }) => {
    await page.goto(`/product-info/regions?productId=${PRODUCT_ID}`);
    await expect(page.getByRole("heading", { name: "Bölgeler" }).first()).toBeVisible({ timeout: 20_000 });
    await waitForContentLoaded(page);

    await expect(page.getByRole("link", { name: "Yeni Bölge Tanımı" })).toHaveCount(0);
    await page.getByRole("button", { name: "Yeni Bölge Tanımı" }).click();
    const regionDialog = page.getByRole("dialog");
    await expect(regionDialog).toBeVisible();
    await expect(regionDialog.getByRole("heading", { name: "Yeni Bölge Tanımı" })).toBeVisible();
    await expect(page).toHaveURL(/\/product-info\/regions/);
    await regionDialog.screenshot({ path: "test-results/inline-region-modal.png" });
    await page.getByRole("button", { name: "İptal" }).click();
    await expect(page.getByRole("dialog")).toHaveCount(0);
  });
});

test.describe("Inline tanım oluşturma", () => {
  test.skip(SKIP_WITHOUT_WRITABLE_API, "Gerçekten kayıt yazar; yazılabilir API olmadan atlanır.");
  test.describe.configure({ mode: "serial", timeout: 120_000 });

  let productId: string | undefined;
  let createdCategoryIds: string[] = [];
  let createdAttributeIds: string[] = [];
  let createdRegionIds: string[] = [];

  test.beforeEach(() => {
    productId = undefined;
    createdCategoryIds = [];
    createdAttributeIds = [];
    createdRegionIds = [];
  });

  test.afterEach(async ({ page }) => {
    await cleanupInlineDefinitions(page, {
      productId,
      categoryIds: createdCategoryIds,
      attributeIds: createdAttributeIds,
      regionIds: createdRegionIds,
    });
  });

  test("modal ile oluşturulan kategori ürüne atanır, kaydedilir ve yenileme sonrası durur", async ({ page }) => {
    const created = await createSoftwareProduct(page);
    productId = created.id;
    const categoryName = `E2E Modal Kategori ${Date.now()}`;
    captureCreatedIds(page, (url) => url.endsWith("/api/catalog/categories"), createdCategoryIds);

    await openClassification(page, created.id);
    await expect(page).toHaveURL(/\/product-info\/classification/);
    await expect(page).not.toHaveURL(/\/definitions\//);

    await page.getByRole("button", { name: "Yeni Kategori Tanımı" }).click();
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await dialog.getByLabel(/^Ad/).fill(categoryName);
    await dialog.getByRole("button", { name: "Oluştur" }).click();

    await expect(page.getByText("Kategori oluşturuldu.")).toBeVisible({ timeout: 15_000 });
    await expect.poll(() => createdCategoryIds.length).toBeGreaterThan(0);
    await expect(page.getByRole("dialog")).toHaveCount(0);
    await expect(page).toHaveURL(/\/product-info\/classification/);
    await expect(page).not.toHaveURL(/\/definitions\//);
    await expect(page.getByText(categoryName)).toBeVisible();
    await expect(page.getByText("Kategori #1")).toBeVisible();
    await expect(page.getByRole("checkbox", { name: "Birincil Kategori" })).toBeChecked();

    await saveProductSection(page, "Sınıflandırma güncellendi");

    await page.reload();
    await expect(page.getByRole("heading", { name: "Sınıflandırma" })).toBeVisible({ timeout: 20_000 });
    await waitForContentLoaded(page);
    await expect(page).toHaveURL(/\/product-info\/classification/);
    await expect(page.getByText(categoryName)).toBeVisible();
    await expect(page.getByRole("checkbox", { name: "Birincil Kategori" })).toBeChecked();
  });

  test("modal ile oluşturulan özellik değere sahip kaydedilir ve yenileme sonrası durur", async ({ page }) => {
    const created = await createSoftwareProduct(page);
    productId = created.id;
    const stamp = Date.now();
    const attributeKey = `e2e_attr_${stamp}`;
    const displayName = `E2E Özellik ${stamp}`;
    const attributeValue = "E2E Metin Değeri";
    captureCreatedIds(page, (url) => /\/api\/attributes\/?$/.test(new URL(url).pathname), createdAttributeIds);

    await openClassification(page, created.id);
    await expect(page).toHaveURL(/\/product-info\/classification/);

    await page.getByRole("button", { name: "Yeni Özellik Tanımı" }).click();
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await dialog.getByLabel(/^Anahtar/).fill(attributeKey);
    await dialog.getByLabel(/^Görünen Ad/).fill(displayName);
    await expect(dialog.locator("#quick-add-attr-data-type")).toHaveValue("1");
    await dialog.getByRole("button", { name: "Oluştur" }).click();

    await expect(page.getByText("Özellik tanımı oluşturuldu.")).toBeVisible({ timeout: 15_000 });
    await expect.poll(() => createdAttributeIds.length).toBeGreaterThan(0);
    await expect(page.getByRole("dialog")).toHaveCount(0);
    await expect(page).toHaveURL(/\/product-info\/classification/);
    await expect(page).not.toHaveURL(/\/definitions\//);
    await expect(page.getByText(displayName)).toBeVisible();
    await expect(page.getByText("Özellik #1")).toBeVisible();

    await page.getByPlaceholder("Özellik değeri").fill(attributeValue);
    await saveProductSection(page, "Sınıflandırma güncellendi");

    await page.reload();
    await expect(page.getByRole("heading", { name: "Sınıflandırma" })).toBeVisible({ timeout: 20_000 });
    await waitForContentLoaded(page);
    await expect(page).toHaveURL(/\/product-info\/classification/);
    await expect(page.getByText(displayName)).toBeVisible();
    await expect(page.getByPlaceholder("Özellik değeri")).toHaveValue(attributeValue);
  });

  test("modal ile oluşturulan bölge tanımı ürüne atanır, kaydedilir ve yenileme sonrası durur", async ({ page }) => {
    const created = await createSoftwareProduct(page);
    productId = created.id;
    const regionName = `E2E Modal Bölge ${Date.now()}`;
    captureCreatedIds(page, (url) => /\/api\/regions\/?$/.test(new URL(url).pathname), createdRegionIds);

    await openRegions(page, created.id);
    await expect(page).toHaveURL(/\/product-info\/regions/);
    await expect(page).not.toHaveURL(/\/definitions\//);

    await page.getByRole("button", { name: "Yeni Bölge Tanımı" }).click();
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await dialog.getByLabel(/^Ad/).fill(regionName);
    await dialog.getByRole("button", { name: "Oluştur" }).click();

    await expect(page.getByText("Bölge tanımı oluşturuldu.")).toBeVisible({ timeout: 15_000 });
    await expect.poll(() => createdRegionIds.length).toBeGreaterThan(0);
    await expect(page.getByRole("dialog")).toHaveCount(0);
    await expect(page).toHaveURL(/\/product-info\/regions/);
    await expect(page).not.toHaveURL(/\/definitions\//);
    await expect(page.getByText(regionName)).toBeVisible();
    await expect(page.getByText("Bölge #1")).toBeVisible();
    await expect(page.getByText("Varsayılan", { exact: true })).toBeVisible();

    await saveProductSection(page, "Bölgeler güncellendi");

    await page.reload();
    await expect(page.getByRole("heading", { name: "Bölgeler" }).first()).toBeVisible({ timeout: 20_000 });
    await waitForContentLoaded(page);
    await expect(page).toHaveURL(/\/product-info\/regions/);
    await expect(page.getByText(regionName)).toBeVisible();
    await expect(page.getByText("Varsayılan", { exact: true })).toBeVisible();
  });
});
