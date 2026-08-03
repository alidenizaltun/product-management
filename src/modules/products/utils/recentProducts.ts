/**
 * Ürün Seçici'nin sayfa bazlı "son kullanılanlar" önerileri.
 * Bağlam taşıyan bir mekanizma değildir; yalnızca sayfalar arası geçişte
 * ürünü tekrar aratma ihtiyacını azaltır.
 */
const RECENT_STORAGE_PREFIX = "pm_recent_products_";
const RECENT_LIMIT = 5;

export interface RecentProduct {
    id: string;
    name: string;
    productCode?: string;
    kind?: number;
}

export const readRecentProducts = (storageKey: string): RecentProduct[] => {
    try {
        const raw = window.localStorage.getItem(`${RECENT_STORAGE_PREFIX}${storageKey}`);
        const parsed = raw ? (JSON.parse(raw) as RecentProduct[]) : [];
        return Array.isArray(parsed) ? parsed.filter((item) => item && item.id) : [];
    } catch {
        return [];
    }
};

/** Seçilen ürünü listenin başına taşır. */
export const rememberRecentProduct = (storageKey: string, product: RecentProduct) => {
    const next = [product, ...readRecentProducts(storageKey).filter((item) => item.id !== product.id)];

    try {
        window.localStorage.setItem(`${RECENT_STORAGE_PREFIX}${storageKey}`, JSON.stringify(next.slice(0, RECENT_LIMIT)));
    } catch {
        /* localStorage kullanılamıyorsa sessizce vazgeç */
    }
};
