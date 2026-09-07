import { test, expect } from "@playwright/test";
import { SKIP_WITHOUT_SHARED_DATA } from "../utils";

/**
 * Hata #4: Türkçe karakter desteği olmayan arama.
 *
 * Veritabanı harmanlaması Turkish_CI_AS olduğundan "insaat" terimi "İNŞAAT"
 * kaydını bulamıyordu. Sunucu tarafı artık Latin1_General_CI_AI harmanlaması
 * kullanıyor - bu test o düzeltmenin API üzerinden gerçekten çalıştığını sınar.
 *
 * Salt okunur. Fikstür paylaşımlı dev DB'sindeki "İNŞAAT 360" ürünü.
 */
const PRODUCT_NAME = "İNŞAAT 360";

test.describe("Ürün aramasında Türkçe karakter desteği", () => {
  // Aksana duyarsız arama sunucu tarafında; düzeltme deploy edilmemiş bir
  // API'ye karşı koşarsa bu testler kırmızı yanar - beklenen davranış budur.
  test.skip(SKIP_WITHOUT_SHARED_DATA, "Fikstür paylaşımlı dev DB'sindeki İNŞAAT 360 ürünü.");

  const searchTerms = [
    { term: "insaat", aciklama: "Türkçe karakter yazmadan" },
    { term: "İNŞAAT", aciklama: "tam Türkçe yazımla" },
    { term: "INSAAT", aciklama: "ASCII büyük harfle" },
    { term: "inşaat", aciklama: "karışık yazımla" },
  ];

  for (const { term, aciklama } of searchTerms) {
    test(`${aciklama} aranınca ürün bulunuyor: "${term}"`, async ({ page }) => {
      await page.goto("/products");
      await expect(page.getByRole("heading", { name: "Ürünler" }).first()).toBeVisible({ timeout: 20_000 });

      await page.getByPlaceholder("Kod veya ad ara…").fill(term);
      await expect(page.getByText(PRODUCT_NAME).first()).toBeVisible({ timeout: 15_000 });
    });
  }

  test("eşleşmeyen terimde sonuç dönmüyor", async ({ page }) => {
    await page.goto("/products");
    await page.getByPlaceholder("Kod veya ad ara…").fill("kesinlikle-boyle-bir-urun-yok");
    await expect(page.getByText(PRODUCT_NAME)).toHaveCount(0);
  });

  test("arama terimindeki % joker karakteri tüm kayıtları döndürmüyor", async ({ page }) => {
    await page.goto("/products");
    // LIKE kaçışı olmadan "%" tüm ürünleri döndürüyordu.
    await page.getByPlaceholder("Kod veya ad ara…").fill("%");
    await expect(page.getByText(PRODUCT_NAME)).toHaveCount(0);
  });
});
