import path from "path";
import { test, expect, type Locator, type Page } from "@playwright/test";
import { SKIP_WITHOUT_WRITABLE_API, waitForContentLoaded } from "../utils";
import {
  createPhysicalProduct,
  createSalesPlanFromTemplate,
  createSoftwareProduct,
  deleteSoftwareProductIfSupported,
  openModules,
  openProductPricing,
  saveProductSection,
  type CreatedSoftwareProduct,
} from "./helpers/softwareProduct";

/**
 * TASK-006: writable coverage for product-scoped modules, required/optional,
 * per-plan and all-plans offering prices, reorder, and the modules-page
 * picker excluding physical products.
 *
 * Starts from TASK-001's create helper, then creates two sales plans so
 * module offering prices are not blocked by the empty-offering warning.
 */

const MONTHLY_PLAN = "Aylık Plan";
const YEARLY_PLAN = "Yıllık Plan";

const REQUIRED_MODULE = {
  name: "E2E Çekirdek",
  description: "Zorunlu çekirdek modül",
  optional: false,
  price: "25",
  plan: MONTHLY_PLAN,
} as const;

const OPTIONAL_MODULE = {
  name: "E2E Raporlama",
  description: "Opsiyonel raporlama modülü",
  optional: true,
  price: "10",
} as const;

function isModuleWrite(url: string, method: string): boolean {
  if (!["POST", "PUT", "PATCH", "DELETE"].includes(method)) return false;
  return (
    url.includes("/license-offerings") ||
    url.includes("/modules") ||
    url.includes("/offering-prices") ||
    url.includes("/full")
  );
}

function attachWriteGuard(page: Page): () => void {
  const failures: string[] = [];
  page.on("response", (response) => {
    if (!isModuleWrite(response.url(), response.request().method())) return;
    if (response.status() >= 400) {
      failures.push(`${response.request().method()} ${response.url()} -> ${response.status()}`);
    }
  });
  return () => expect(failures, failures.join("\n")).toEqual([]);
}

function moduleCards(page: Page) {
  return page.locator(".pricing-sortable-item");
}

async function fillModuleCard(
  card: Locator,
  values: { name: string; description: string; optional: boolean }
) {
  await card.locator("input[placeholder='CRM Entegrasyonu']").fill(values.name);
  await card.locator("input[placeholder='Modül hakkında kısa açıklama...']").fill(values.description);
  const optional = card.getByRole("checkbox", { name: "Opsiyonel" });
  if (values.optional) {
    await optional.check();
  } else {
    await optional.uncheck();
  }
}

async function addOfferingPrice(card: Locator, offering: string, price: string) {
  await card.getByRole("button", { name: "Fiyat Ekle" }).click();
  const priceCard = card.locator(".card.card-bordered.bg-lighter").last();
  const optionValue = offering === "Tüm planlar" ? "__all_license_offerings__" : { label: offering };
  await priceCard.locator("select").selectOption(optionValue);
  await priceCard.locator("input[type=number]").fill(price);
}

function isProductListSearch(url: string, term: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.pathname.replace(/\/$/, "").endsWith("/api/products") && (parsed.searchParams.get("search") ?? "") === term;
  } catch {
    return false;
  }
}

async function expectOfferingPrice(card: Locator, offeringLabel: string, price: string) {
  const matching = card.locator(".card.card-bordered.bg-lighter").filter({
    has: card.locator("select"),
  });
  const count = await matching.count();
  let found = false;
  for (let index = 0; index < count; index += 1) {
    const row = matching.nth(index);
    const selectedLabel = ((await row.locator("select option:checked").innerText()) ?? "").trim();
    if (selectedLabel === offeringLabel) {
      expect(Number(await row.locator("input[type=number]").inputValue())).toBe(Number(price));
      found = true;
      break;
    }
  }
  expect(found, `${offeringLabel} fiyat satırı yok`).toBe(true);
}

async function expectAllPlanPrices(card: Locator, price: string, planNames: readonly string[]) {
  const matching = card.locator(".card.card-bordered.bg-lighter").filter({
    has: card.locator("select"),
  });
  await expect(matching).toHaveCount(planNames.length);
  for (const planName of planNames) {
    await expectOfferingPrice(card, planName, price);
  }
}

