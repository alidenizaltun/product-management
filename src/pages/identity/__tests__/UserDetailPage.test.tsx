import { afterEach, describe, expect, it } from "vitest";
import { screen } from "@testing-library/react";
import { mockAdminUser, mockAuthResponse, mockUser } from "@/tests/mocks/fixtures";
import { storageService } from "@/infrastructure/storage/storageService";
import { renderWithProviders } from "@/tests/utils/renderWithProviders";
import UserDetailPage from "@/pages/identity/UserDetailPage";
import { EMPTY_DETAIL_VALUE } from "@/components/shared";

afterEach(() => {
  storageService.clearAuthData();
});

describe("UserDetailPage", () => {
  it("DetailPage kabuğunda hesap bilgilerini ve düzenle aksiyonunu gösterir", async () => {
    storageService.storeAuthData(
      {
        accessToken: mockAuthResponse.token.accessToken,
        refreshToken: mockAuthResponse.token.refreshToken,
      },
      mockUser
    );

    renderWithProviders(<UserDetailPage />, {
      initialPath: `/identity/users/${mockAdminUser.id}`,
      routePath: "/identity/users/:id",
    });

    expect((await screen.findAllByRole("heading", { name: mockAdminUser.fullName })).length).toBeGreaterThan(0);
    expect(screen.getByText("Hesap Bilgileri")).toBeInTheDocument();
    expect(screen.getByText("Onaylı")).toBeInTheDocument();
    expect(screen.getByText("Son Güncelleme").closest(".row")?.textContent).toContain(EMPTY_DETAIL_VALUE);
    expect(screen.getByRole("button", { name: /Düzenle/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Pasifleştir/ })).toBeInTheDocument();
  });
});
