import { describe, it, expect } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createMemoryRouter, RouterProvider } from "react-router-dom";
import { http, HttpResponse } from "msw";
import { server } from "@/tests/mocks/server";
import { config } from "@/infrastructure/config/appConfig";
import Login from "@/pages/auth/Login";
import { useAuthStore } from "@/application/stores/authStore";

const BASE = config.api.baseUrl.replace(/\/$/, "");

function renderLogin() {
    const router = createMemoryRouter(
        [
            { path: "/login", element: <Login /> },
            { path: "/products", element: <div>Ürünler</div> },
        ],
        { initialEntries: ["/login"] }
    );
    return render(<RouterProvider router={router} />);
}

describe("Login sayfası", () => {
    it("boş submit'te zorunlu alan mesajlarını gösterir", async () => {
        renderLogin();
        await userEvent.click(screen.getByRole("button", { name: "Giriş Yap" }));
        expect(await screen.findByText("E-posta adresi zorunludur")).toBeInTheDocument();
        expect(screen.getByText("Sifre zorunludur")).toBeInTheDocument();
    });

    it("native kısıtı geçen ama zod'a uymayan formatta hata gösterir", async () => {
        renderLogin();
        await userEvent.type(screen.getByLabelText("E-posta"), "user@localhost");
        await userEvent.click(screen.getByRole("button", { name: "Giriş Yap" }));
        expect(await screen.findByText("Gecerli bir e-posta adresi giriniz")).toBeInTheDocument();
    });

    it("kısa şifrede hata gösterir", async () => {
        renderLogin();
        await userEvent.type(screen.getByLabelText("E-posta"), "user@example.com");
        await userEvent.type(screen.getByLabelText("Şifre"), "123");
        await userEvent.click(screen.getByRole("button", { name: "Giriş Yap" }));
        expect(await screen.findByText("Sifre en az 6 karakter olmalidir")).toBeInTheDocument();
    });

    it("geçerli veriyle başarılı girişte store'u kimliklendirilmiş yapar", async () => {
        renderLogin();
        await userEvent.type(screen.getByLabelText("E-posta"), "user@example.com");
        await userEvent.type(screen.getByLabelText("Şifre"), "Sifre123");
        await userEvent.click(screen.getByRole("button", { name: "Giriş Yap" }));
        await waitFor(() => expect(useAuthStore.getState().isAuthenticated).toBe(true));
    });

    it("succeeded:false döndüğünde hata mesajını gösterir", async () => {
        server.use(
            http.post(`${BASE}/api/auth/login`, () =>
                HttpResponse.json({ succeeded: false, errors: ["Geçersiz kimlik bilgileri"] })
            )
        );
        renderLogin();
        await userEvent.type(screen.getByLabelText("E-posta"), "user@example.com");
        await userEvent.type(screen.getByLabelText("Şifre"), "Sifre123");
        await userEvent.click(screen.getByRole("button", { name: "Giriş Yap" }));
        expect(await screen.findByText("Geçersiz kimlik bilgileri")).toBeInTheDocument();
    });
});
