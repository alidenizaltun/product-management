import { describe, it, expect } from "vitest";
import { unitDefinitionRepository } from "@/infrastructure/api/repositories";
import { mockUnitDefinition, mockLookupItem } from "@/tests/mocks/fixtures";

describe("unitDefinitionRepository", () => {
    it("getAll birim listesini döndürür", async () => {
        const result = await unitDefinitionRepository.getAll();
        expect(result).toHaveLength(1);
        expect(result[0].code).toBe(mockUnitDefinition.code);
    });

    describe("getById", () => {
        it("ID ile birim döndürür", async () => {
            const result = await unitDefinitionRepository.getById(mockUnitDefinition.id);
            expect(result.name).toBe(mockUnitDefinition.name);
        });

        it("bulunamazsa 404 hatası fırlatır", async () => {
            await expect(unitDefinitionRepository.getById("yok-id")).rejects.toMatchObject({ statusCode: 404 });
        });
    });

    it("create yeni birim döndürür", async () => {
        const result = await unitDefinitionRepository.create({ name: "Şube" });
        expect(result.id).toBe(mockUnitDefinition.id);
    });

    it("update void döner", async () => {
        await expect(
            unitDefinitionRepository.update(mockUnitDefinition.id, {
                code: mockUnitDefinition.code,
                name: "Güncellendi",
                isActive: true,
                sortOrder: 0,
            })
        ).resolves.toBeUndefined();
    });

    it("delete void döner", async () => {
        await expect(unitDefinitionRepository.delete(mockUnitDefinition.id)).resolves.toBeUndefined();
    });

    it("getLookup birim lookup listesini döndürür", async () => {
        const result = await unitDefinitionRepository.getLookup();
        expect(result[0].id).toBe(mockLookupItem.id);
    });
});
