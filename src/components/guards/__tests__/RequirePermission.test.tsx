import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router-dom";
import { RequirePermission } from "@/components/guards/RouteGuard";
import { useAuthStore } from "@/application/stores/authStore";
import { mockUser } from "@/tests/mocks/fixtures";

vi.mock("@/application/stores/authStore", () => ({
    useAuthStore: vi.fn(),
}));

function mockStore(overrides: Partial<ReturnType<typeof useAuthStore>>) {
    (useAuthStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
        isAuthenticated: true,
        user: null,
        isLoading: false,
        initialize: vi.fn(),
        getCurrentUser: vi.fn(),
        ...overrides,
    });
}

function renderGuard(permission: string) {
    const router = createMemoryRouter(
        [
            {
                path: "/protected",
                element: <RequirePermission permission={permission} />,
                children: [{ index: true, element: <div>Korunan İçerik</div> }],
            },
            { path: "/products", element: <div>Ürünler</div> },
        ],
        { initialEntries: ["/protected"] }
    );
    return render(<RouterProvider router={router} />);
}

describe("RequirePermission", () => {
    it("kullanıcı gerekli izne sahipse içeriği render eder", () => {
        mockStore({ user: { ...mockUser, roles: [], permissions: ["Users.View"] } });
        renderGuard("Users.View");
        expect(screen.getByText("Korunan İçerik")).toBeInTheDocument();
    });

    it("bypass rolündeki kullanıcı için izin listesine bakmadan izin verir", () => {
        mockStore({ user: { ...mockUser, roles: ["Admin"], permissions: [] } });
        renderGuard("Users.View");
        expect(screen.getByText("Korunan İçerik")).toBeInTheDocument();
    });

    it("gerekli izne sahip olmayan kullanıcıyı anasayfaya yönlendirir", () => {
        mockStore({ user: { ...mockUser, roles: [], permissions: [] } });
        renderGuard("Users.View");
        expect(screen.queryByText("Korunan İçerik")).not.toBeInTheDocument();
        expect(screen.getByText("Ürünler")).toBeInTheDocument();
    });
});
