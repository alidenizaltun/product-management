import { describe, it, expect } from "vitest";
import {
    placeAttributeAssignment,
    placeCategoryAssignment,
    placeRegionAssignment,
} from "@/pages/products/utils/quickAddAssignment";

describe("placeCategoryAssignment", () => {
    it("boş satırı doldurur", () => {
        const result = placeCategoryAssignment(
            [{ productCategoryId: "", isPrimary: false, sortOrder: 1 }],
            "cat-new"
        );

        expect(result.placement).toBe("filled-empty");
        expect(result.next).toEqual([{ productCategoryId: "cat-new", isPrimary: false, sortOrder: 1 }]);
    });

    it("dolu listeye yeni satır ekler ve ilk kaydı birincil yapar", () => {
        const empty = placeCategoryAssignment([], "cat-1");
        expect(empty.placement).toBe("appended");
        expect(empty.next[0]).toMatchObject({
            productCategoryId: "cat-1",
            isPrimary: true,
            sortOrder: 1,
        });

        const second = placeCategoryAssignment(empty.next, "cat-2");
        expect(second.placement).toBe("appended");
        expect(second.next).toHaveLength(2);
        expect(second.next[1]).toMatchObject({
            productCategoryId: "cat-2",
            isPrimary: false,
            sortOrder: 2,
        });
    });

    it("aynı kategoriyi tekrar eklemez", () => {
        const current = [{ productCategoryId: "cat-1", isPrimary: true, sortOrder: 1 }];
        const result = placeCategoryAssignment(current, "cat-1");

        expect(result.placement).toBe("already-present");
        expect(result.next).toBe(current);
    });
});

describe("placeAttributeAssignment", () => {
    it("boş satırı doldurur ve değeri boş bırakır", () => {
        const result = placeAttributeAssignment(
            [{ attributeDefinitionId: "", valueText: "kalan" }],
            "attr-new"
        );

        expect(result.placement).toBe("filled-empty");
        expect(result.next).toEqual([{ attributeDefinitionId: "attr-new", valueText: "kalan" }]);
    });

    it("dolu listeye boş değerli satır ekler", () => {
        const result = placeAttributeAssignment(
            [{ attributeDefinitionId: "attr-1", valueText: "Kırmızı" }],
            "attr-2"
        );

        expect(result.placement).toBe("appended");
        expect(result.next[1]).toEqual({ attributeDefinitionId: "attr-2", valueText: "" });
    });

    it("aynı özelliği tekrar eklemez", () => {
        const current = [{ attributeDefinitionId: "attr-1", valueText: "Kırmızı" }];
        const result = placeAttributeAssignment(current, "attr-1");

        expect(result.placement).toBe("already-present");
        expect(result.next).toBe(current);
    });
});

describe("placeRegionAssignment", () => {
    it("boş satırı doldurur", () => {
        const result = placeRegionAssignment(
            [
                {
                    regionId: "",
                    currencyCode: "TRY",
                    isDefault: true,
                    isActive: true,
                    sortOrder: 0,
                },
            ],
            "region-new"
        );

        expect(result.placement).toBe("filled-empty");
        expect(result.next[0].regionId).toBe("region-new");
    });

    it("ilk bölgeyi varsayılan yaparak ekler", () => {
        const first = placeRegionAssignment([], "region-1");
        expect(first.placement).toBe("appended");
        expect(first.next[0]).toMatchObject({
            regionId: "region-1",
            currencyCode: "TRY",
            isDefault: true,
            isActive: true,
            sortOrder: 1,
        });

        const second = placeRegionAssignment(first.next, "region-2");
        expect(second.next[1]).toMatchObject({
            regionId: "region-2",
            isDefault: false,
            sortOrder: 2,
        });
    });

    it("aynı bölgeyi tekrar eklemez", () => {
        const current = [
            {
                regionId: "region-1",
                currencyCode: "TRY",
                isDefault: true,
                isActive: true,
                sortOrder: 0,
            },
        ];
        const result = placeRegionAssignment(current, "region-1");

        expect(result.placement).toBe("already-present");
        expect(result.next).toBe(current);
    });
});
