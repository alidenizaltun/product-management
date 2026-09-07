import { test, expect, type Page } from "@playwright/test";
import { SKIP_WITHOUT_WRITABLE_API } from "../utils";

/**
 * Hata #3'ün yazma yolu: bir plana eklenen birimin gerçekten kaydedildiğini ve
 * ürünün diğer planlarında da kullanılabilir olduğunu uçtan uca doğrular.
 *
 * Bu test KAYIT DEĞİŞTİRİR (plan-birim ataması); sonunda atamayı UI'daki
 * "sadece bu plandan kaldır" akışıyla geri alır.
 *
 * Fikstür: İKNET ürünü - ürün seviyesinde "Kullanıcı Başına" ve "GB" birimleri
 * var; "Tek Seferlik Lisans" ve "Deneme Planı" planlarına hiç birim atanmamış.
 * Her iki planın da temel fiyatı 0, dolayısıyla kaydetme yan etkisi yok.
 *
 * Yazma hedefi bilerek "Deneme Planı": salt okunur plan-pricing-units testi
 * "Tek Seferlik Lisans"ın birim rozetlerini doğruluyor, aynı planı burada
 * değiştirmek o testi paralel koşuda bozardı.
 */
const PRODUCT_ID = "013183E9-0866-4102-BA5C-3B0B5C4FDDB0";
const PLAN_A = "Deneme Planı";
const PLAN_B = "Tek Seferlik Lisans";
const UNIT = "GB";

/** Fiyatlandırma sayfasını açar ve verilen planın kural ekranına girer. */
async function openPlanRules(page: Page, planName: string) {
  await page.goto(`/pricing/product-pricing?productId=${PRODUCT_ID}`);
  await expect(page.getByRole("heading", { name: "Satış Planları" })).toBeVisible({ timeout: 20_000 });
  const planCard = page.locator(".card", { hasText: planName }).last();
  await planCard.getByRole("button", { name: "Fiyatlandırma" }).click();
  await expect(page.getByRole("heading", { name: planName })).toBeVisible({ timeout: 15_000 });
}

/** Kural formunu açar ve soldaki "Ürünün birimleri" listesini döner. */
async function openRuleForm(page: Page) {
  await page.getByRole("button", { name: "Yeni Kural" }).click();
  await expect(page.getByText("1. Adım — Birimler")).toBeVisible({ timeout: 15_000 });

  const unitList = page.locator(".pricing-unit-list").first();
  // Birimler ürün detayı yüklendikten sonra render oluyor. count() beklemediği
  // için liste dolmadan sayılırsa yanlışlıkla "birim yok" sonucu çıkıyor.
  await expect(unitList.locator(".pricing-unit-list-item").first()).toBeVisible({ timeout: 15_000 });
  return unitList;
}

const unitRow = (list: ReturnType<Page["locator"]>, name: string) =>
  list.locator(".pricing-unit-list-item", { hasText: name }).first();

/**
 * Birimi verilen plandan kaldırır (üründe kalmaya devam eder). Zaten atanmamışsa
 * hiçbir şey yapmaz. Hem başlangıç durumunu garantilemek hem de test sonrası
 * temizlik için kullanılıyor - paylaşımlı DB'de test kendi kendini toparlamalı.
 */
async function ensureUnitNotInPlan(page: Page, planName: string, unitName: string) {
  await openPlanRules(page, planName);
  const unitList = await openRuleForm(page);
  const removeFromPlan = unitRow(unitList, unitName).getByTitle("Sadece bu plandan kaldır");
  if ((await removeFromPlan.count()) === 0) return;

  await removeFromPlan.click();
  const removeSaved = page.waitForResponse(
    (response) => response.request().method() === "PUT" && response.url().includes("/license-offerings/"),
    { timeout: 15_000 }
  );
  await page.getByRole("button", { name: "Kaldır", exact: true }).last().click();
  expect((await removeSaved).ok()).toBe(true);
  await expect(page.getByText("Birim bu plandan kaldırıldı.")).toBeVisible({ timeout: 15_000 });
}

// Her iki test de aynı plan-birim atamasını değiştiriyor; paralel koşarlarsa
// birbirlerinin başlangıç durumunu bozarlar.
test.describe.configure({ mode: "serial" });

