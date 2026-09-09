import { describe, expect, it } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { config } from "@/infrastructure/config/appConfig";
import { mockCategory } from "@/tests/mocks/fixtures";
import { server } from "@/tests/mocks/server";
import { renderWithProviders } from "@/tests/utils/renderWithProviders";
import CategoryDetailPage from "@/pages/catalog/CategoryDetailPage";
import { EMPTY_DETAIL_VALUE } from "@/components/shared";
import type { ProductCategoryDto } from "@/domain/types/productOperations.types";

const BASE = config.api.baseUrl.replace(/\/$/, "");

describe("CategoryDetailPage", () => {
  it("kayıt alanlarını DetailPage kabuğunda gösterir; boş değerler em dash olur", async () => {
    renderWithProviders(<CategoryDetailPage />, {
      initialPath: `/definitions/categories/${mockCategory.id}`,
      routePath: "/definitions/categories/:id",
    });

    expect(await screen.findByRole("heading", { name: mockCategory.name })).toBeInTheDocument();
    expect(screen.getByText(`Kod: ${mockCategory.code}`)).toBeInTheDocument();
    expect(screen.getByText("Genel Bilgiler")).toBeInTheDocument();
    expect(screen.getByText(mockCategory.code)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Düzenle/ })).toHaveAttribute(
      "href",
      `/definitions/categories/${mockCategory.id}/edit`
    );

    expect(screen.getByText("Üst Kategori").closest(".row")?.textContent).toContain(EMPTY_DETAIL_VALUE);
    expect(screen.getByText("Açıklama").closest(".row")?.textContent).toContain(EMPTY_DETAIL_VALUE);
    expect(screen.queryByText("Yükleniyor...")).not.toBeInTheDocument();
  });

  it("üst kategori adını listeden eşler", async () => {
    const parent: ProductCategoryDto = { ...mockCategory, id: "parent-1", name: "Üst Grup", code: "CAT-P" };
    const child: ProductCategoryDto = {
      ...mockCategory,
      id: "child-1",
      name: "Alt Grup",
      code: "CAT-C",
      parentCategoryId: parent.id,
      description: "Açıklama metni",
    };

    server.use(
      http.get(`${BASE}/api/catalog/categories`, () => HttpResponse.json([parent, child])),
      http.get(`${BASE}/api/catalog/categories/:id`, ({ params }) => {
        if (params.id === child.id) return HttpResponse.json(child);
        return HttpResponse.json({ message: "Kategori bulunamadı." }, { status: 404 });
      })
    );

    renderWithProviders(<CategoryDetailPage />, {
      initialPath: `/definitions/categories/${child.id}`,
      routePath: "/definitions/categories/:id",
    });

    expect(await screen.findByRole("heading", { name: "Alt Grup" })).toBeInTheDocument();
    expect(screen.getByText("Üst Grup")).toBeInTheDocument();
    expect(screen.getByText("Açıklama metni")).toBeInTheDocument();
  });

  it("kayıt yoksa tekrar denenebilir hata gösterir", async () => {
    const user = userEvent.setup();
    server.use(
      http.get(`${BASE}/api/catalog/categories/:id`, () =>
        HttpResponse.json({ message: "Kategori bulunamadı." }, { status: 404 })
      )
    );

    renderWithProviders(<CategoryDetailPage />, {
      initialPath: "/definitions/categories/missing-id",
      routePath: "/definitions/categories/:id",
    });

    expect(await screen.findByText(/Kategori bulunamadı/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Tekrar Dene" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Geri Dön/ })).toHaveAttribute("href", "/definitions/categories");

    await user.click(screen.getByRole("button", { name: "Tekrar Dene" }));
    await waitFor(() => {
      expect(screen.getByText(/Kategori bulunamadı/)).toBeInTheDocument();
    });
  });
});
