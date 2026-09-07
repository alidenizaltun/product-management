/**
 * Türkçe karakterlere duyarsız arama yardımcıları.
 *
 * Kullanıcı arama kutusuna "urun", "sirket" ya da "cozum" yazdığında "Ürün",
 * "Şirket" ve "Çözüm" kayıtlarının da eşleşmesi beklenir. JavaScript'in
 * varsayılan `toLowerCase()`/`includes()` ikilisi bunu yapmaz; ayrıca noktalı
 * "İ" harfi `toLowerCase()` ile "i̇" (i + birleşen nokta) hâline gelip
 * karşılaştırmayı bozar.
 *
 * Bu yüzden metin önce ASCII karşılıklarına katlanır, sonra karşılaştırılır.
 * Sunucu tarafındaki karşılığı, arama SQL'lerindeki Latin1_General_CI_AI
 * harmanlamasıdır (bkz. ProductOperationsRepository.SearchCollation).
 */

const FOLDED_CHARS: Record<string, string> = {
  ı: "i", İ: "i", I: "i",
  ş: "s", Ş: "s",
  ğ: "g", Ğ: "g",
  ü: "u", Ü: "u",
  ö: "o", Ö: "o",
  ç: "c", Ç: "c",
  â: "a", Â: "a",
  î: "i", Î: "i",
  û: "u", Û: "u",
};

/** Metni aksansız, küçük harfli ASCII karşılığına katlar. */
export const foldForSearch = (value: string | null | undefined): string =>
  (value ?? "")
    .replace(/./gu, (char) => FOLDED_CHARS[char] ?? char)
    // Kalan aksanlı harfler (é, ñ ...) için genel diyakritik temizliği.
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

/**
 * `haystack` içinde `needle` geçiyor mu — Türkçe karakter farkını yok sayarak.
 * Boş arama terimi her zaman eşleşir.
 */
export const matchesSearch = (haystack: string | null | undefined, needle: string): boolean => {
  const term = foldForSearch(needle).trim();
  if (!term) return true;
  return foldForSearch(haystack).includes(term);
};

/** Verilen alanlardan herhangi biri arama terimiyle eşleşiyor mu. */
export const matchesAnySearch = (values: (string | null | undefined)[], needle: string): boolean => {
  const term = foldForSearch(needle).trim();
  if (!term) return true;
  return values.some((value) => foldForSearch(value).includes(term));
};
