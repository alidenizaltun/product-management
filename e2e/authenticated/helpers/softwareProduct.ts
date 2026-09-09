import { expect, type Page } from "@playwright/test";
import { waitForContentLoaded } from "../../utils";

/**
 * Writable product E2E helpers. Products are created through the UI.
 * `createSoftwareProduct` does not add categories, plans, or modules.
 */

export const SOFTWARE_PRODUCT_NAME_PREFIX = "E2E Yazılım";
export const PHYSICAL_PRODUCT_NAME_PREFIX = "E2E Fiziksel";

export interface CreatedSoftwareProduct {
  id: string;
  name: string;
}

export interface SoftwareProductGeneralInfo {
  shortDescription: string;
  description: string;
  taxRate: number;
  taxCode: string;
  isSellable: boolean;
  isPurchasable: boolean;
}

export interface SoftwareProductProfile {
  version: string;
  downloadUrl: string;
  platforms: string[];
  systemRequirements: Record<string, string>;
  releaseNotes: string;
}

export function uniqueSoftwareProductName(): string {
  return `${SOFTWARE_PRODUCT_NAME_PREFIX} ${Date.now()}`;
}

export function uniquePhysicalProductName(): string {
  return `${PHYSICAL_PRODUCT_NAME_PREFIX} ${Date.now()}`;
}

export function defaultSoftwareProductGeneralInfo(name: string): SoftwareProductGeneralInfo {
  return {
    shortDescription: `${name} kısa açıklama`,
    description: `${name} detaylı açıklama`,
    taxRate: 18,
    taxCode: "E2E-KDV",
    isSellable: true,
    isPurchasable: false,
  };
}

export function defaultSoftwareProductProfile(name: string): SoftwareProductProfile {
  return {
    version: "2.3.1",
    downloadUrl: "https://example.test/e2e/download.zip",
    platforms: ["Windows", "Linux"],
    systemRequirements: { ram: "8GB", os: "Windows 10+" },
    releaseNotes: `${name} sürüm notları`,
  };
}

export function writableApiBase(): string {
  return (process.env.E2E_API_BASE_URL ?? "").replace(/\/$/, "");
}

export async function getAccessToken(page: Page): Promise<string | null> {
  return page.evaluate(
    () => localStorage.getItem("pm_access_token") ?? sessionStorage.getItem("pm_access_token")
  );
}

async function createProductByKind(
  page: Page,
  name: string,
  kindLabel: "Yazılım" | "Fiziksel",
  kindValue: "1" | "2"
): Promise<CreatedSoftwareProduct> {
  await page.goto("/products/new");
  await expect(page.getByRole("heading", { name: "Yeni Ürün" })).toBeVisible({ timeout: 20_000 });

  await page.getByLabel("Ürün Adı").fill(name);
  await page.locator("#product-kind").selectOption({ label: kindLabel });
  await expect(page.locator("#product-kind")).toHaveValue(kindValue);

  const created = page.waitForResponse(
    (response) => response.request().method() === "POST" && response.url().includes("/api/products/full"),
    { timeout: 20_000 }
  );

  await page.getByRole("button", { name: /oluştur ve devam et/i }).click();

  const response = await created;
  expect(response.status(), await response.text().catch(() => "")).toBeLessThan(400);
  expect(response.ok(), `${kindLabel.toLocaleLowerCase("tr-TR")} ürün oluşturma ${response.status()}`).toBe(true);

  await expect(page).toHaveURL(/\/products\/[^/]+$/, { timeout: 15_000 });
  await expect(page.getByRole("heading", { name }).first()).toBeVisible({ timeout: 15_000 });

  const id = new URL(page.url()).pathname.split("/").pop();
  expect(id, "oluşturulan ürün id'si URL'de yok").toBeTruthy();

  return { id: id as string, name };
}

export async function createSoftwareProduct(
  page: Page,
  options: { name?: string } = {}
): Promise<CreatedSoftwareProduct> {
  return createProductByKind(page, options.name ?? uniqueSoftwareProductName(), "Yazılım", "2");
}

export async function createPhysicalProduct(
  page: Page,
  options: { name?: string } = {}
): Promise<CreatedSoftwareProduct> {
  return createProductByKind(page, options.name ?? uniquePhysicalProductName(), "Fiziksel", "1");
}

export async function openGeneralInfo(page: Page, productId: string): Promise<void> {
  await page.goto(`/product-info/general?productId=${productId}`);
  await expect(page.getByRole("heading", { name: "Genel Bilgiler" }).first()).toBeVisible({
    timeout: 20_000,
  });
  await expect(page.getByLabel("Ürün Adı")).toBeVisible({ timeout: 20_000 });
  await waitForContentLoaded(page);
}

