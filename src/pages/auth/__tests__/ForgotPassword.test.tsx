import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createMemoryRouter, RouterProvider } from "react-router-dom";
import ForgotPassword from "@/pages/auth/ForgotPassword";

function renderForgotPassword() {
    const router = createMemoryRouter(
        [{ path: "/forgot-password", element: <ForgotPassword /> }],
        { initialEntries: ["/forgot-password"] }
    );
    return render(<RouterProvider router={router} />);
}

describe("ForgotPassword sayfası", () => {
    it("boş submit'te zorunlu alan mesajını gösterir", async () => {
        renderForgotPassword();
        await userEvent.click(screen.getByRole("button", { name: "Baglanti Gonder" }));
        expect(await screen.findByText("E-posta adresi zorunludur")).toBeInTheDocument();
    });

    it("native kısıtı geçen ama zod'a uymayan formatta hata gösterir", async () => {
        renderForgotPassword();
        await userEvent.type(screen.getByLabelText("E-posta"), "user@localhost");
        await userEvent.click(screen.getByRole("button", { name: "Baglanti Gonder" }));
        expect(await screen.findByText("Gecerli bir e-posta adresi giriniz")).toBeInTheDocument();
    });

    it("geçerli e-posta ile başarı mesajı gösterir", async () => {
        renderForgotPassword();
        await userEvent.type(screen.getByLabelText("E-posta"), "user@example.com");
        await userEvent.click(screen.getByRole("button", { name: "Baglanti Gonder" }));
        expect(
            await screen.findByText(/sifre sifirlama baglantisi gonderilecektir/)
        ).toBeInTheDocument();
    });
});
