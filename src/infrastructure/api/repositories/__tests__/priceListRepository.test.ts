import { describe, it, expect } from "vitest";
import { priceListRepository } from "@/infrastructure/api/repositories";
import { mockPriceList, mockPriceListItem } from "@/tests/mocks/fixtures";

describe("priceListRepository", () => {
    it("list fiyat listesi listesini döndürür", async () => {
        const result = await priceListRepository.list();
        expect(result).toHaveLength(1);
        expect(result[0].code).toBe(mockPriceList.code);
    });

    describe("byId", () => {
        it("ID ile fiyat listesi döndürür", async () => {
            const result = await priceListRepository.byId(mockPriceList.id);
            expect(result.name).toBe(mockPriceList.name);
        });

        it("bulunamazsa 404 hatası fırlatır", async () => {
            await expect(priceListRepository.byId("yok-id")).rejects.toMatchObject({ statusCode: 404 });
        });
    });

    it("create yeni fiyat listesi döndürür", async () => {
        const result = await priceListRepository.create({ name: "Yeni Liste" });
        expect(result.id).toBe(mockPriceList.id);
    });

    it("update void döner", async () => {
        await expect(
            priceListRepository.update(mockPriceList.id, { code: mockPriceList.code, name: "Güncellendi" })
        ).resolves.toBeUndefined();
    });

    it("delete void döner", async () => {
        await expect(priceListRepository.delete(mockPriceList.id)).resolves.toBeUndefined();
    });

    it("items fiyat listesi kalemlerini döndürür", async () => {
        const result = await priceListRepository.items(mockPriceList.id);
        expect(result[0].id).toBe(mockPriceListItem.id);
    });
});
