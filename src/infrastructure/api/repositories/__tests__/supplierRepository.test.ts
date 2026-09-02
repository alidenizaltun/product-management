import { describe, it, expect } from "vitest";
import { supplierRepository } from "@/infrastructure/api/repositories";
import { mockSupplier } from "@/tests/mocks/fixtures";

describe("supplierRepository", () => {
    it("list tedarikçi listesini döndürür", async () => {
        const result = await supplierRepository.list();
        expect(result).toHaveLength(1);
        expect(result[0].supplierCode).toBe(mockSupplier.supplierCode);
    });

    describe("byId", () => {
        it("ID ile tedarikçi döndürür", async () => {
            const result = await supplierRepository.byId(mockSupplier.id);
            expect(result.name).toBe(mockSupplier.name);
        });

        it("bulunamazsa 404 hatası fırlatır", async () => {
            await expect(supplierRepository.byId("yok-id")).rejects.toMatchObject({ statusCode: 404 });
        });
    });

    it("create yeni tedarikçi döndürür", async () => {
        const result = await supplierRepository.create({ name: "Yeni Tedarikçi" });
        expect(result.id).toBe(mockSupplier.id);
    });

    it("update void döner", async () => {
        await expect(
            supplierRepository.update(mockSupplier.id, { supplierCode: mockSupplier.supplierCode, name: "Güncellendi" })
        ).resolves.toBeUndefined();
    });

    it("delete void döner", async () => {
        await expect(supplierRepository.delete(mockSupplier.id)).resolves.toBeUndefined();
    });
});
