import { test, expect } from "@playwright/test";

// Kullanıcı bildirimi (hata #2 ve #3):
//  - "Plan fiyatlandırma sayfasında hangi planda olduğumu göremiyorum"
//  - "Bir plana birim ekliyorum, sonra başka bir plana o birimi ekleyemiyorum;
//     birim ürüne atanmış olmalı ve diğer planda direkt solda görünmeli"
//
// Test SALT OKUNUR: kural formunu açıp soldaki birim listesini doğrular, hiçbir
// şey kaydetmez. Bu yüzden paylaşımlı dev DB'ye karşı da güvenle çalışır.
//
// Fikstür, paylaşımlı dev DB'sindeki İKNET ürünüdür: ürün seviyesinde iki birim
// ("Kullanıcı Başına", "GB") tanımlı; bunlar sırasıyla "Aylık Plan" ve "Yıllık
// Plan"a atanmış, "Tek Seferlik Lisans" planına hiç birim atanmamış durumda.
// Düzeltmeden önce bu plandaki liste boştu ("Plana eklenmiş birim yok").
const PRODUCT_ID = "013183E9-0866-4102-BA5C-3B0B5C4FDDB0";
const PLAN_WITHOUT_UNITS = "Tek Seferlik Lisans";
const PRODUCT_UNITS = ["Kullanıcı Başına", "GB"];

test.describe("Satış planı fiyatlandırması - plan başlığı ve ürün birimleri", () => {
  test.skip(
    Boolean(process.env.E2E_API_BASE_URL),
    "Fikstür paylaşımlı dev DB'sindeki İKNET ürünü; izole/boş CI DB'sinde yok."
  );

  test.beforeEach(async ({ page }) => {
    await page.goto(`/pricing/product-pricing?productId=${PRODUCT_ID}`);
    await expect(page.getByRole("heading", { name: "Satış Planları" })).toBeVisible({ timeout: 20_000 });
  });

  test("kural ekranı hangi planda olunduğunu başlıkta gösteriyor", async ({ page }) => {
    const planCard = page.locator(".card", { hasText: PLAN_WITHOUT_UNITS }).last();
    await planCard.getByRole("button", { name: "Fiyatlandırma" }).click();

    // Hata #2: kural ekranında plan adı hiçbir yerde yazmıyordu.
    await expect(page.getByText("Fiyatlandırma kuralları", { exact: true })).toBeVisible();
    await expect(page.getByRole("heading", { name: PLAN_WITHOUT_UNITS })).toBeVisible();
    await expect(page.getByRole("button", { name: "Plan ayarları" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Dinamik Fiyatlandırma Kuralları" })).toBeVisible();
  });

  test("birimi olmayan planda ürünün bütün birimleri solda listeleniyor", async ({ page }) => {
    const planCard = page.locator(".card", { hasText: PLAN_WITHOUT_UNITS }).last();
    await planCard.getByRole("button", { name: "Fiyatlandırma" }).click();
    await expect(page.getByRole("heading", { name: PLAN_WITHOUT_UNITS })).toBeVisible();

    await page.getByRole("button", { name: "Yeni Kural" }).click();
    await expect(page.getByText("1. Adım — Birimler")).toBeVisible();

    // Hata #3: bu plana hiç birim atanmamış olduğundan liste tamamen boştu.
    const unitList = page.locator(".pricing-unit-list").first();
    await expect(unitList.getByText("Ürüne eklenmiş birim yok.")).toHaveCount(0);
    for (const unitName of PRODUCT_UNITS) {
      await expect(unitList.getByText(unitName, { exact: false })).toBeVisible();
    }

    // Başka planda kullanılan birimler, bu planda kullanılmadıkları için işaretli.
    await expect(unitList.getByText("Bu planda kullanılmıyor").first()).toBeVisible();
  });

  test("birim ekleme penceresi ürüne ekli birimleri gizlemiyor, devre dışı gösteriyor", async ({ page }) => {
    const planCard = page.locator(".card", { hasText: PLAN_WITHOUT_UNITS }).last();
    await planCard.getByRole("button", { name: "Fiyatlandırma" }).click();
    await page.getByRole("button", { name: "Yeni Kural" }).click();
    await page.getByRole("button", { name: "Yeni birim ekle" }).click();

    // "Birim Ekle" ifadesi arkadaki "Dinamik Kural Ekle" modalıyla da eşleşiyor;
    // birim penceresini kendine özgü "Evrensel Birim" etiketiyle seçiyoruz.
    const dialog = page.getByRole("dialog").filter({ hasText: "Evrensel Birim" });
    await expect(dialog).toBeVisible();

    // Hata #3'ün ikinci yüzü: ürüne ekli birimler <option> olarak hiç
    // render edilmiyordu; artık "ürüne ekli" etiketiyle devre dışı görünüyor.
    const existingOption = dialog.locator("option", { hasText: "ürüne ekli" }).first();
    await expect(existingOption).toHaveCount(1);
    await expect(existingOption).toBeDisabled();
  });
});
