import { describe, it, expect } from "vitest";
import { systemSettingRepository } from "@/infrastructure/api/repositories";
import { mockSystemSetting } from "@/tests/mocks/fixtures";

describe("systemSettingRepository", () => {
    it("getAll ayar listesini döndürür", async () => {
        const result = await systemSettingRepository.getAll();
        expect(result).toHaveLength(1);
        expect(result[0].key).toBe(mockSystemSetting.key);
    });

    it("bulkUpdate void döner", async () => {
        await expect(
            systemSettingRepository.bulkUpdate({ items: [{ id: mockSystemSetting.id, value: "Yeni Değer" }] })
        ).resolves.toBeUndefined();
    });
});
