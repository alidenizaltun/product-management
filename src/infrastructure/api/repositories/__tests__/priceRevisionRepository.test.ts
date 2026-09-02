import { describe, it, expect } from "vitest";
import { priceRevisionRepository } from "@/infrastructure/api/repositories";
import { mockPriceRevision, mockPriceRevisionLine } from "@/tests/mocks/fixtures";

describe("priceRevisionRepository", () => {
    it("list revizyon listesini döndürür", async () => {
        const result = await priceRevisionRepository.list();
        expect(result).toHaveLength(1);
        expect(result[0].code).toBe(mockPriceRevision.code);
    });

    describe("byId", () => {
        it("ID ile revizyon döndürür", async () => {
            const result = await priceRevisionRepository.byId(mockPriceRevision.id);
            expect(result.name).toBe(mockPriceRevision.name);
        });

        it("bulunamazsa 404 hatası fırlatır", async () => {
            await expect(priceRevisionRepository.byId("yok-id")).rejects.toMatchObject({ statusCode: 404 });
        });
    });

    it("create yeni revizyon döndürür", async () => {
        const result = await priceRevisionRepository.create({
            name: "2026 Zam",
            adjustmentType: 1,
            value: 10,
            roundingMode: 1,
        });
        expect(result.id).toBe(mockPriceRevision.id);
    });

    it("update void döner", async () => {
        await expect(
            priceRevisionRepository.update(mockPriceRevision.id, {
                code: mockPriceRevision.code,
                name: "Güncellendi",
                adjustmentType: 1,
                value: 10,
                roundingMode: 1,
            })
        ).resolves.toBeUndefined();
    });

    it("delete void döner", async () => {
        await expect(priceRevisionRepository.delete(mockPriceRevision.id)).resolves.toBeUndefined();
    });

    it("addScope yeni kapsam döndürür", async () => {
        const result = await priceRevisionRepository.addScope(mockPriceRevision.id, {
            scopeType: 1,
            isExclude: false,
        });
        expect(result.priceRevisionId).toBe(mockPriceRevision.id);
    });

    it("removeScope void döner", async () => {
        await expect(priceRevisionRepository.removeScope(mockPriceRevision.id, "scope-001")).resolves.toBeUndefined();
    });

    it("preview özet sonucu döndürür", async () => {
        const result = await priceRevisionRepository.preview(mockPriceRevision.id);
        expect(result.lineCount).toBe(1);
    });

    it("lines sayfalı satır listesini döndürür", async () => {
        const result = await priceRevisionRepository.lines(mockPriceRevision.id, { take: 10 });
        expect(result.items[0].id).toBe(mockPriceRevisionLine.id);
        expect(result.totalCount).toBe(1);
    });

    it("updateLine void döner", async () => {
        await expect(
            priceRevisionRepository.updateLine(mockPriceRevision.id, mockPriceRevisionLine.id, { isExcluded: true })
        ).resolves.toBeUndefined();
    });

    it("submit void döner", async () => {
        await expect(priceRevisionRepository.submit(mockPriceRevision.id)).resolves.toBeUndefined();
    });

    it("approve void döner", async () => {
        await expect(priceRevisionRepository.approve(mockPriceRevision.id, "Onaylandı")).resolves.toBeUndefined();
    });

    it("reject void döner", async () => {
        await expect(priceRevisionRepository.reject(mockPriceRevision.id, "Uygun değil")).resolves.toBeUndefined();
    });

    it("cancel void döner", async () => {
        await expect(priceRevisionRepository.cancel(mockPriceRevision.id)).resolves.toBeUndefined();
    });

    it("apply uygulama sonucunu döndürür", async () => {
        const result = await priceRevisionRepository.apply(mockPriceRevision.id);
        expect(result.affectedLineCount).toBe(1);
    });

    it("rollback geri alma sonucunu döndürür", async () => {
        const result = await priceRevisionRepository.rollback(mockPriceRevision.id);
        expect(result.priceRevisionId).toBe(mockPriceRevision.id);
    });
});
