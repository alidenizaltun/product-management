import { describe, expect, it } from "vitest";
import { foldForSearch, matchesAnySearch, matchesSearch } from "@/utils/turkishSearch";

describe("turkishSearch", () => {
  it("Türkçe harfleri ASCII karşılığına katlar", () => {
    expect(foldForSearch("Şirket Çözümü")).toBe("sirket cozumu");
    expect(foldForSearch("İNŞAAT")).toBe("insaat");
    expect(foldForSearch("Ürün Ağırlığı")).toBe("urun agirligi");
    // Noktasız "ı" ve noktalı "İ" aynı harfe iner.
    expect(foldForSearch("Iğdır")).toBe(foldForSearch("ığdır"));
  });

  it("Türkçe karakter yazılmadan da eşleşir", () => {
    expect(matchesSearch("İNŞAAT 360", "insaat")).toBe(true);
    expect(matchesSearch("Yapay Zekâ Destekli", "yapay zeka")).toBe(true);
    expect(matchesSearch("İnsan Kaynakları", "kaynaklari")).toBe(true);
    expect(matchesSearch("Şirket Çözümü", "SIRKET")).toBe(true);
  });

  it("Türkçe karakterle yazılan arama da eşleşir", () => {
    expect(matchesSearch("İNŞAAT 360", "İnşaat")).toBe(true);
    expect(matchesSearch("Kullanıcı Başına", "başına")).toBe(true);
  });

  it("eşleşmeyen terimde false döner", () => {
    expect(matchesSearch("İNŞAAT 360", "cozum")).toBe(false);
    expect(matchesSearch(null, "urun")).toBe(false);
  });

  it("boş arama terimi her zaman eşleşir", () => {
    expect(matchesSearch("herhangi bir metin", "")).toBe(true);
    expect(matchesSearch("herhangi bir metin", "   ")).toBe(true);
  });

  it("matchesAnySearch alanlardan herhangi birinde arar", () => {
    expect(matchesAnySearch(["Kullanıcı Başına", "KULLANICI_BASINA"], "kullanici")).toBe(true);
    expect(matchesAnySearch(["GB", "GB"], "kullanici")).toBe(false);
    expect(matchesAnySearch([null, undefined, "Çözüm"], "cozum")).toBe(true);
  });
});
