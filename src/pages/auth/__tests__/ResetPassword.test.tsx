import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createMemoryRouter, RouterProvider } from "react-router-dom";
import ResetPassword from "@/pages/auth/ResetPassword";

function renderResetPassword(initialPath = "/reset-password?email=user@example.com&token=abc123") {
    const router = createMemoryRouter(
        [{ path: "/reset-password", element: <ResetPassword /> }],
        { initialEntries: [initialPath] }
    );
    return render(<RouterProvider router={router} />);
}

describe("ResetPassword sayfası", () => {
    it("token query param'ı eksikse uyarı gösterir (form yine de render edilir)", () => {
        renderResetPassword("/reset-password");
        expect(screen.getByText("Sifre sifirlama token bilgisi bulunamadi.")).toBeInTheDocument();
        expect(screen.getByRole("button", { name: "Sifreyi Guncelle" })).toBeInTheDocument();
    });

    it("boş submit'te zorunlu alan mesajlarını gösterir", async () => {
        renderResetPassword();
        await userEvent.click(screen.getByRole("button", { name: "Sifreyi Guncelle" }));
        expect(await screen.findByText("Yeni sifre zorunludur")).toBeInTheDocument();
        expect(screen.getByText("Sifre onayi zorunludur")).toBeInTheDocument();
    });

    it("şifreler eşleşmezse hata gösterir", async () => {
        renderResetPassword();
        await userEvent.type(screen.getByLabelText("Yeni Sifre"), "Sifre123");
        await userEvent.type(screen.getByLabelText("Yeni Sifre Tekrar"), "Farkli123");
        await userEvent.click(screen.getByRole("button", { name: "Sifreyi Guncelle" }));
        expect(await screen.findByText("Sifreler eslesmiyor")).toBeInTheDocument();
    });

    it("geçerli veriyle başarı mesajı gösterir", async () => {
        renderResetPassword();
        await userEvent.type(screen.getByLabelText("Yeni Sifre"), "Sifre123");
        await userEvent.type(screen.getByLabelText("Yeni Sifre Tekrar"), "Sifre123");
        await userEvent.click(screen.getByRole("button", { name: "Sifreyi Guncelle" }));
        expect(await screen.findByText(/Sifreniz basariyla guncellendi/)).toBeInTheDocument();
    });
});