export async function fillSoftwareProductGeneralInfo(
  page: Page,
  values: SoftwareProductGeneralInfo
): Promise<void> {
  await page.getByLabel("Kısa Açıklama").fill(values.shortDescription);
  await page.getByLabel("Detaylı Açıklama").fill(values.description);
  await page.getByLabel("Vergi Oranı").fill(String(values.taxRate));
  await page.getByLabel("Vergi Kodu").fill(values.taxCode);

  const advancedToggle = page.getByRole("button", { name: /gelişmiş kimlik ve satış ayarları/i });
  await advancedToggle.click();

  await setCheckbox(page, "Satılabilir", values.isSellable);
  await setCheckbox(page, "Satın Alınabilir", values.isPurchasable);
}

export async function saveGeneralInfo(page: Page): Promise<void> {
  const saved = page.waitForResponse(
    (response) =>
      response.request().method() === "PUT" && response.url().includes("/api/products/") && response.url().includes("/full"),
    { timeout: 20_000 }
  );

  await page.getByRole("button", { name: /^kaydet$/i }).first().click();

  const response = await saved;
  expect(response.status(), await response.text().catch(() => "")).toBeLessThan(400);
  expect(response.ok(), `genel bilgiler kaydı ${response.status()}`).toBe(true);
  await expect(page.getByText("Genel Bilgiler güncellendi").first()).toBeVisible({ timeout: 15_000 });
}

export async function expectGeneralInfoValues(page: Page, values: SoftwareProductGeneralInfo): Promise<void> {
  await expect(page.getByLabel("Kısa Açıklama")).toHaveValue(values.shortDescription);
  await expect(page.getByLabel("Detaylı Açıklama")).toHaveValue(values.description);
  expect(Number(await page.getByLabel("Vergi Oranı").inputValue())).toBe(values.taxRate);
  await expect(page.getByLabel("Vergi Kodu")).toHaveValue(values.taxCode);

  const advancedToggle = page.getByRole("button", { name: /gelişmiş kimlik ve satış ayarları/i });
  const purchasable = page.getByRole("checkbox", { name: "Satın Alınabilir" });
  if ((await purchasable.count()) === 0) {
    await advancedToggle.click();
  }

  await expect(page.getByRole("checkbox", { name: "Satılabilir" })).toBeChecked({
    checked: values.isSellable,
  });
  await expect(page.getByRole("checkbox", { name: "Satın Alınabilir" })).toBeChecked({
    checked: values.isPurchasable,
  });
}

/**
 * Ürün silme API'si varsa temizler. 404/405 silmenin bu ortamda olmadığını
 * gösterir; o durumda test başarısız olmaz.
 */
