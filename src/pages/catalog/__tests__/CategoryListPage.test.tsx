import { describe, expect, it } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { config } from "@/infrastructure/config/appConfig";
import { mockCategory } from "@/tests/mocks/fixtures";
import { server } from "@/tests/mocks/server";
import { renderWithProviders } from "@/tests/utils/renderWithProviders";
import CategoryListPage from "@/pages/catalog/CategoryListPage";
import type { ProductCategoryDto } from "@/domain/types/productOperations.types";

const BASE = config.api.baseUrl.replace(/\/$/, "");

const category = (
  id: string,
  name: string,
  parentCategoryId?: string
): ProductCategoryDto => ({
  ...mockCategory,
  id,
  code: `CAT-${id}`,
  name,
  parentCategoryId,
});

describe("CategoryListPage", () => {
  it("alt kategorileri üst kategorilerinin hemen altında gösterir", async () => {
    server.use(
      http.get(`${BASE}/api/catalog/categories`, () =>
        HttpResponse.json([
          category("android", "Android", "phones"),
          category("phones", "Telefonlar", "electronics"),
          category("clothing", "Giyim"),
          category("electronics", "Elektronik"),
          category("shirts", "Gömlek", "clothing"),
        ])
      )
    );

    renderWithProviders(<CategoryListPage />, {
      initialPath: "/definitions/categories",
      routePath: "/definitions/categories",
    });

    await waitFor(() => {
      expect(screen.getByText("Elektronik")).toBeInTheDocument();
    });

    const bodyRows = [...document.querySelectorAll(".nk-tb-item")].filter(
      (row) => !row.classList.contains("nk-tb-head")
    );
    const names = bodyRows.map((row) => row.textContent ?? "");

    expect(names[0]).toContain("Giyim");
    expect(names[1]).toContain("Gömlek");
    expect(names[2]).toContain("Elektronik");
    expect(names[3]).toContain("Telefonlar");
    expect(names[4]).toContain("Android");
  });
});
