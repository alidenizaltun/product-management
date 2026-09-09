import { test, expect, type Page } from "@playwright/test";
import { SKIP_WITHOUT_SHARED_DATA } from "../utils";

/**
 * Açılır seçim menüleri, içinde bulundukları kartın yığılma bağlamından
 * çıkamadığı için sayfa altındaki sticky aksiyon çubuğunun (z-index 1020) ve
 * komşu panellerin altında kalıyordu.
 *
 * Test görsel değil davranışsal: menü açıldıktan sonra bir seçeneğin tam
 * ortasındaki noktada gerçekten hangi elemanın olduğuna bakılıyor. Menü başka
 * bir şeyin altında kalıyorsa o noktada menü dışı bir eleman döner.
 *
 * Salt okunur - hiçbir kayıt oluşturmaz.
 */
const PRODUCT_ID = "178AC852-2308-47DE-A2D9-ED806BF9EC2D";

// react-select emotion sinifi "css-<hash>-menu"/"-option" seklinde uretiyor.
// Sadece "-menu" aramak sidebar'in "nk-menu" siniflarini da yakaliyor, o yuzden
// "css-" on ekiyle birlikte esletiliyor.
const MENU_SELECTOR = ".react-select__menu, [class*='css-'][class*='-menu']";
const OPTION_SELECTOR = ".react-select__option, [class*='css-'][class*='-option']";

/**
 * Açık menünün merkezindeki noktada gerçekte hangi eleman var? Seçenek varsa
 * ilk seçeneğin, yoksa (liste boşsa) menü kabının merkezine bakılır.
 */
async function topElementAtFirstOption(page: Page) {
  const option = page.locator(OPTION_SELECTOR).first();
  const menu = page.locator(MENU_SELECTOR).first();

  const target = (await option.count()) > 0 ? option : menu;
  await expect(target).toBeVisible({ timeout: 10_000 });

  const box = await target.boundingBox();
  expect(box, "menü ekranda konumlanmalı").not.toBeNull();

  return page.evaluate(
    ({ x, y, menuSelector }) => {
      const el = document.elementFromPoint(x, y);
      if (!el) return { covered: true, tag: "yok", text: "" };

      const insideMenu = Boolean(el.closest(menuSelector));
      return {
        covered: !insideMenu,
        tag: el.tagName.toLowerCase(),
        text: (el.textContent ?? "").trim().slice(0, 80),
      };
    },
    { x: box!.x + box!.width / 2, y: box!.y + box!.height / 2, menuSelector: MENU_SELECTOR }
  );
}

test.describe("Açılır seçim menüleri üstte kalıyor", () => {
  test.skip(SKIP_WITHOUT_SHARED_DATA, "Fikstür paylaşımlı dev DB'sindeki İNŞAAT 360 ürünü.");

  test("sınıflandırma sayfasında özellik seçici sticky çubuğun altında kalmıyor", async ({ page }) => {
    await page.goto(`/product-info/classification?productId=${PRODUCT_ID}`);
    await expect(page.getByRole("button", { name: "Kategori Ekle" }).first()).toBeVisible({ timeout: 20_000 });
    await page.waitForLoadState("networkidle", { timeout: 20_000 }).catch(() => {});

    // Sticky aksiyon çubuğunun görünür olduğu bir noktada menüyü aç.
    const combo = page.locator('input[role="combobox"]').last();
    await combo.scrollIntoViewIfNeeded();
    await combo.click();

    const hit = await topElementAtFirstOption(page);
    expect(hit.covered, `menü şunun altında kalıyor: <${hit.tag}> "${hit.text}"`).toBe(false);
  });

  test("bölgeler sayfasında bölge seçici sticky çubuğun altında kalmıyor", async ({ page }) => {
    await page.goto(`/product-info/regions?productId=${PRODUCT_ID}`);
    await expect(page.getByRole("button", { name: "Bölge Ekle" })).toBeVisible({ timeout: 20_000 });
    await page.waitForLoadState("networkidle", { timeout: 20_000 }).catch(() => {});

    await page.getByRole("button", { name: "Bölge Ekle" }).click();
    const combo = page.locator('input[role="combobox"]').last();
    await combo.scrollIntoViewIfNeeded();
    await combo.click();

    const hit = await topElementAtFirstOption(page);
    expect(hit.covered, `menü şunun altında kalıyor: <${hit.tag}> "${hit.text}"`).toBe(false);
  });

  test("modal içindeki seçici modal gövdesinin altında kalmıyor", async ({ page }) => {
    // Aynı seçiciler reactstrap modal'larında da kullanılıyor; body'ye
    // portal'lanan menünün modal'ın (z-index 1055) üstünde kalması gerekiyor.
    await page.goto("/pricing/product-pricing?productId=013183E9-0866-4102-BA5C-3B0B5C4FDDB0");
    await expect(page.getByRole("heading", { name: "Satış Planları" })).toBeVisible({ timeout: 20_000 });
    await page.locator(".sales-plan-card", { hasText: "Aylık Plan" }).getByRole("button", { name: "Fiyatlandırma" }).click();
    await page.getByRole("button", { name: "Şablondan Ekle" }).click();
    await expect(page.getByText("Şablondan Kural Ekle")).toBeVisible({ timeout: 15_000 });

    const combo = page.locator('input[role="combobox"]').last();
    await expect(combo).toBeVisible({ timeout: 15_000 });
    await combo.click();

    const hit = await topElementAtFirstOption(page);
    expect(hit.covered, `menü şunun altında kalıyor: <${hit.tag}> "${hit.text}"`).toBe(false);
  });

});
