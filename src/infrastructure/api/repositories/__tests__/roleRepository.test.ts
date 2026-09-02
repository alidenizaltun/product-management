import { describe, it, expect } from "vitest";
import { roleRepository } from "@/infrastructure/api/repositories";
import { mockRole, mockPermissionDefinition } from "@/tests/mocks/fixtures";

describe("roleRepository", () => {
    it("getAll rol listesini döndürür", async () => {
        const result = await roleRepository.getAll();
        expect(result).toHaveLength(1);
        expect(result[0].name).toBe(mockRole.name);
    });

    describe("getById", () => {
        it("ID ile rol döndürür", async () => {
            const result = await roleRepository.getById(mockRole.id);
            expect(result.userCount).toBe(mockRole.userCount);
        });

        it("bulunamazsa 404 hatası fırlatır", async () => {
            await expect(roleRepository.getById("yok-id")).rejects.toMatchObject({ statusCode: 404 });
        });
    });

    it("create yeni rol döndürür", async () => {
        const result = await roleRepository.create({ name: "Editor", permissions: ["products.view"] });
        expect(result.id).toBe(mockRole.id);
    });

    it("update void döner", async () => {
        await expect(
            roleRepository.update(mockRole.id, { isActive: true, permissions: ["products.view"] })
        ).resolves.toBeUndefined();
    });

    it("delete void döner", async () => {
        await expect(roleRepository.delete(mockRole.id)).resolves.toBeUndefined();
    });

    it("getPermissionCatalog izin kataloğunu döndürür", async () => {
        const result = await roleRepository.getPermissionCatalog();
        expect(result[0].key).toBe(mockPermissionDefinition.key);
    });
});
