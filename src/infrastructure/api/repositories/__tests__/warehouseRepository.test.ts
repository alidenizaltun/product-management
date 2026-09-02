import { describe, it, expect } from "vitest";
import { warehouseRepository } from "@/infrastructure/api/repositories";
import { mockWarehouse } from "@/tests/mocks/fixtures";

describe("warehouseRepository", () => {
    it("list depo listesini döndürür", async () => {
        const result = await warehouseRepository.list();
        expect(result).toHaveLength(1);
        expect(result[0].code).toBe(mockWarehouse.code);
    });

    describe("byId", () => {
        it("ID ile depo döndürür", async () => {
            const result = await warehouseRepository.byId(mockWarehouse.id);
            expect(result.name).toBe(mockWarehouse.name);
        });

        it("bulunamazsa 404 hatası fırlatır", async () => {
            await expect(warehouseRepository.byId("yok-id")).rejects.toMatchObject({ statusCode: 404 });
        });
    });

    it("create yeni depo döndürür", async () => {
        const result = await warehouseRepository.create({ name: "Yeni Depo" });
        expect(result.id).toBe(mockWarehouse.id);
    });

    it("update void döner", async () => {
        await expect(
            warehouseRepository.update(mockWarehouse.id, { code: mockWarehouse.code, name: "Güncellendi" })
        ).resolves.toBeUndefined();
    });

    it("delete void döner", async () => {
        await expect(warehouseRepository.delete(mockWarehouse.id)).resolves.toBeUndefined();
    });
});
