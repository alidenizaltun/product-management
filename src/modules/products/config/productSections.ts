/**
 * Ürüne bağlı sabit sayfaların tek kaynağı.
 *
 * Sol menü, rota tanımları, Ürün Özeti kısayolları ve her sayfanın Ürün Seçici
 * filtresi bu listeden üretilir; böylece menü, rota ve tip filtreleri zamanla
 * birbirinden kopmaz.
 *
 * Gruplar menüdeki yerleşimi belirler:
 * - `product-info` → "Ürün Bilgileri" menüsü (tüm ürün tipleri)
 * - `pricing`      → "Fiyatlandırma" menüsü (tüm tipler için ortak sayfa)
 * - `physical` / `software` → "İşlemler" menüsünde ürün tipi başlıkları
 */

/** 1=Fiziksel, 2=Yazılım, 3=Hizmet, 4=Abonelik */
export type ProductKind = 1 | 2 | 3 | 4;

export const ALL_PRODUCT_KINDS: ProductKind[] = [1, 2, 3, 4];

export type ProductSectionKey =
    | "general"
    | "classification"
    | "media"
    | "advanced"
    | "variants"
    | "inventory-supply"
    | "pricing"
    | "modules";

export type ProductSectionGroup = "product-info" | "physical" | "software" | "pricing";

export interface ProductSectionConfig {
    key: ProductSectionKey;
    /** Menüde ve sayfa başlığında görünen ad */
    label: string;
    /** Sayfanın sabit rotası; ürün `?productId=` ile taşınır */
    path: string;
    icon: string;
    description: string;
    group: ProductSectionGroup;
    /** Ürün Seçici'de listelenecek ürün tipleri */
    allowedKinds: ProductKind[];
    /** Yetkilendirme anahtarı (rota ve API tarafında da doğrulanmalıdır) */
    permission: string;
}

export const productSections: ProductSectionConfig[] = [
    {
        key: "general",
        label: "Genel Bilgiler",
        path: "/product-info/general",
        icon: "edit",
        description: "Ürünün kimliğini oluşturan temel alanlar",
        group: "product-info",
        allowedKinds: ALL_PRODUCT_KINDS,
        permission: "product.basic.edit",
    },
    {
        key: "classification",
        label: "Sınıflandırma",
        path: "/product-info/classification",
        icon: "folder-list",
        description: "Kategori atamaları, özellik değerleri ve etiketler",
        group: "product-info",
        allowedKinds: ALL_PRODUCT_KINDS,
        permission: "product.classification.edit",
    },
    {
        key: "media",
        label: "Medya",
        path: "/product-info/media",
        icon: "img",
        description: "Kapak görseli, galeri sırası ve alternatif metinler",
        group: "product-info",
        allowedKinds: ALL_PRODUCT_KINDS,
        permission: "product.basic.edit",
    },
    {
        key: "advanced",
        label: "Gelişmiş Ayarlar",
        path: "/product-info/advanced",
        icon: "setting-alt",
        description: "Ürün tipine özgü teknik profil ve nadir kullanılan alanlar",
        group: "product-info",
        allowedKinds: ALL_PRODUCT_KINDS,
        permission: "product.basic.edit",
    },
    {
        key: "pricing",
        label: "Ürün Fiyatlandırma",
        path: "/pricing/product-pricing",
        icon: "coins",
        description: "Seçili ürünün fiyatlandırması; alanlar ürün tipine göre değişir.",
        group: "pricing",
        allowedKinds: ALL_PRODUCT_KINDS,
        permission: "product.pricing.edit",
    },
    {
        key: "variants",
        label: "Varyantlar",
        path: "/physical-products/variants",
        icon: "grid",
        description: "Renk, beden gibi eksenler ile SKU ve fiyat farkları",
        group: "physical",
        allowedKinds: [1],
        permission: "product.basic.edit",
    },
    {
        key: "inventory-supply",
        label: "Stok ve Tedarik",
        path: "/physical-products/inventory-supply",
        icon: "archive",
        description: "Depo bazlı stok, hareketler, rezervasyon ve tedarikçiler",
        group: "physical",
        allowedKinds: [1],
        permission: "inventory.transaction",
    },
    {
        key: "modules",
        label: "Modüller",
        path: "/software-products/modules",
        icon: "puzzle",
        description: "Seçili yazılım ürününün modülleri ve modül fiyatları",
        group: "software",
        allowedKinds: [2],
        permission: "product.software.edit",
    },
];

const sectionMap = new Map<ProductSectionKey, ProductSectionConfig>(
    productSections.map((section) => [section.key, section])
);

export const getProductSection = (key: ProductSectionKey): ProductSectionConfig => {
    const section = sectionMap.get(key);
    if (!section) {
        throw new Error(`Tanımsız ürün bölümü: ${key}`);
    }
    return section;
};

export const getProductSectionsByGroup = (group: ProductSectionGroup) =>
    productSections.filter((section) => section.group === group);

/** Bir bölüm sayfasına, ürünü önceden seçili şekilde açan bağlantı üretir. */
export const buildProductSectionLink = (key: ProductSectionKey, productId?: string) => {
    const { path } = getProductSection(key);
    return productId ? `${path}?productId=${productId}` : path;
};

/** Bir ürün tipinin hangi bölüm sayfalarında görünebileceğini döner. */
export const getSectionsForKind = (kind?: number) =>
    productSections.filter((section) => !kind || section.allowedKinds.includes(kind as ProductKind));

export const isKindAllowedForSection = (section: ProductSectionConfig, kind?: number) =>
    typeof kind === "number" && section.allowedKinds.includes(kind as ProductKind);
