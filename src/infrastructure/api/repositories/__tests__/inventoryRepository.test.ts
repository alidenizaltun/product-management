import { describe, it, expect } from "vitest";
import { inventoryRepository } from "@/infrastructure/api/repositories";
import { mockInventory } from "@/tests/mocks/fixtures";

describe("inventoryRepository", () => {
    it("getAll envanter listesini döndürür", async () => {
        const result = await inventoryRepository.getAll();
        expect(result).toHaveLength(1);
        expect(result[0].quantityAvailable).toBe(mockInventory.quantityAvailable);
    });

    it("getAll filtre parametrelerini query string'e ekler", async () => {
        const result = await inventoryRepository.getAll({ productId: "prod-001", take: 10 });
        expect(result).toHaveLength(1);
    });

    describe("getById", () => {
        it("ID ile envanter kaydı döndürür", async () => {
            const result = await inventoryRepository.getById(mockInventory.id);
            expect(result.warehouseId).toBe(mockInventory.warehouseId);
        });

        it("bulunamazsa 404 hatası fırlatır", async () => {
            await expect(inventoryRepository.getById("yok-id")).rejects.toMatchObject({ statusCode: 404 });
        });
    });
});
