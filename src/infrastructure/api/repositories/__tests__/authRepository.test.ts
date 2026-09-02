import { describe, it, expect } from "vitest";
import { http, HttpResponse } from "msw";
import { server } from "@/tests/mocks/server";
import { config } from "@/infrastructure/config/appConfig";
import { authRepository } from "@/infrastructure/api/repositories";
import { mockUser, mockAuthResponse } from "@/tests/mocks/fixtures";

const BASE = config.api.baseUrl.replace(/\/$/, "");

describe("authRepository", () => {
    it("login başarılı girişte kullanıcı ve token döndürür", async () => {
        const result = await authRepository.login({ email: mockUser.email, password: "secret" });
        expect(result.succeeded).toBe(true);
        expect(result.user?.id).toBe(mockUser.id);
    });

    it("login succeeded:false iş kuralı hatasını olduğu gibi döndürür", async () => {
        server.use(
            http.post(`${BASE}/api/auth/login`, () =>
                HttpResponse.json({ succeeded: false, errors: ["Geçersiz kimlik bilgileri"] })
            )
        );
        const result = await authRepository.login({ email: "x@y.com", password: "wrong" });
        expect(result.succeeded).toBe(false);
    });

    it("login 400 durumunda statusCode alanlı hata fırlatır", async () => {
        server.use(
            http.post(`${BASE}/api/auth/login`, () => HttpResponse.json({ message: "İstek geçersiz." }, { status: 400 }))
        );
        await expect(authRepository.login({ email: "x@y.com", password: "wrong" })).rejects.toMatchObject({
            statusCode: 400,
        });
    });

    it("register mutlu yolda kullanıcı döndürür", async () => {
        const result = await authRepository.register({
            email: mockUser.email,
            password: "secret123",
            confirmPassword: "secret123",
            firstName: "Test",
            lastName: "Kullanıcı",
        });
        expect(result.user?.id).toBe(mockUser.id);
    });

    it("logout void döner", async () => {
        await expect(authRepository.logout()).resolves.toBeUndefined();
    });

    it("logoutAll void döner", async () => {
        await expect(authRepository.logoutAll()).resolves.toBeUndefined();
    });

    describe("getCurrentUser", () => {
        it("mevcut kullanıcıyı döndürür", async () => {
            const result = await authRepository.getCurrentUser();
            expect(result.id).toBe(mockUser.id);
        });

        it("401 durumunda hata fırlatır (token yenileme dener, refresh tokenı yoksa reddeder)", async () => {
            server.use(
                http.get(`${BASE}/api/auth/me`, () => HttpResponse.json({ message: "Yetkisiz." }, { status: 401 }))
            );
            await expect(authRepository.getCurrentUser()).rejects.toThrow();
        });
    });

    it("changePassword mutlu yolda succeeded döner", async () => {
        const result = await authRepository.changePassword({
            currentPassword: "old",
            newPassword: "New123",
            confirmNewPassword: "New123",
        });
        expect(result.succeeded).toBe(true);
    });

    it("forgotPassword true döner", async () => {
        await expect(authRepository.forgotPassword({ email: mockUser.email })).resolves.toBe(true);
    });

    it("resetPassword mutlu yolda succeeded döner", async () => {
        const result = await authRepository.resetPassword({
            email: mockUser.email,
            token: "reset-token",
            newPassword: "New123",
            confirmNewPassword: "New123",
        });
        expect(result.succeeded).toBe(true);
    });

    it("confirmEmail query string'e userId ve token ekler", async () => {
        let capturedUrl = "";
        server.use(
            http.get(`${BASE}/api/auth/confirm-email`, ({ request }) => {
                capturedUrl = request.url;
                return new HttpResponse(null, { status: 204 });
            })
        );
        await authRepository.confirmEmail("user-001", "token-abc");
        expect(capturedUrl).toContain("userId=user-001");
        expect(capturedUrl).toContain("token=token-abc");
    });
});
