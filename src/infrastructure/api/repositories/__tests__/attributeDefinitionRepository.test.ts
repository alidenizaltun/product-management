import { describe, it, expect } from "vitest";
import { attributeDefinitionRepository } from "@/infrastructure/api/repositories";
import { mockAttributeDefinition } from "@/tests/mocks/fixtures";

describe("attributeDefinitionRepository", () => {
    it("list öznitelik listesini döndürür", async () => {
        const result = await attributeDefinitionRepository.list();
        expect(result).toHaveLength(1);
        expect(result[0].key).toBe(mockAttributeDefinition.key);
    });

    describe("byId", () => {
        it("ID ile öznitelik döndürür", async () => {
            const result = await attributeDefinitionRepository.byId(mockAttributeDefinition.id);
            expect(result.displayName).toBe(mockAttributeDefinition.displayName);
        });

        it("bulunamazsa 404 hatası fırlatır", async () => {
            await expect(attributeDefinitionRepository.byId("yok-id")).rejects.toMatchObject({ statusCode: 404 });
        });
    });

    it("create yeni öznitelik döndürür", async () => {
        const result = await attributeDefinitionRepository.create({ key: "SIZE", displayName: "Beden" });
        expect(result.id).toBe(mockAttributeDefinition.id);
    });

    it("update void döner", async () => {
        await expect(
            attributeDefinitionRepository.update(mockAttributeDefinition.id, {
                key: "COLOR",
                displayName: "Renk",
                dataType: 1,
                isRequired: false,
                isFilterable: true,
                isVariantAxis: true,
            })
        ).resolves.toBeUndefined();
    });

    it("delete void döner", async () => {
        await expect(attributeDefinitionRepository.delete(mockAttributeDefinition.id)).resolves.toBeUndefined();
    });
});
