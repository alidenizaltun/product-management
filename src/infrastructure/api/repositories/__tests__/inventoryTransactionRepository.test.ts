import { describe, it, expect } from "vitest";
import { inventoryTransactionRepository } from "@/infrastructure/api/repositories";
import { mockInventoryTransaction } from "@/tests/mocks/fixtures";

describe("inventoryTransactionRepository", () => {
    it("getAll işlem listesini döndürür", async () => {
        const result = await inventoryTransactionRepository.getAll();
        expect(result).toHaveLength(1);
        expect(result[0].quantity).toBe(mockInventoryTransaction.quantity);
    });

    it("create yeni işlem döndürür", async () => {
        const result = await inventoryTransactionRepository.create({
            productId: "prod-001",
            transactionType: 1,
            quantity: 5,
        });
        expect(result.id).toBe(mockInventoryTransaction.id);
    });
});
