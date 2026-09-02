import { describe, it, expect } from "vitest";
import { lookupRepository } from "@/infrastructure/api/repositories";
import { mockLookupItem } from "@/tests/mocks/fixtures";

describe("lookupRepository", () => {
    it("all tüm lookup gruplarını döndürür", async () => {
        const result = await lookupRepository.all();
        expect(result.categories).toHaveLength(1);
        expect(result.warehouses[0].id).toBe(mockLookupItem.id);
    });

    it("products ürün lookup listesini döndürür", async () => {
        const result = await lookupRepository.products();
        expect(result).toHaveLength(1);
    });

    it("categories kategori lookup listesini döndürür", async () => {
        const result = await lookupRepository.categories();
        expect(result).toHaveLength(1);
    });

    it("warehouses depo lookup listesini döndürür", async () => {
        const result = await lookupRepository.warehouses();
        expect(result).toHaveLength(1);
    });

    it("suppliers tedarikçi lookup listesini döndürür", async () => {
        const result = await lookupRepository.suppliers();
        expect(result).toHaveLength(1);
    });

    it("priceLists fiyat listesi lookup'ını döndürür", async () => {
        const result = await lookupRepository.priceLists();
        expect(result).toHaveLength(1);
    });

    it("unitDefinitions birim lookup'ını döndürür", async () => {
        const result = await lookupRepository.unitDefinitions();
        expect(result).toHaveLength(1);
    });

    it("regions bölge lookup'ını döndürür", async () => {
        const result = await lookupRepository.regions();
        expect(result).toHaveLength(1);
    });
});
