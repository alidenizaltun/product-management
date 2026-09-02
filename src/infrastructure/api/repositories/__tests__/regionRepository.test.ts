import { describe, it, expect } from "vitest";
import { regionRepository } from "@/infrastructure/api/repositories";
import { mockRegion } from "@/tests/mocks/fixtures";

describe("regionRepository", () => {
    it("list bölge listesini döndürür", async () => {
        const result = await regionRepository.list();
        expect(result).toHaveLength(1);
        expect(result[0].code).toBe(mockRegion.code);
    });

    describe("byId", () => {
        it("ID ile bölge döndürür", async () => {
            const result = await regionRepository.byId(mockRegion.id);
            expect(result.name).toBe(mockRegion.name);
        });

        it("bulunamazsa 404 hatası fırlatır", async () => {
            await expect(regionRepository.byId("yok-id")).rejects.toMatchObject({ statusCode: 404 });
        });
    });

    it("create yeni bölge döndürür", async () => {
        const result = await regionRepository.create({ name: "Asya" });
        expect(result.id).toBe(mockRegion.id);
    });

    it("update void döner", async () => {
        await expect(
            regionRepository.update(mockRegion.id, { code: mockRegion.code, name: "Güncellendi", isActive: true, sortOrder: 0 })
        ).resolves.toBeUndefined();
    });

    it("delete void döner", async () => {
        await expect(regionRepository.delete(mockRegion.id)).resolves.toBeUndefined();
    });
});
