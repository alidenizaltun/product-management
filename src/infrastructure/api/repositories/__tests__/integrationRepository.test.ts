import { describe, it, expect } from "vitest";
import { integrationRepository } from "@/infrastructure/api/repositories";
import { mockIntegration } from "@/tests/mocks/fixtures";

describe("integrationRepository", () => {
    it("getAll entegrasyon listesini döndürür", async () => {
        const result = await integrationRepository.getAll();
        expect(result).toHaveLength(1);
        expect(result[0].providerKey).toBe(mockIntegration.providerKey);
    });

    describe("getById", () => {
        it("ID ile entegrasyon döndürür", async () => {
            const result = await integrationRepository.getById(mockIntegration.id);
            expect(result.name).toBe(mockIntegration.name);
        });

        it("bulunamazsa 404 hatası fırlatır", async () => {
            await expect(integrationRepository.getById("yok-id")).rejects.toMatchObject({ statusCode: 404 });
        });
    });

    it("create yeni entegrasyon döndürür", async () => {
        const result = await integrationRepository.create({
            name: "Yeni Entegrasyon",
            type: "Email",
            providerKey: "brevo",
            isEnabled: true,
        });
        expect(result.id).toBe(mockIntegration.id);
    });

    it("update void döner", async () => {
        await expect(
            integrationRepository.update(mockIntegration.id, { name: "Güncellendi", isEnabled: true })
        ).resolves.toBeUndefined();
    });

    it("delete void döner", async () => {
        await expect(integrationRepository.delete(mockIntegration.id)).resolves.toBeUndefined();
    });

    it("test bağlantı testi sonucunu döndürür", async () => {
        const result = await integrationRepository.test(mockIntegration.id);
        expect(result.lastTestSucceeded).toBe(true);
    });
});
