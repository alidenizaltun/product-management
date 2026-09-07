import { test, expect } from "@playwright/test";
import { SKIP_WITHOUT_WRITABLE_API } from "../utils";

/**
 * Hata #1: Yeni eklenen kategori, ürün formundaki kategori seçim kutusunda
 * görünmüyordu.
 *
 * Kategori mutation'ı ["catalog","categories"] cache'ini tazeliyor ama seçim
 * kutusu ["lookups","categories"] sorgusunu okuyor ve o sorgunun staleTime'ı
 * 5 dakika.
 *
 * Hatanın ortaya çıkması iki şarta bağlı, test ikisini de kuruyor:
 *  - Lookup sorgusu kategori eklenmeden ÖNCE cache'e girmiş olmalı.
 *  - Sonrasında sayfa yenilenmemeli; page.goto() tam yenileme yapıp cache'i
 *    sıfırlar ve hatayı gizler. Bu yüzden gezinme menü üzerinden yapılıyor.
 *
 * Bu test kayıt OLUŞTURUR; afterEach kendi oluşturduğu kategorileri siler.
 */

// Fikstür: paylaşımlı dev DB'sinde zaten kategorisi olan bir ürün. Kategorisi
// olması şart - CategoryTreeSelect ancak var olan bir satır için mount olur ve
// lookup sorgusu ancak o zaman cache'e girer.
const PRODUCT_ID = "178AC852-2308-47DE-A2D9-ED806BF9EC2D";
const PRODUCT_SEARCH = "İNŞAAT 360";
const CATEGORY_PREFIX = "E2E Lookup Testi";

test.describe("Yeni kategori ürün formunda anında görünüyor", () => {
  test.skip(SKIP_WITHOUT_WRITABLE_API, "Gerçekten kayıt yazar ve paylaşımlı dev DB fikstürüne dayanır.");

  let createdCategoryIds: string[] = [];
  test.beforeEach(() => {
    createdCategoryIds = [];
  });

  test("kategori eklenince ürün sınıflandırma formunda listeleniyor", async ({ page }) => {
    const categoryName = `${CATEGORY_PREFIX} ${Date.now()}`;
    const lookupCalls: string[] = [];
    page.on("request", (request) => {
      if (request.url().includes("/api/lookups/categories")) lookupCalls.push(request.url());
    });

    // Oluşturulan kaydın id'sini yakala; temizlik listeden aramaya çalışmak
    // yerine doğrudan bu id ile yapılıyor (liste sunucu tarafında sayfalandığı
    // için yeni kayıt ilk sayfada olmayabiliyor).
    page.on("response", async (response) => {
      const request = response.request();
      if (request.method() !== "POST" || !request.url().endsWith("/api/catalog/categories")) return;
      if (!response.ok()) return;
      const body = await response.json().catch(() => null);
      if (body?.id) createdCategoryIds.push(body.id as string);
    });

    // 1) Ürün formunu aç: mevcut kategori satırları seçim kutusunu mount eder,
    //    böylece lookup sorgusu cache'e girer. Forma dokunmuyoruz ki
    //    kaydedilmemiş değişiklik koruması gezinmeyi engellemesin.
    await page.goto(`/product-info/classification?productId=${PRODUCT_ID}`);
    await expect(page.getByRole("button", { name: "Kategori Ekle" }).first()).toBeVisible({ timeout: 20_000 });
    await page.waitForLoadState("networkidle", { timeout: 20_000 }).catch(() => {});
    expect(lookupCalls.length, "kategori lookup'ı cache'e girmeliydi").toBeGreaterThan(0);
    const callsBeforeCreate = lookupCalls.length;

    // 2) Menü üzerinden (yenileme YOK) kategori ekleme sayfasına git ve kaydet.
    await page.getByRole("link", { name: "Katalog Tanımları", exact: false }).first().click();
    await page.getByRole("link", { name: "Kategori Tanımları" }).click();
    await expect(page).toHaveURL(/\/definitions\/categories$/, { timeout: 15_000 });

    await page.getByRole("button", { name: "Yeni Kategori" }).first().click();
    await expect(page).toHaveURL(/\/definitions\/categories\/new$/, { timeout: 15_000 });
    await page.getByLabel("Ad").fill(categoryName);
    await page.getByRole("button", { name: "Kaydet" }).click();

    // Hata #5: her formda kaydetme bildirimi olmalı.
    await expect(page.getByText("Kategori oluşturuldu.")).toBeVisible({ timeout: 15_000 });
    await expect(page).toHaveURL(/\/definitions\/categories$/, { timeout: 15_000 });

    // 3) Yine menü üzerinden ürün sınıflandırma formuna dön ve ürünü seç.
    await page.getByRole("link", { name: "Ürün Bilgileri", exact: false }).first().click();
    await page.getByRole("link", { name: "Sınıflandırma" }).click();
    await expect(page).toHaveURL(/\/product-info\/classification/, { timeout: 15_000 });
    await page.getByPlaceholder(/ürün adı veya kodu/i).fill(PRODUCT_SEARCH);
    await page.getByText(PRODUCT_SEARCH, { exact: false }).last().click();
    await expect(page.getByRole("button", { name: "Kategori Ekle" }).first()).toBeVisible({ timeout: 20_000 });
    await page.waitForLoadState("networkidle", { timeout: 20_000 }).catch(() => {});

    // 4) Boş bir kategori satırı ekleyip seçeneklerde ara.
    await page.getByRole("button", { name: "Kategori Ekle" }).first().click();
    const emptySelect = page.getByText("Kategori seçin", { exact: true }).first();
    await expect(emptySelect).toBeVisible({ timeout: 15_000 });
    await emptySelect.scrollIntoViewIfNeeded();
    await emptySelect.click({ force: true });
    await page.keyboard.type(CATEGORY_PREFIX);

    // Düzeltmeden önce yeni kategori burada yoktu; lookup 5 dakika taze sayılıp
    // hiç yeniden çekilmiyordu.
    await expect(page.getByText(categoryName).first()).toBeVisible({ timeout: 15_000 });
    expect(
      lookupCalls.length,
      `lookup yeniden çekilmeliydi (önce: ${callsBeforeCreate}, sonra: ${lookupCalls.length})`
    ).toBeGreaterThan(callsBeforeCreate);
  });

  test.afterEach(async ({ page }) => {
    // Temizlik API üzerinden: token localStorage'da tutulduğu için isteğe
    // elle ekleniyor. UI'dan silmek listenin sayfalanmasına takılıyordu.
    const token = await page.evaluate(() => localStorage.getItem("pm_access_token") ?? sessionStorage.getItem("pm_access_token"));
    const apiBase = (process.env.E2E_API_BASE_URL ?? "").replace(/\/$/, "");

    for (const id of createdCategoryIds) {
      const response = await page.request.delete(`${apiBase}/api/catalog/categories/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      expect(response.ok(), `temizlik başarısız: ${id} -> ${response.status()}`).toBe(true);
    }
  });
});
