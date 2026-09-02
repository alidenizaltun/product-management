import { describe, it, expect } from "vitest";
import { inventoryReservationRepository } from "@/infrastructure/api/repositories";
import { mockInventoryReservation } from "@/tests/mocks/fixtures";

describe("inventoryReservationRepository", () => {
    it("getAll rezervasyon listesini döndürür", async () => {
        const result = await inventoryReservationRepository.getAll();
        expect(result).toHaveLength(1);
        expect(result[0].reservationCode).toBe(mockInventoryReservation.reservationCode);
    });

    describe("getById", () => {
        it("ID ile rezervasyon döndürür", async () => {
            const result = await inventoryReservationRepository.getById(mockInventoryReservation.id);
            expect(result.quantity).toBe(mockInventoryReservation.quantity);
        });

        it("bulunamazsa 404 hatası fırlatır", async () => {
            await expect(inventoryReservationRepository.getById("yok-id")).rejects.toMatchObject({
                statusCode: 404,
            });
        });
    });

    it("updateStatus void döner", async () => {
        await expect(
            inventoryReservationRepository.updateStatus(mockInventoryReservation.id, { status: 2 })
        ).resolves.toBeUndefined();
    });
});