test.describe("Yazılım ürünü modülleri ve lisans paketi fiyatları", () => {
  test.skip(SKIP_WITHOUT_WRITABLE_API, "Gerçekten kayıt yazar; yazılabilir API olmadan atlanır.");
  test.describe.configure({ mode: "serial", timeout: 180_000 });

  let software: CreatedSoftwareProduct | undefined;
  let physical: CreatedSoftwareProduct | undefined;

  test.afterAll(async ({ browser }) => {
    const context = await browser.newContext({
      storageState: path.join("playwright/.auth/user.json"),
    });
    const page = await context.newPage();
    await page.goto("/");
    if (software) await deleteSoftwareProductIfSupported(page, software.id);
    if (physical) await deleteSoftwareProductIfSupported(page, physical.id);
    await context.close();
  });

  test("iki satış planı olan ürüne zorunlu ve opsiyonel modül eklenir, fiyatlar ve sıra yenileme sonrası durur", async ({
    page,
  }) => {
    const assertNoWriteError = attachWriteGuard(page);

    software = await createSoftwareProduct(page);
    await openProductPricing(page, software.id);
    await createSalesPlanFromTemplate(page, "Aylık plan", MONTHLY_PLAN);
    await createSalesPlanFromTemplate(page, "Yıllık plan", YEARLY_PLAN);
    await expect(page.locator(".card.h-100").filter({ hasText: MONTHLY_PLAN })).toBeVisible();
    await expect(page.locator(".card.h-100").filter({ hasText: YEARLY_PLAN })).toBeVisible();

    await openModules(page, software.id);
    await expect(page.getByText("Henüz modül eklenmemiş")).toBeVisible();
    await expect(page.getByText("Lisans paketi fiyatı eklemek için önce")).toHaveCount(0);

    await page.getByRole("button", { name: "Modül Ekle" }).click();
    await page.getByRole("button", { name: "Modül Ekle" }).click();
    await expect(moduleCards(page)).toHaveCount(2);

    const first = moduleCards(page).nth(0);
    const second = moduleCards(page).nth(1);
    await fillModuleCard(first, REQUIRED_MODULE);
    await fillModuleCard(second, OPTIONAL_MODULE);

    await addOfferingPrice(first, MONTHLY_PLAN, REQUIRED_MODULE.price);
    await addOfferingPrice(second, "Tüm planlar", OPTIONAL_MODULE.price);

    await first.getByRole("button", { name: "Aşağı taşı" }).click();
    await expect(moduleCards(page).nth(0).locator("input[placeholder='CRM Entegrasyonu']")).toHaveValue(
      OPTIONAL_MODULE.name
    );
    await expect(moduleCards(page).nth(1).locator("input[placeholder='CRM Entegrasyonu']")).toHaveValue(
      REQUIRED_MODULE.name
    );

    await saveProductSection(page, "Modüller güncellendi");
    await expect(page.getByText("Güncel").first()).toBeVisible({ timeout: 10_000 });

    await page.reload();
    await expect(page.getByRole("heading", { name: "Modüller" }).first()).toBeVisible({ timeout: 20_000 });
    await waitForContentLoaded(page);
    await expect(moduleCards(page)).toHaveCount(2);

    const afterFirst = moduleCards(page).nth(0);
    const afterSecond = moduleCards(page).nth(1);
    await expect(afterFirst.locator("input[placeholder='CRM Entegrasyonu']")).toHaveValue(OPTIONAL_MODULE.name);
    await expect(afterSecond.locator("input[placeholder='CRM Entegrasyonu']")).toHaveValue(REQUIRED_MODULE.name);
    await expect(afterFirst.getByRole("checkbox", { name: "Opsiyonel" })).toBeChecked();
    await expect(afterSecond.getByRole("checkbox", { name: "Opsiyonel" })).not.toBeChecked();
    await expectAllPlanPrices(afterFirst, OPTIONAL_MODULE.price, [MONTHLY_PLAN, YEARLY_PLAN]);
    await expectOfferingPrice(afterSecond, MONTHLY_PLAN, REQUIRED_MODULE.price);
    await expect(afterSecond.locator(".card.card-bordered.bg-lighter")).toHaveCount(1);

    assertNoWriteError();
  });

  test("modüller sayfasındaki ürün seçici fiziksel ürünü listelemez", async ({ page }) => {
    expect(software, "önceki test yazılım ürünü oluşturamadı").toBeTruthy();
    const softwareProduct = software as CreatedSoftwareProduct;
    try {
      physical = await createPhysicalProduct(page);
    } catch (error) {
      test.skip(true, `fiziksel ürün bu ortamda oluşturulamadı: ${error instanceof Error ? error.message : String(error)}`);
    }
    const physicalProduct = physical as CreatedSoftwareProduct;

    await page.goto("/software-products/modules");
    await expect(page.getByRole("heading", { name: "Modüller" }).first()).toBeVisible({ timeout: 20_000 });
    await expect(page.getByText("Bu sayfada yalnızca").first()).toContainText("Yazılım");

    const search = page.getByPlaceholder(/Ürün adı veya kodu ile ara/);
    await search.click();

    const physicalListed = page.waitForResponse(
      (response) =>
        response.request().method() === "GET" && isProductListSearch(response.url(), physicalProduct.name),
      { timeout: 15_000 }
    );
    await search.fill(physicalProduct.name);
    await physicalListed;
    await expect(page.locator(".link-list-plain button", { hasText: physicalProduct.name })).toHaveCount(0);
    await expect(page.locator(".link-list-plain .badge", { hasText: "Fiziksel" })).toHaveCount(0);

    const softwareListed = page.waitForResponse(
      (response) =>
        response.request().method() === "GET" && isProductListSearch(response.url(), softwareProduct.name),
      { timeout: 15_000 }
    );
    await search.fill(softwareProduct.name);
    await softwareListed;
    await expect(page.locator(".link-list-plain button", { hasText: softwareProduct.name })).toBeVisible({
      timeout: 15_000,
    });
    await expect(page.locator(".link-list-plain .badge", { hasText: "Fiziksel" })).toHaveCount(0);
  });
});
