import path from "path";
import { test, expect, type Locator, type Page } from "@playwright/test";
import { SKIP_WITHOUT_WRITABLE_API } from "../utils";
import {
  authHeaders,
  captureCreatedIds,
  createSoftwareProduct,
  deleteSoftwareProductIfSupported,
  openProductPricing,
  salesPlanCard,
  writableApiBase,
  type CreatedSoftwareProduct,
} from "./helpers/softwareProduct";

/**
 * TASK-004: writable coverage for every built-in sales-plan template, two
 * product units assigned independently per plan, and tiered rules for both
 * units on one subscription plan.
 *
 * Do not point this file at İKNET. Existing read-only specs keep that fixture.
 *
 * ---------------------------------------------------------------------------
 * TASK-005 source of truth — recorded form / adjustment values
 * ---------------------------------------------------------------------------
 *
 * Plans (template title → saved offering):
 *   Aylık plan     → name "Aylık Plan",           licenseModel 2, billingPeriodUnit 3 (Ay), billingPeriodValue 30
 *   Yıllık plan    → name "Yıllık Plan",          licenseModel 2, billingPeriodUnit 4 (Yıl), billingPeriodValue 365
 *   Tek seferlik   → name "Tek Seferlik Lisans",  licenseModel 1, billingPeriodUnit/value cleared, autoRenew false
 *   Deneme         → name "Deneme Planı",         licenseModel 5, trialDays 14, autoRenew false
 *
 * `buildOfferingPayload` always sends `basePrice: 0`. Money lives on rules.
 * Do not treat list-card prices as rule totals.
 *
 * Units: two product units (dictionary "Kullanıcı" / "Kullanıcı Başına" and
 * "GB" when present, otherwise uniquely named E2E fallbacks). Both assigned
 * to Aylık Plan; only the first assigned to Yıllık Plan.
 *
 * Rules are created on Aylık Plan (subscription). One rule per unit so each
 * unit can have its own tiers. The UI also allows many `productUnitIds` on a
 * single rule; this spec does not use that, because TASK-005 needs distinct
 * money per unit.
 *
 * Rule A (users) — form:
 *   hesaplama modu = Kademeli (adjustment.mode = "unit")
 *   fiyat yönü     = Artır   (operation stored as "" / omitted — the select
 *                             value "add" maps to an empty operation field)
 *   kademeler:
 *     1–10  type=fixed      value=50
 *     11+   type=fixed      value=40   (to empty → null)
 *
 * Rule B (GB) — form:
 *   hesaplama modu = Kademeli
 *   fiyat yönü     = Artır
 *   kademeler:
 *     1–10  type=fixed      value=15
 *     11+   type=percentage value=10
 *
 * Expected `priceAdjustment` after `formToAdjustment` (unit mode):
 *
 *   // Rule A
 *   {
 *     applyOn: "currentPrice",
 *     mode: "unit",
 *     unit: { freeUnits: null, rounding: "" },
 *     tiers: [
 *       { from: 1, to: 10, type: "fixed", value: 50 },
 *       { from: 11, to: null, type: "fixed", value: 40 }
 *     ],
 *     limits: { minAdjustment: null, maxAdjustment: null, minFinalPrice: null, maxFinalPrice: null },
 *     conditions: { operator: "all", items: [] }
 *   }
 *
 *   // Rule B — same shape, tiers:
 *   //   { from: 1, to: 10, type: "fixed", value: 15 }
 *   //   { from: 11, to: null, type: "percentage", value: 10 }
 *
 * `adjustment.unit.field` is not set by the product rule form; unit identity
 * is `productUnitIds` on the rule. Auto names: "Kademeli fiyat kuralı" and
 * "Kademeli fiyat kuralı 2".
 *
 * Quantity 10 stays in tier 1; quantity 11 crosses into tier 2. A second unit
 * on the same offering is the other rule's `productUnitIds`.
 */