test.describe("Birim ataması planlar arasında paylaşılıyor", () => {
  test.skip(SKIP_WITHOUT_WRITABLE_API, "Gerçekten kayıt yazar ve paylaşımlı dev DB fikstürüne dayanır.");

  // Paylaşımlı DB'de önceki koşulardan kalıntı olabilir; başlangıç durumunu garantile.
  test.beforeEach(async ({ page }) => {
    await ensureUnitNotInPlan(page, PLAN_A, UNIT);
  });

  test("bir plana eklenen birim kaydediliyor ve diğer planda da listeleniyor", async ({ page }) => {
    // 1) A planı: birim henüz bu planda kullanılmıyor.
    await openPlanRules(page, PLAN_A);
    let unitList = await openRuleForm(page);
    await expect(unitRow(unitList, UNIT)).toBeVisible();
    await expect(unitRow(unitList, UNIT).getByText("Bu planda kullanılmıyor")).toBeVisible();

    // 2) Kurala ekle: bu hem kural kapsamına alır hem de plana atar (backend'e yazar).
    //    Atama isteği tamamlanmadan gezinilirse istek iptal olur, o yüzden beklenir.
    const savePlanScope = page.waitForResponse(
      (response) =>
        response.request().method() === "PUT" && response.url().includes("/license-offerings/"),
      { timeout: 15_000 }
    );
    await unitRow(unitList, UNIT).getByRole("button", { name: "Ekle" }).click();
    expect((await savePlanScope).ok()).toBe(true);

    // Birim sağdaki "kuralın geçerli olduğu birimler" listesine geçmeli.
    const ruleUnitList = page.locator(".pricing-unit-list").last();
    await expect(ruleUnitList.locator(".pricing-unit-list-item", { hasText: UNIT }).first()).toBeVisible({
      timeout: 15_000,
    });

    // 3) Sayfayı tazeleyip atamanın gerçekten kaydedildiğini doğrula.
    await openPlanRules(page, PLAN_A);
    unitList = await openRuleForm(page);
    await expect(unitRow(unitList, UNIT)).toBeVisible();
    await expect(unitRow(unitList, UNIT).getByText("Bu planda kullanılmıyor")).toHaveCount(0);

    // 4) Hatanın özü: birim ürün seviyesinde olduğu için DİĞER planda da
    //    doğrudan solda listelenmeli. Düzeltmeden önce bu liste boştu.
    await openPlanRules(page, PLAN_B);
    const otherPlanList = await openRuleForm(page);
    await expect(otherPlanList.locator(".pricing-unit-list-item", { hasText: UNIT }).first()).toBeVisible({
      timeout: 15_000,
    });
    await expect(otherPlanList.locator(".pricing-unit-list-item", { hasText: "Kullanıcı Başına" }).first()).toBeVisible();
  });

  test("plandaki son birim gerçekten kaldırılabiliyor", async ({ page }) => {
    // Birimi plana ekle.
    await openPlanRules(page, PLAN_A);
    const unitList = await openRuleForm(page);
    const assignSaved = page.waitForResponse(
      (response) => response.request().method() === "PUT" && response.url().includes("/license-offerings/"),
      { timeout: 15_000 }
    );
    await unitRow(unitList, UNIT).getByRole("button", { name: "Ekle" }).click();
    expect((await assignSaved).ok()).toBe(true);

    // Tek birimi kaldır. buildOfferingPayload boş listede eski tekil
    // productUnitId alanına geri düşüp kaldırılan birimi diriltiyordu; ayrıca
    // boş dizi undefined olarak gönderilince backend atamalara hiç dokunmuyordu.
    await ensureUnitNotInPlan(page, PLAN_A, UNIT);

    // Yenilemeden sonra da gitmiş olmalı.
    await openPlanRules(page, PLAN_A);
    const afterRemoval = await openRuleForm(page);
    await expect(unitRow(afterRemoval, UNIT).getByText("Bu planda kullanılmıyor")).toBeVisible({ timeout: 15_000 });
  });

  test.afterEach(async ({ page }) => {
    await ensureUnitNotInPlan(page, PLAN_A, UNIT);
  });
});
