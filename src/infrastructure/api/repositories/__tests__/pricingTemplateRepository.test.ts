import { describe, it, expect } from "vitest";
import { pricingTemplateRepository } from "@/infrastructure/api/repositories";
import { mockPricingTemplate, mockPricingTemplateUsage } from "@/tests/mocks/fixtures";

describe("pricingTemplateRepository", () => {
    it("list şablon listesini döndürür", async () => {
        const result = await pricingTemplateRepository.list();
        expect(result).toHaveLength(1);
        expect(result[0].code).toBe(mockPricingTemplate.code);
    });

    it("list filtre parametrelerini query string'e ekler", async () => {
        const result = await pricingTemplateRepository.list({ templateKind: 1, includeInactive: true });
        expect(result).toHaveLength(1);
    });

    describe("byId", () => {
        it("ID ile şablon döndürür", async () => {
            const result = await pricingTemplateRepository.byId(mockPricingTemplate.id);
            expect(result.name).toBe(mockPricingTemplate.name);
        });

        it("bulunamazsa 404 hatası fırlatır", async () => {
            await expect(pricingTemplateRepository.byId("yok-id")).rejects.toMatchObject({ statusCode: 404 });
        });
    });

    it("usages şablonu kullanan kuralları döndürür", async () => {
        const result = await pricingTemplateRepository.usages(mockPricingTemplate.id);
        expect(result[0].pricingRuleId).toBe(mockPricingTemplateUsage.pricingRuleId);
    });

    it("create yeni şablon döndürür", async () => {
        const result = await pricingTemplateRepository.create({
            name: "Yeni Şablon",
            templateKind: 1,
            currencyCode: "TRY",
            isActive: true,
            sortOrder: 0,
        });
        expect(result.id).toBe(mockPricingTemplate.id);
    });

    it("update void döner", async () => {
        await expect(
            pricingTemplateRepository.update(mockPricingTemplate.id, {
                code: mockPricingTemplate.code,
                name: "Güncellendi",
                currencyCode: "TRY",
                isActive: true,
                sortOrder: 0,
            })
        ).resolves.toBeUndefined();
    });

    it("delete void döner", async () => {
        await expect(pricingTemplateRepository.delete(mockPricingTemplate.id)).resolves.toBeUndefined();
    });

    it("apply şablonu bir ürüne uygular", async () => {
        const result = await pricingTemplateRepository.apply(mockPricingTemplate.id, {
            productId: "prod-001",
            priority: 10,
            isActive: true,
        });
        expect(result.succeeded).toBe(true);
    });

    it("applyBulk şablonu toplu uygular", async () => {
        const result = await pricingTemplateRepository.applyBulk(mockPricingTemplate.id, {
            productIds: ["prod-001", "prod-002"],
            priority: 10,
            isActive: true,
        });
        expect(result).toHaveLength(1);
    });

    it("saveRuleAsTemplate kuralı şablon olarak kaydeder", async () => {
        const result = await pricingTemplateRepository.saveRuleAsTemplate("rule-001", { isActive: true });
        expect(result.id).toBe(mockPricingTemplate.id);
    });
});
