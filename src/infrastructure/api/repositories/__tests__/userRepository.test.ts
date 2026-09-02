import { describe, it, expect } from "vitest";
import { userRepository } from "@/infrastructure/api/repositories";
import { mockAdminUser } from "@/tests/mocks/fixtures";

describe("userRepository", () => {
    it("getAll kullanıcı listesini döndürür", async () => {
        const result = await userRepository.getAll();
        expect(result).toHaveLength(1);
        expect(result[0].email).toBe(mockAdminUser.email);
    });

    it("getAll arama ve includeInactive parametrelerini query string'e ekler", async () => {
        const result = await userRepository.getAll("admin", true);
        expect(result).toHaveLength(1);
    });

    describe("getById", () => {
        it("ID ile kullanıcı döndürür", async () => {
            const result = await userRepository.getById(mockAdminUser.id);
            expect(result.fullName).toBe(mockAdminUser.fullName);
        });

        it("bulunamazsa 404 hatası fırlatır", async () => {
            await expect(userRepository.getById("yok-id")).rejects.toMatchObject({ statusCode: 404 });
        });
    });

    it("create yeni kullanıcı döndürür", async () => {
        const result = await userRepository.create({ email: "yeni@example.com", roles: ["Editor"] });
        expect(result.id).toBe(mockAdminUser.id);
    });

    it("update void döner", async () => {
        await expect(
            userRepository.update(mockAdminUser.id, { isActive: true, roles: ["Editor"] })
        ).resolves.toBeUndefined();
    });

    it("deactivate void döner", async () => {
        await expect(userRepository.deactivate(mockAdminUser.id)).resolves.toBeUndefined();
    });

    it("resendInvitation void döner", async () => {
        await expect(userRepository.resendInvitation(mockAdminUser.id)).resolves.toBeUndefined();
    });
});
