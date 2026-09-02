import { describe, it, expect } from "vitest";
import { categoryRepository } from "@/infrastructure/api/repositories";
import { mockCategory } from "@/tests/mocks/fixtures";

describe("categoryRepository", () => {
    it("list kategori listesini döndürür", async () => {
        const result = await categoryRepository.list();
        expect(result).toHaveLength(1);
        expect(result[0].code).toBe(mockCategory.code);
    });

    describe("byId", () => {
        it("ID ile kategori döndürür", async () => {
            const result = await categoryRepository.byId(mockCategory.id);
            expect(result.name).toBe(mockCategory.name);
        });

        it("bulunamazsa 404 hatası fırlatır", async () => {
            await expect(categoryRepository.byId("yok-id")).rejects.toMatchObject({ statusCode: 404 });
        });
    });

    it("create yeni kategori döndürür (kod gönderilmezse sistem üretir)", async () => {
        const result = await categoryRepository.create({ name: "Yeni Kategori" });
        expect(result.id).toBe(mockCategory.id);
    });

    it("update void döner", async () => {
        await expect(
            categoryRepository.update(mockCategory.id, { code: mockCategory.code, name: "Güncellendi" })
        ).resolves.toBeUndefined();
    });

    it("delete void döner", async () => {
        await expect(categoryRepository.delete(mockCategory.id)).resolves.toBeUndefined();
    });
});