const PLAN_TEMPLATES = [
  {
    templateTitle: "Aylık plan",
    name: "Aylık Plan",
    licenseModel: 2,
    licenseModelLabel: "Abonelik",
    billingPeriodUnit: "3",
    billingPeriodValue: "30",
    billingBadge: "30 ay periyot",
  },
  {
    templateTitle: "Yıllık plan",
    name: "Yıllık Plan",
    licenseModel: 2,
    licenseModelLabel: "Abonelik",
    billingPeriodUnit: "4",
    billingPeriodValue: "365",
    billingBadge: "365 yıl periyot",
  },
  {
    templateTitle: "Tek seferlik",
    name: "Tek Seferlik Lisans",
    licenseModel: 1,
    licenseModelLabel: "Tek Seferlik",
    billingPeriodUnit: "",
    billingPeriodValue: "",
    billingBadge: null as string | null,
  },
  {
    templateTitle: "Deneme",
    name: "Deneme Planı",
    licenseModel: 5,
    licenseModelLabel: "Deneme",
    billingPeriodUnit: "",
    billingPeriodValue: "",
    billingBadge: null as string | null,
    trialDays: "14",
  },
] as const;

const USER_UNIT_CANDIDATES = ["Kullanıcı Başına", "Kullanıcı"];
const STORAGE_UNIT_CANDIDATES = ["GB"];

const USER_TIERS = [
  { from: "1", to: "10", type: "fixed", value: "50" },
  { from: "11", to: "", type: "fixed", value: "40" },
] as const;

const STORAGE_TIERS = [
  { from: "1", to: "10", type: "fixed", value: "15" },
  { from: "11", to: "", type: "percentage", value: "10" },
] as const;

const EXPECTED_USER_ADJUSTMENT = {
  applyOn: "currentPrice",
  mode: "unit",
  unit: { freeUnits: null, rounding: "" },
  tiers: [
    { from: 1, to: 10, type: "fixed", value: 50 },
    { from: 11, to: null, type: "fixed", value: 40 },
  ],
  limits: { minAdjustment: null, maxAdjustment: null, minFinalPrice: null, maxFinalPrice: null },
  conditions: { operator: "all", items: [] },
};

const EXPECTED_STORAGE_ADJUSTMENT = {
  applyOn: "currentPrice",
  mode: "unit",
  unit: { freeUnits: null, rounding: "" },
  tiers: [
    { from: 1, to: 10, type: "fixed", value: 15 },
    { from: 11, to: null, type: "percentage", value: 10 },
  ],
  limits: { minAdjustment: null, maxAdjustment: null, minFinalPrice: null, maxFinalPrice: null },
  conditions: { operator: "all", items: [] },
};

function isPricingWrite(url: string, method: string): boolean {
  if (!["POST", "PUT", "PATCH", "DELETE"].includes(method)) return false;
  return (
    url.includes("/license-offerings") ||
    url.includes("/pricing-rules") ||
    url.includes("/unit-definitions") ||
    /\/api\/products\/[^/]+\/units\/?$/.test(new URL(url).pathname) ||
    /\/api\/products\/units\//.test(new URL(url).pathname)
  );
}

function attachWriteGuard(page: Page): () => void {
  const failures: string[] = [];
  page.on("response", (response) => {
    if (!isPricingWrite(response.url(), response.request().method())) return;
    if (response.status() >= 400) {
      failures.push(`${response.request().method()} ${response.url()} -> ${response.status()}`);
    }
  });
  return () => expect(failures, failures.join("\n")).toEqual([]);
}

function labeledControl(dialog: Locator, label: string) {
  const fieldLabel = dialog.locator("label.form-label").filter({ hasText: new RegExp(`^${label}`) }).first();
  return fieldLabel.locator("xpath=following::*[self::select or self::input][1]");
}

function dialogByTitle(page: Page, title: string) {
  return page.getByRole("dialog").filter({ hasText: title });
}