export async function deleteSoftwareProductIfSupported(
  page: Page,
  productId: string
): Promise<"deleted" | "unsupported" | "skipped"> {
  const apiBase = writableApiBase();
  if (!apiBase || !productId) return "skipped";

  const token = await getAccessToken(page);
  if (!token) return "skipped";

  const response = await page.request.delete(`${apiBase}/api/products/${productId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (response.ok() || response.status() === 204) return "deleted";
  if ([401, 403, 404, 405, 501].includes(response.status())) return "unsupported";

  throw new Error(`ürün silme beklenmeyen durum: ${productId} -> ${response.status()}`);
}

export async function openClassification(page: Page, productId: string): Promise<void> {
  await page.goto(`/product-info/classification?productId=${productId}`);
  await expect(page.getByRole("heading", { name: "Sınıflandırma" })).toBeVisible({ timeout: 20_000 });
  await waitForContentLoaded(page);
}

export async function openRegions(page: Page, productId: string): Promise<void> {
  await page.goto(`/product-info/regions?productId=${productId}`);
  await expect(page.getByRole("heading", { name: "Bölgeler" }).first()).toBeVisible({ timeout: 20_000 });
  await waitForContentLoaded(page);
}

export async function openMedia(page: Page, productId: string): Promise<void> {
  await page.goto(`/product-info/media?productId=${productId}`);
  await expect(page.getByRole("heading", { name: "Medya" }).first()).toBeVisible({ timeout: 20_000 });
  await expect(page.getByRole("heading", { name: "Medya Galerisi" }).first()).toBeVisible({
    timeout: 20_000,
  });
  await waitForContentLoaded(page);
}

export async function openAdvancedSettings(page: Page, productId: string): Promise<void> {
  await page.goto(`/product-info/advanced?productId=${productId}`);
  await expect(page.getByRole("heading", { name: "Gelişmiş Ayarlar" }).first()).toBeVisible({
    timeout: 20_000,
  });
  await expect(page.getByText("Yazılım Kimliği")).toBeVisible({ timeout: 20_000 });
  await waitForContentLoaded(page);
}

export async function openProductPricing(page: Page, productId: string): Promise<void> {
  await page.goto(`/pricing/product-pricing?productId=${productId}`);
  await expect(page.getByRole("heading", { name: "Satış Planları" })).toBeVisible({ timeout: 20_000 });
  await waitForContentLoaded(page);
}

export async function openModules(page: Page, productId: string): Promise<void> {
  await page.goto(`/software-products/modules?productId=${productId}`);
  await expect(page.getByRole("heading", { name: "Modüller" }).first()).toBeVisible({ timeout: 20_000 });
  await expect(page.getByRole("heading", { name: "Ürün Modülleri" })).toBeVisible({ timeout: 20_000 });
  await waitForContentLoaded(page);
}

export async function createSalesPlanFromTemplate(
  page: Page,
  templateTitle: string,
  planName: string
): Promise<void> {
  await page.getByRole("button", { name: "Yeni Satış Planı" }).click();
  const dialog = page.getByRole("dialog").filter({ hasText: "Yeni Satış Planı" });
  await expect(dialog).toBeVisible({ timeout: 15_000 });
  await dialog
    .locator(".pricing-template-card")
    .filter({ hasText: templateTitle })
    .first()
    .click();
  await expect(dialog.getByPlaceholder("Yıllık Abonelik")).toHaveValue(planName, { timeout: 15_000 });

  const created = page.waitForResponse(
    (response) =>
      response.request().method() === "POST" && response.url().includes("/license-offerings"),
    { timeout: 20_000 }
  );
  await dialog.getByRole("button", { name: "Planı Kaydet" }).click();
  const response = await created;
  expect(response.status(), await response.text().catch(() => "")).toBeLessThan(400);
  expect(response.ok(), `plan kaydı ${planName} ${response.status()}`).toBe(true);
  await expect(page.getByText("Satış planı eklendi.").first()).toBeVisible({ timeout: 15_000 });
  await page.keyboard.press("Escape");
  await expect(dialog).toHaveCount(0);
}

function jsonEditor(page: Page, label: string) {
  const header = page
    .locator("div.d-flex")
    .filter({ has: page.locator("label.form-label", { hasText: new RegExp(`^${label}$`) }) })
    .filter({ has: page.getByRole("button", { name: /JSON Modu|Görsel Mod/ }) });
  return header.locator("xpath=..");
}

async function fillJsonEditor(page: Page, label: string, value: unknown): Promise<void> {
  const editor = jsonEditor(page, label);
  const toggle = editor.getByRole("button", { name: /JSON Modu|Görsel Mod/ });
  await expect(toggle).toBeVisible();
  if ((await toggle.innerText()).includes("JSON Modu")) {
    await toggle.click();
  }
  await editor.locator("textarea").fill(JSON.stringify(value, null, 2));
}

async function expectJsonEditor(page: Page, label: string, value: unknown): Promise<void> {
  const editor = jsonEditor(page, label);
  const toggle = editor.getByRole("button", { name: /JSON Modu|Görsel Mod/ });
  await expect(toggle).toBeVisible();
  if ((await toggle.innerText()).includes("JSON Modu")) {
    await toggle.click();
  }
  const raw = await editor.locator("textarea").inputValue();
  expect(JSON.parse(raw)).toEqual(value);
}

export async function fillSoftwareProductProfile(page: Page, values: SoftwareProductProfile): Promise<void> {
  await page.getByRole("textbox", { name: "Sürüm", exact: true }).fill(values.version);
  await page.getByRole("textbox", { name: "İndirme URL" }).fill(values.downloadUrl);
  await page.getByRole("textbox", { name: "Sürüm Notları" }).fill(values.releaseNotes);
  await fillJsonEditor(page, "Desteklenen Platformlar", values.platforms);
  await fillJsonEditor(page, "Sistem Gereksinimleri", values.systemRequirements);
}

export async function expectSoftwareProductProfile(page: Page, values: SoftwareProductProfile): Promise<void> {
  await expect(page.getByRole("textbox", { name: "Sürüm", exact: true })).toHaveValue(values.version);
  await expect(page.getByRole("textbox", { name: "İndirme URL" })).toHaveValue(values.downloadUrl);
  await expect(page.getByRole("textbox", { name: "Sürüm Notları" })).toHaveValue(values.releaseNotes);
  await expectJsonEditor(page, "Desteklenen Platformlar", values.platforms);
  await expectJsonEditor(page, "Sistem Gereksinimleri", values.systemRequirements);
}

export async function saveProductSection(page: Page, successText: string): Promise<void> {
  const saved = page.waitForResponse(
    (response) =>
      response.request().method() === "PUT" &&
      response.url().includes("/api/products/") &&
      response.url().includes("/full"),
    { timeout: 20_000 }
  );

  await page.getByRole("button", { name: /^kaydet$/i }).first().click();

  const response = await saved;
  expect(response.status(), await response.text().catch(() => "")).toBeLessThan(400);
  expect(response.ok(), `${successText} kaydı ${response.status()}`).toBe(true);
  await expect(page.getByText(successText).first()).toBeVisible({ timeout: 15_000 });
}

export function captureCreatedIds(page: Page, matchUrl: (url: string) => boolean, bucket: string[]): void {
  page.on("response", async (response) => {
    const request = response.request();
    if (request.method() !== "POST" || !matchUrl(request.url()) || !response.ok()) return;
    const body = await response.json().catch(() => null);
    if (body?.id) bucket.push(body.id as string);
  });
}

export async function authHeaders(page: Page): Promise<Record<string, string> | null> {
  const token = await getAccessToken(page);
  if (!token) return null;
  return { Authorization: `Bearer ${token}` };
}

async function deleteListItems(
  page: Page,
  listUrl: string,
  itemUrl: (id: string) => string,
  headers: Record<string, string>
): Promise<void> {
  const listed = await page.request.get(listUrl, { headers });
  if (!listed.ok()) return;

  const body: unknown = await listed.json().catch(() => []);
  const rows = Array.isArray(body)
    ? body
    : Array.isArray((body as { items?: unknown[] } | null)?.items)
      ? (body as { items: unknown[] }).items
      : [];

  for (const row of rows) {
    const id = (row as { id?: string } | null)?.id;
    if (!id) continue;
    const removed = await page.request.delete(itemUrl(id), { headers });
    if (!removed.ok() && ![401, 403, 404, 405, 501].includes(removed.status())) {
      throw new Error(`atama silinemedi: ${id} -> ${removed.status()}`);
    }
  }
}

async function deleteDefinition(
  page: Page,
  url: string,
  label: string,
  headers: Record<string, string>
): Promise<void> {
  const response = await page.request.delete(url, { headers });
  if (response.ok() || [404, 405, 501].includes(response.status())) return;
  if (response.status() === 409) {
    throw new Error(`${label} hâlâ bağlı (409): ${url}`);
  }
  throw new Error(`${label} temizlik başarısız: ${url} -> ${response.status()}`);
}

/**
 * Unassign product mappings, delete the product, then delete the definitions.
 * Mapped definitions may 409 if the product still holds them.
 */
export async function cleanupInlineDefinitions(
  page: Page,
  options: {
    productId?: string;
    categoryIds?: string[];
    attributeIds?: string[];
    regionIds?: string[];
  }
): Promise<void> {
  const apiBase = writableApiBase();
  const headers = await authHeaders(page);
  const hasDefinitions =
    (options.categoryIds?.length ?? 0) +
      (options.attributeIds?.length ?? 0) +
      (options.regionIds?.length ?? 0) >
    0;

  if (!apiBase) return;
  if (!headers) {
    if (hasDefinitions || options.productId) {
      throw new Error("temizlik için erişim jetonu yok");
    }
    return;
  }

  if (options.productId) {
    await deleteListItems(
      page,
      `${apiBase}/api/products/${options.productId}/category-maps`,
      (id) => `${apiBase}/api/products/category-maps/${id}`,
      headers
    );
    await deleteListItems(
      page,
      `${apiBase}/api/products/${options.productId}/attribute-values`,
      (id) => `${apiBase}/api/products/attribute-values/${id}`,
      headers
    );
    await deleteListItems(
      page,
      `${apiBase}/api/products/${options.productId}/regions`,
      (id) => `${apiBase}/api/products/regions/${id}`,
      headers
    );
    await deleteSoftwareProductIfSupported(page, options.productId);
  }

  for (const id of options.categoryIds ?? []) {
    await deleteDefinition(page, `${apiBase}/api/catalog/categories/${id}`, "kategori", headers);
  }

  for (const id of options.attributeIds ?? []) {
    await deleteDefinition(page, `${apiBase}/api/attributes/${id}`, "özellik", headers);
  }

  for (const id of options.regionIds ?? []) {
    await deleteDefinition(page, `${apiBase}/api/regions/${id}`, "bölge", headers);
  }
}

async function setCheckbox(page: Page, name: string, checked: boolean): Promise<void> {
  const checkbox = page.getByRole("checkbox", { name });
  await expect(checkbox).toBeVisible();
  if (checked) {
    await checkbox.check();
  } else {
    await checkbox.uncheck();
  }
}
