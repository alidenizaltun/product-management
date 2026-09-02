import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router-dom";
import { AuthGuard } from "@/components/guards/RouteGuard";
import { useAuthStore } from "@/application/stores/authStore";
import { mockUser } from "@/tests/mocks/fixtures";

vi.mock("@/application/stores/authStore", () => ({
    useAuthStore: vi.fn(),
}));

function mockStore(overrides: Partial<ReturnType<typeof useAuthStore>>) {
    (useAuthStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
        isAuthenticated: false,
        user: null,
        isLoading: false,
        initialize: vi.fn(),
        getCurrentUser: vi.fn(),
        ...overrides,
    });
}

function renderGuard() {
    const router = createMemoryRouter(
        [
            {
                path: "/protected",
                element: <AuthGuard />,
                children: [{ index: true, element: <div>Korunan İçerik</div> }],
            },
            { path: "/login", element: <div>Login Sayfası</div> },
        ],
        { initialEntries: ["/protected"] }
    );
    return render(<RouterProvider router={router} />);
}

describe("AuthGuard", () => {
    it("isLoading true iken Spinner gösterir", () => {
        mockStore({ isLoading: true });
        renderGuard();
        expect(screen.queryByText("Korunan İçerik")).not.toBeInTheDocument();
        expect(document.querySelector(".spinner-border")).toBeInTheDocument();
    });

    it("kimliksizken login'e yönlendirir", () => {
        mockStore({ isAuthenticated: false });
        renderGuard();
        expect(screen.getByText("Login Sayfası")).toBeInTheDocument();
    });

    it("kimliklendirilmişse içeriği render eder", () => {
        mockStore({ isAuthenticated: true, user: mockUser });
        renderGuard();
        expect(screen.getByText("Korunan İçerik")).toBeInTheDocument();
    });
});
