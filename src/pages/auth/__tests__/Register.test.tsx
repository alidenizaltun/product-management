import { describe, it, expect } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createMemoryRouter, RouterProvider } from "react-router-dom";
import Register from "@/pages/auth/Register";
import { useAuthStore } from "@/application/stores/authStore";

function renderRegister() {
    const router = createMemoryRouter(
        [
            { path: "/register", element: <Register /> },
            { path: "/auth-success", element: <div>Başarılı</div> },
        ],
        { initialEntries: ["/register"] }
    );
    return render(<RouterProvider router={router} />);
}

describe("Register sayfası", () => {
    it("boş submit'te zorunlu alan mesajlarını gösterir", async () => {
        renderRegister();
        await userEvent.click(screen.getByRole("button", { name: "Kayit Ol" }));
        expect(await screen.findByText("Ad zorunludur")).toBeInTheDocument();
        expect(screen.getByText("Soyad zorunludur")).toBeInTheDocument();
        expect(screen.getByText("E-posta adresi zorunludur")).toBeInTheDocument();
        expect(screen.getByText("Sifre zorunludur")).toBeInTheDocument();
        expect(screen.getByText("Sifre onayi zorunludur")).toBeInTheDocument();
    });

    it("şifre karmaşıklık kuralına uymazsa hata gösterir", async () => {
        renderRegister();
        await userEvent.type(screen.getByLabelText("Ad"), "Ali");
        await userEvent.type(screen.getByLabelText("Soyad"), "Veli");
        await userEvent.type(screen.getByLabelText("E-posta"), "user@example.com");
        await userEvent.type(screen.getByLabelText("Sifre"), "allowercase1");
        await userEvent.type(screen.getByLabelText("Sifre Tekrar"), "allowercase1");
        await userEvent.click(screen.getByRole("button", { name: "Kayit Ol" }));
        expect(await screen.findByText("Sifre en az bir buyuk harf icermelidir")).toBeInTheDocument();
    });

    it("şifreler eşleşmezse hata gösterir", async () => {
        renderRegister();
        await userEvent.type(screen.getByLabelText("Ad"), "Ali");
        await userEvent.type(screen.getByLabelText("Soyad"), "Veli");
        await userEvent.type(screen.getByLabelText("E-posta"), "user@example.com");
        await userEvent.type(screen.getByLabelText("Sifre"), "Sifre123");
        await userEvent.type(screen.getByLabelText("Sifre Tekrar"), "Farkli123");
        await userEvent.click(screen.getByRole("button", { name: "Kayit Ol" }));
        expect(await screen.findByText("Sifreler eslesmiyor")).toBeInTheDocument();
    });

    it("geçerli veriyle başarılı kayıtta store'u kimliklendirilmiş yapar", async () => {
        renderRegister();
        await userEvent.type(screen.getByLabelText("Ad"), "Ali");
        await userEvent.type(screen.getByLabelText("Soyad"), "Veli");
        await userEvent.type(screen.getByLabelText("E-posta"), "user@example.com");
        await userEvent.type(screen.getByLabelText("Sifre"), "Sifre123");
        await userEvent.type(screen.getByLabelText("Sifre Tekrar"), "Sifre123");
        await userEvent.click(screen.getByRole("button", { name: "Kayit Ol" }));
        await waitFor(() => expect(useAuthStore.getState().isAuthenticated).toBe(true));
    });
});
