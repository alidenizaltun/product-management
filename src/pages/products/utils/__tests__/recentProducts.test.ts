import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
    filterLiveRecentProducts,
    forgetRecentProduct,
    forgetRecentProducts,
    readRecentProducts,
    rememberRecentProduct,
    staleRecentProductIds,
    type RecentProduct,
} from "@/pages/products/utils/recentProducts";

const live: RecentProduct = { id: "prod-live", name: "Canlı Ürün", productCode: "LIVE-1", kind: 1 };
const deleted: RecentProduct = { id: "prod-gone", name: "Silinmiş Ürün", productCode: "GONE-1", kind: 1 };
const software: RecentProduct = { id: "prod-sw", name: "Yazılım", productCode: "SW-1", kind: 2 };
const untyped: RecentProduct = { id: "prod-plain", name: "Tipsiz", productCode: "PLAIN-1" };

describe("recentProducts", () => {
    beforeEach(() => {
        window.localStorage.clear();
    });

    afterEach(() => {
        window.localStorage.clear();
    });

    describe("filterLiveRecentProducts", () => {
        it("katalogda olmayan id'leri listeden çıkarır", () => {
            const visible = filterLiveRecentProducts([live, deleted], new Set([live.id]));

            expect(visible).toEqual([live]);
        });

        it("seçili canlı ürünü katalog gecikse bile tutar", () => {
            const visible = filterLiveRecentProducts([live, deleted], new Set(), {
                selectedLiveId: live.id,
            });

            expect(visible).toEqual([live]);
        });

        it("izin verilen tip dışındaki recents'i gizler ama silinmiş saymaz", () => {
            const recents = [live, software];
            const existing = new Set([live.id, software.id]);

            const visible = filterLiveRecentProducts(recents, existing, { allowedKinds: [1] });

            expect(visible).toEqual([live]);
            expect(staleRecentProductIds(recents, existing)).toEqual([]);
        });

        it("tipi olmayan recents'i izin verilen tipler arasında tutar", () => {
            const visible = filterLiveRecentProducts([untyped], new Set([untyped.id]), {
                allowedKinds: [1],
            });

            expect(visible).toEqual([untyped]);
        });
    });

    describe("staleRecentProductIds", () => {
        it("yalnızca localStorage'da kalan silinmiş id'leri döndürür", () => {
            expect(staleRecentProductIds([live, deleted], new Set([live.id]))).toEqual([deleted.id]);
        });

        it("seçili canlı ürünü stale saymaz", () => {
            expect(staleRecentProductIds([live], new Set(), live.id)).toEqual([]);
        });
    });

    describe("forgetRecentProducts", () => {
        it("silinmiş id'leri her sayfa anahtarından yazar", () => {
            rememberRecentProduct("general", deleted);
            rememberRecentProduct("general", live);
            rememberRecentProduct("pricing", deleted);
            rememberRecentProduct("pricing", software);

            forgetRecentProducts([deleted.id]);

            expect(readRecentProducts("general")).toEqual([live]);
            expect(readRecentProducts("pricing")).toEqual([software]);
        });

        it("forgetRecentProduct tek id için aynı temizliği yapar", () => {
            rememberRecentProduct("general", live);
            rememberRecentProduct("general", deleted);

            forgetRecentProduct(deleted.id);

            expect(readRecentProducts("general").map((item) => item.id)).toEqual([live.id]);
        });
    });
});