async function createPlanFromTemplate(page: Page, templateTitle: string, planName: string) {
  await page.getByRole("button", { name: "Yeni Satış Planı" }).click();
  const dialog = dialogByTitle(page, "Yeni Satış Planı");
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

async function openPlanRules(page: Page, productId: string, planName: string) {
  await openProductPricing(page, productId);
  await salesPlanCard(page, planName).getByRole("button", { name: "Fiyatlandırma" }).click();
  await expect(page.getByRole("heading", { name: planName })).toBeVisible({ timeout: 15_000 });
  await expect(page.getByText("Fiyatlandırma kuralları", { exact: true })).toBeVisible();
}

async function openPlanSettings(page: Page, planName: string) {
  await salesPlanCard(page, planName).getByRole("button", { name: "Ayarlar" }).click();
  const dialog = dialogByTitle(page, "Satış Planı Ayarları");
  await expect(dialog).toBeVisible({ timeout: 15_000 });
  return dialog;
}

async function openRuleForm(page: Page) {
  await page.getByRole("button", { name: "Yeni Kural" }).click();
  const dialog = dialogByTitle(page, "Dinamik Kural Ekle");
  await expect(dialog.getByText("1. Adım — Birimler")).toBeVisible({ timeout: 15_000 });
  return dialog;
}

const unitRow = (list: Locator, name: string) =>
  list.locator(".pricing-unit-list-item", { hasText: name }).first();

function leftUnitList(dialog: Locator) {
  return dialog.locator(".pricing-unit-list").first();
}

function rightUnitList(dialog: Locator) {
  return dialog.locator(".pricing-unit-list").last();
}

async function closeRuleForm(dialog: Locator) {
  await dialog.getByRole("button", { name: "İptal" }).click();
  await expect(dialog).toHaveCount(0);
}

function optionMatchesCandidate(text: string, candidates: string[]): string | null {
  for (const candidate of candidates) {
    if (text === candidate || text.startsWith(`${candidate} (`)) return candidate;
  }
  return null;
}

async function addUnitToPlan(
  page: Page,
  dialog: Locator,
  candidates: string[],
  fallbackName: string,
  createdUnitDefinitionIds: string[]
): Promise<string> {
  const existing = leftUnitList(dialog).locator(".pricing-unit-list-item").filter({
    hasText: new RegExp(candidates.map((name) => name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")),
  });
  if ((await existing.count()) > 0) {
    const label = (await existing.first().locator("span").first().innerText()).split("(")[0].trim();
    const assignSaved = page.waitForResponse(
      (response) =>
        response.request().method() === "PUT" && response.url().includes("/license-offerings/"),
      { timeout: 15_000 }
    );
    await existing.first().getByRole("button", { name: "Ekle" }).click();
    expect((await assignSaved).ok()).toBe(true);
    return label;
  }

  await dialog.getByRole("button", { name: "Yeni birim ekle" }).click();
  const unitDialog = page.getByRole("dialog").filter({ hasText: "Evrensel Birim" });
  await expect(unitDialog).toBeVisible();

  const select = unitDialog.locator("select.form-select");
  await expect(select).toBeVisible({ timeout: 15_000 });
  await expect
    .poll(async () => select.locator("option").count(), { timeout: 15_000 })
    .toBeGreaterThan(0);

  const options = select.locator("option");
  const optionCount = await options.count();
  let matchedValue: string | null = null;
  let matchedName: string | null = null;
  let matchedDisabled = false;

  for (let index = 0; index < optionCount; index += 1) {
    const option = options.nth(index);
    const text = ((await option.textContent()) ?? "").trim();
    const candidate = optionMatchesCandidate(text, candidates);
    if (!candidate) continue;
    matchedValue = await option.getAttribute("value");
    matchedName = candidate;
    matchedDisabled = await option.isDisabled();
    if (text.startsWith(`${candidate} (`)) break;
  }

  if (matchedValue && matchedName && !matchedDisabled) {
    await select.selectOption(matchedValue);
    const saved = page.waitForResponse(
      (response) =>
        (response.request().method() === "POST" && /\/api\/products\/[^/]+\/units\/?$/.test(new URL(response.url()).pathname)) ||
        (response.request().method() === "PUT" && response.url().includes("/license-offerings/")),
      { timeout: 20_000 }
    );
    await unitDialog.getByRole("button", { name: "Ekle", exact: true }).click();
    expect((await saved).ok(), `birim ekleme ${matchedName}`).toBe(true);
    await expect(unitDialog).toHaveCount(0, { timeout: 15_000 });
    return matchedName;
  }

  if (matchedName && matchedDisabled) {
    await unitDialog.getByRole("button", { name: "İptal" }).click();
    await expect(unitDialog).toHaveCount(0);
    const row = unitRow(leftUnitList(dialog), matchedName);
    await expect(row).toBeVisible({ timeout: 15_000 });
    const assignSaved = page.waitForResponse(
      (response) =>
        response.request().method() === "PUT" && response.url().includes("/license-offerings/"),
      { timeout: 15_000 }
    );
    await row.getByRole("button", { name: "Ekle" }).click();
    expect((await assignSaved).ok()).toBe(true);
    return matchedName;
  }

  await unitDialog.getByRole("button", { name: "+ Yeni Evrensel Birim Ekle" }).click();
  await unitDialog.getByPlaceholder("Ad (örn: Adet)").fill(fallbackName);
  captureCreatedIds(page, (url) => /\/api\/unit-definitions\/?$/.test(new URL(url).pathname), createdUnitDefinitionIds);
  const created = page.waitForResponse(
    (response) =>
      response.request().method() === "POST" && /\/api\/products\/[^/]+\/units\/?$/.test(new URL(response.url()).pathname),
    { timeout: 20_000 }
  );
  await unitDialog.getByRole("button", { name: "Oluştur ve Ekle" }).click();
  const response = await created;
  expect(response.status(), await response.text().catch(() => "")).toBeLessThan(400);
  expect(response.ok(), `birim oluşturma ${fallbackName}`).toBe(true);
  await expect(unitDialog).toHaveCount(0, { timeout: 15_000 });
  return fallbackName;
}

async function fillTierRow(
  dialog: Locator,
  index: number,
  tier: { from: string; to: string; type: string; value: string }
) {
  const row = dialog.locator("table tbody tr").nth(index);
  const numbers = row.locator("input[type=number]");
  await numbers.nth(0).fill(tier.from);
  await numbers.nth(1).fill(tier.to);
  await row.locator("select").selectOption(tier.type);
  await numbers.nth(2).fill(tier.value);
}

async function createTieredRule(
  page: Page,
  dialog: Locator,
  unitName: string,
  tiers: ReadonlyArray<{ from: string; to: string; type: string; value: string }>
): Promise<unknown> {
  const left = leftUnitList(dialog);
  const onRight = rightUnitList(dialog).locator(".pricing-unit-list-item", { hasText: unitName });
  await expect(unitRow(left, unitName).or(onRight.first())).toBeVisible({ timeout: 15_000 });
  if ((await onRight.count()) === 0) {
    const unusedOnPlan = unitRow(left, unitName).getByText("Bu planda kullanılmıyor");
    const assignSaved =
      (await unusedOnPlan.count()) > 0
        ? page.waitForResponse(
            (response) =>
              response.request().method() === "PUT" && response.url().includes("/license-offerings/"),
            { timeout: 15_000 }
          )
        : null;
    await unitRow(left, unitName).getByRole("button", { name: "Ekle" }).click();
    if (assignSaved) expect((await assignSaved).ok()).toBe(true);
  }
  await expect(onRight).toBeVisible();

  const extraOnRight = rightUnitList(dialog).locator(".pricing-unit-list-item").filter({
    hasNotText: unitName,
  });
  while ((await extraOnRight.count()) > 0) {
    await extraOnRight.first().getByRole("button", { name: "Kaldır" }).click();
  }

  await dialog.locator("select.form-select").filter({ hasText: "Kademeli" }).first().selectOption("unit");
  await expect(dialog.getByRole("button", { name: "Kademe ekle" })).toBeVisible();

  for (let index = 0; index < tiers.length; index += 1) {
    await dialog.getByRole("button", { name: "Kademe ekle" }).click();
    await fillTierRow(dialog, index, tiers[index]);
  }

  const saved = page.waitForResponse(
    (response) =>
      response.request().method() === "POST" && response.url().includes("/pricing-rules"),
    { timeout: 20_000 }
  );
  await dialog.getByRole("button", { name: "Kural Ekle" }).click();
  const response = await saved;
  expect(response.status(), await response.text().catch(() => "")).toBeLessThan(400);
  expect(response.ok(), `kural kaydı ${unitName} ${response.status()}`).toBe(true);
  await expect(page.getByText("Fiyatlandırma kuralı eklendi.").first()).toBeVisible({ timeout: 15_000 });
  await expect(dialog).toHaveCount(0);
  return response.request().postDataJSON();
}

async function fetchJson(page: Page, url: string): Promise<unknown> {
  const headers = await authHeaders(page);
  expect(headers, "temizlik / doğrulama için erişim jetonu yok").toBeTruthy();
  const response = await page.request.get(url, { headers: headers as Record<string, string> });
  expect(response.status(), await response.text().catch(() => "")).toBeLessThan(400);
  return response.json();
}

function asRuleList(body: unknown): Array<Record<string, unknown>> {
  if (Array.isArray(body)) return body as Array<Record<string, unknown>>;
  if (body && typeof body === "object" && Array.isArray((body as { items?: unknown[] }).items)) {
    return (body as { items: Array<Record<string, unknown>> }).items;
  }
  return [];
}

function adjustmentOf(rule: Record<string, unknown>) {
  if (rule.priceAdjustment && typeof rule.priceAdjustment === "object") return rule.priceAdjustment;
  if (typeof rule.priceAdjustmentJson === "string") return JSON.parse(rule.priceAdjustmentJson);
  return null;
}

test.describe("Satış planı şablonları, birimler ve kademeli kurallar", () => {
  test.skip(SKIP_WITHOUT_WRITABLE_API, "Gerçekten kayıt yazar; yazılabilir API olmadan atlanır.");
  test.describe.configure({ mode: "serial", timeout: 180_000 });

  let product: CreatedSoftwareProduct | undefined;
  let userUnitName = "";
  let storageUnitName = "";
  const createdUnitDefinitionIds: string[] = [];
  const stamp = Date.now();

  test.afterAll(async ({ browser }) => {
    if (!product) return;
    const context = await browser.newContext({
      storageState: path.join("playwright/.auth/user.json"),
    });
    const page = await context.newPage();
    await page.goto("/");
    await deleteSoftwareProductIfSupported(page, product.id);

    const apiBase = writableApiBase();
    const headers = await authHeaders(page);
    if (apiBase && headers) {
      for (const id of createdUnitDefinitionIds) {
        const removed = await page.request.delete(`${apiBase}/api/unit-definitions/${id}`, { headers });
        if (!removed.ok() && ![401, 403, 404, 405, 409, 501].includes(removed.status())) {
          throw new Error(`birim tanımı silinemedi: ${id} -> ${removed.status()}`);
        }
      }
    }

    await context.close();
  });

  test("dört plan şablonu oluşturulup yenileme sonrası model ve periyot korunur", async ({ page }) => {
    const assertNoWriteError = attachWriteGuard(page);
    product = await createSoftwareProduct(page);
    await openProductPricing(page, product.id);

    for (const template of PLAN_TEMPLATES) {
      await createPlanFromTemplate(page, template.templateTitle, template.name);
      await expect(salesPlanCard(page, template.name)).toBeVisible();
      await expect(salesPlanCard(page, template.name).getByText(template.licenseModelLabel, { exact: true })).toBeVisible();
    }

    await page.goto("/dashboard");
    await openProductPricing(page, product.id);

    for (const template of PLAN_TEMPLATES) {
      const card = salesPlanCard(page, template.name);
      await expect(card).toBeVisible();
      await expect(card.getByText(template.licenseModelLabel, { exact: true })).toBeVisible();

      const settings = await openPlanSettings(page, template.name);
      await expect(settings.getByPlaceholder("Yıllık Abonelik")).toHaveValue(template.name);
      await expect(labeledControl(settings, "Satış modeli")).toHaveValue(String(template.licenseModel));
      if (template.licenseModel === 2) {
        await expect(labeledControl(settings, "Faturalama birimi")).toHaveValue(template.billingPeriodUnit);
        await expect(labeledControl(settings, "Fatura periyodu")).toHaveValue(template.billingPeriodValue);
      } else {
        await expect(settings.locator("label.form-label", { hasText: "Faturalama birimi" })).toHaveCount(0);
      }
      if ("trialDays" in template) {
        await expect(labeledControl(settings, "Deneme süresi")).toHaveValue(template.trialDays);
      }
      await settings.getByRole("button", { name: "İptal" }).click();
      await expect(settings).toHaveCount(0);
    }

    await openPlanRules(page, product.id, "Aylık Plan");
    await expect(page.getByText("Abonelik", { exact: true }).first()).toBeVisible();
    await expect(page.getByText("30 ay periyot")).toBeVisible();
    await page.getByRole("button", { name: "Planlara dön" }).click();

    await salesPlanCard(page, "Yıllık Plan").getByRole("button", { name: "Fiyatlandırma" }).click();
    await expect(page.getByRole("heading", { name: "Yıllık Plan" })).toBeVisible();
    await expect(page.getByText("365 yıl periyot")).toBeVisible();

    assertNoWriteError();
  });

  test("iki birim plana bağımsız atanır; diğer planda listeden kaybolmaz", async ({ page }) => {
    expect(product, "önceki test ürün oluşturamadı").toBeTruthy();
    const assertNoWriteError = attachWriteGuard(page);
    await openPlanRules(page, product!.id, "Aylık Plan");
    const ruleDialog = await openRuleForm(page);

    userUnitName = await addUnitToPlan(
      page,
      ruleDialog,
      USER_UNIT_CANDIDATES,
      `E2E Kullanıcı ${stamp}`,
      createdUnitDefinitionIds
    );
    storageUnitName = await addUnitToPlan(
      page,
      ruleDialog,
      STORAGE_UNIT_CANDIDATES,
      `E2E GB ${stamp}`,
      createdUnitDefinitionIds
    );
    expect(userUnitName).not.toBe(storageUnitName);

    await expect(rightUnitList(ruleDialog).locator(".pricing-unit-list-item", { hasText: userUnitName })).toBeVisible();
    await expect(rightUnitList(ruleDialog).locator(".pricing-unit-list-item", { hasText: storageUnitName })).toBeVisible();
    await closeRuleForm(ruleDialog);

    const monthlyRecheck = await openRuleForm(page);
    await expect(unitRow(leftUnitList(monthlyRecheck), userUnitName)).toBeVisible({ timeout: 15_000 });
    await expect(unitRow(leftUnitList(monthlyRecheck), storageUnitName)).toBeVisible();
    await expect(unitRow(leftUnitList(monthlyRecheck), userUnitName).getByText("Bu planda kullanılmıyor")).toHaveCount(0);
    await expect(unitRow(leftUnitList(monthlyRecheck), storageUnitName).getByText("Bu planda kullanılmıyor")).toHaveCount(0);
    await closeRuleForm(monthlyRecheck);

    await page.getByRole("button", { name: "Planlara dön" }).click();
    await salesPlanCard(page, "Yıllık Plan").getByRole("button", { name: "Fiyatlandırma" }).click();
    await expect(page.getByRole("heading", { name: "Yıllık Plan" })).toBeVisible({ timeout: 15_000 });

    const yearlyDialog = await openRuleForm(page);
    await expect(unitRow(leftUnitList(yearlyDialog), userUnitName)).toBeVisible({ timeout: 15_000 });
    await expect(unitRow(leftUnitList(yearlyDialog), storageUnitName)).toBeVisible();
    await expect(unitRow(leftUnitList(yearlyDialog), userUnitName).getByText("Bu planda kullanılmıyor")).toBeVisible();
    await expect(unitRow(leftUnitList(yearlyDialog), storageUnitName).getByText("Bu planda kullanılmıyor")).toBeVisible();

    const assignSaved = page.waitForResponse(
      (response) =>
        response.request().method() === "PUT" && response.url().includes("/license-offerings/"),
      { timeout: 15_000 }
    );
    await unitRow(leftUnitList(yearlyDialog), userUnitName).getByRole("button", { name: "Ekle" }).click();
    expect((await assignSaved).ok()).toBe(true);
    await expect(rightUnitList(yearlyDialog).locator(".pricing-unit-list-item", { hasText: userUnitName })).toBeVisible();
    await expect(unitRow(leftUnitList(yearlyDialog), storageUnitName).getByText("Bu planda kullanılmıyor")).toBeVisible();
    await closeRuleForm(yearlyDialog);

    await openPlanRules(page, product!.id, "Yıllık Plan");
    const afterReload = await openRuleForm(page);
    await expect(unitRow(leftUnitList(afterReload), storageUnitName).getByText("Bu planda kullanılmıyor")).toBeVisible({
      timeout: 15_000,
    });
    await expect(unitRow(leftUnitList(afterReload), userUnitName).getByText("Bu planda kullanılmıyor")).toHaveCount(0);
    await closeRuleForm(afterReload);

    assertNoWriteError();
  });

  test("abonelik planında iki birim için kademeli kurallar kaydedilir ve yenileme sonrası durur", async ({
    page,
  }) => {
    expect(product, "önceki test ürün oluşturamadı").toBeTruthy();
    expect(userUnitName && storageUnitName, "önceki test birim eklemedi").toBeTruthy();
    const assertNoWriteError = attachWriteGuard(page);

    await openPlanRules(page, product!.id, "Aylık Plan");
    const userRuleDialog = await openRuleForm(page);
    const userPayload = (await createTieredRule(page, userRuleDialog, userUnitName, USER_TIERS)) as {
      productUnitIds?: string[];
      priceAdjustment?: unknown;
    };

    const storageRuleDialog = await openRuleForm(page);
    const storagePayload = (await createTieredRule(page, storageRuleDialog, storageUnitName, STORAGE_TIERS)) as {
      productUnitIds?: string[];
      priceAdjustment?: unknown;
    };

    expect(userPayload.productUnitIds?.length ?? 0).toBeGreaterThanOrEqual(1);
    expect(storagePayload.productUnitIds?.length ?? 0).toBeGreaterThanOrEqual(1);
    expect(userPayload.productUnitIds?.[0]).not.toBe(storagePayload.productUnitIds?.[0]);
    expect(userPayload.priceAdjustment).toMatchObject(EXPECTED_USER_ADJUSTMENT);
    expect(storagePayload.priceAdjustment).toMatchObject(EXPECTED_STORAGE_ADJUSTMENT);

    await expect(page.getByText("Kademeli fiyat kuralı").first()).toBeVisible();
    await expect(page.getByText(userUnitName).first()).toBeVisible();
    await expect(page.getByText(storageUnitName).first()).toBeVisible();
    await expect(page.getByText("2 kademe").first()).toBeVisible();

    await page.goto("/product-info/general?productId=" + product!.id);
    await openPlanRules(page, product!.id, "Aylık Plan");
    await expect(page.getByText("Kademeli fiyat kuralı").first()).toBeVisible({ timeout: 15_000 });
    await expect(page.getByText(userUnitName).first()).toBeVisible();
    await expect(page.getByText(storageUnitName).first()).toBeVisible();

    const apiBase = writableApiBase();
    expect(apiBase, "kural doğrulaması için E2E_API_BASE_URL yok").toBeTruthy();
    const persisted = asRuleList(await fetchJson(page, `${apiBase}/api/products/${product!.id}/pricing-rules`));
    expect(persisted.length).toBeGreaterThanOrEqual(2);

    const byUnit = (unitId: string) =>
      persisted.find((rule) => {
        const ids = (rule.productUnitIds as string[] | undefined) ?? (rule.productUnitId ? [rule.productUnitId] : []);
        return ids.includes(unitId);
      });

    const userRule = byUnit(userPayload.productUnitIds![0]);
    const storageRule = byUnit(storagePayload.productUnitIds![0]);
    expect(userRule, "kullanıcı kuralı yenileme sonrası yok").toBeTruthy();
    expect(storageRule, "GB kuralı yenileme sonrası yok").toBeTruthy();

    const userAdjustment = adjustmentOf(userRule as Record<string, unknown>) as {
      mode?: string;
      applyOn?: string;
      tiers?: unknown[];
    };
    const storageAdjustment = adjustmentOf(storageRule as Record<string, unknown>) as {
      mode?: string;
      applyOn?: string;
      tiers?: unknown[];
    };
    expect(userAdjustment?.tiers).toEqual(EXPECTED_USER_ADJUSTMENT.tiers);
    expect(storageAdjustment?.tiers).toEqual(EXPECTED_STORAGE_ADJUSTMENT.tiers);
    if (userAdjustment?.mode) expect(userAdjustment.mode).toBe("unit");
    if (storageAdjustment?.mode) expect(storageAdjustment.mode).toBe("unit");

    await page
      .locator(".pricing-sortable-item")
      .filter({ hasText: userUnitName })
      .getByRole("button", { name: "Düzenle" })
      .click();
    const editDialog = dialogByTitle(page, "Kuralı Güncelle");
    await expect(editDialog).toBeVisible();
    await expect(rightUnitList(editDialog).locator(".pricing-unit-list-item", { hasText: userUnitName })).toBeVisible();
    const firstRow = editDialog.locator("table tbody tr").nth(0);
    await expect(firstRow.locator("input[type=number]").nth(0)).toHaveValue("1");
    await expect(firstRow.locator("input[type=number]").nth(1)).toHaveValue("10");
    await expect(firstRow.locator("select")).toHaveValue("fixed");
    await expect(firstRow.locator("input[type=number]").nth(2)).toHaveValue("50");
    const secondRow = editDialog.locator("table tbody tr").nth(1);
    await expect(secondRow.locator("input[type=number]").nth(0)).toHaveValue("11");
    await expect(secondRow.locator("input[type=number]").nth(1)).toHaveValue("");
    await expect(secondRow.locator("select")).toHaveValue("fixed");
    await expect(secondRow.locator("input[type=number]").nth(2)).toHaveValue("40");
    await editDialog.getByRole("button", { name: "İptal" }).click();

    assertNoWriteError();
  });
});
