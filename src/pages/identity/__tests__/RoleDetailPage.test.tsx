import { afterEach, describe, expect, it } from "vitest";
import { screen } from "@testing-library/react";
import { mockAuthResponse, mockPermissionDefinition, mockRole, mockUser } from "@/tests/mocks/fixtures";
import { storageService } from "@/infrastructure/storage/storageService";
import { renderWithProviders } from "@/tests/utils/renderWithProviders";
import RoleDetailPage from "@/pages/identity/RoleDetailPage";

afterEach(() => {
  storageService.clearAuthData();
});

describe("RoleDetailPage", () => {
  it("izinleri Türkçe görünen adla listeler", async () => {
    storageService.storeAuthData(
      {
        accessToken: mockAuthResponse.token.accessToken,
        refreshToken: mockAuthResponse.token.refreshToken,
      },
      mockUser
    );

    renderWithProviders(<RoleDetailPage />, {
      initialPath: `/identity/roles/${mockRole.id}`,
      routePath: "/identity/roles/:id",
    });

    expect(await screen.findByRole("heading", { name: mockRole.name })).toBeInTheDocument();
    expect(screen.getByText("Rol Bilgileri")).toBeInTheDocument();
    expect(screen.getByText(mockPermissionDefinition.displayName)).toBeInTheDocument();
    expect(screen.queryByText("products.view")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Düzenle/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Sil/ })).toBeInTheDocument();
  });
});
