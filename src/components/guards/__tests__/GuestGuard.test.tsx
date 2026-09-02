import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router-dom";
import { GuestGuard } from "@/components/guards/RouteGuard";
import { useAuthStore } from "@/application/stores/authStore";

vi.mock("@/application/stores/authStore", () => ({
    useAuthStore: vi.fn(),
}));

function mockStore(overrides: Partial<ReturnType<typeof useAuthStore>>) {
    (useAuthStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
        isAuthenticated: false,
        initialize: vi.fn(),
        ...overrides,
    });
}

function renderGuard() {
    const router = createMemoryRouter(
        [
            {
                path: "/login",
                element: <GuestGuard />,
                children: [{ index: true, element: <div>Giriş Formu</div> }],
            },
            { path: "/products", element: <div>Ürünler</div> },
        ],
        { initialEntries: ["/login"] }
    );
    return render(<RouterProvider router={router} />);
}

describe("GuestGuard", () => {
    it("kimliksiz kullanıcı için misafir içeriği render eder", () => {
        mockStore({ isAuthenticated: false });
        renderGuard();
        expect(screen.getByText("Giriş Formu")).toBeInTheDocument();
    });

    it("kimliklendirilmiş kullanıcıyı ana sayfaya yönlendirir", () => {
        mockStore({ isAuthenticated: true });
        renderGuard();
        expect(screen.getByText("Ürünler")).toBeInTheDocument();
    });
});
