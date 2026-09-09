import { describe, expect, it } from "vitest";
import { screen } from "@testing-library/react";
import { mockPriceRevision } from "@/tests/mocks/fixtures";
import { renderWithProviders } from "@/tests/utils/renderWithProviders";
import PriceRevisionDetailPage from "@/pages/pricing/PriceRevisionDetailPage";

describe("PriceRevisionDetailPage", () => {
  it("revizyonu DetailPage kabuğunda Türkçe durum ve ayar etiketleriyle gösterir", async () => {
    renderWithProviders(<PriceRevisionDetailPage />, {
      initialPath: `/pricing/revisions/${mockPriceRevision.id}`,
      routePath: "/pricing/revisions/:id",
    });

    expect(await screen.findByRole("heading", { name: mockPriceRevision.name })).toBeInTheDocument();
    expect(screen.getByText("Taslak")).toBeInTheDocument();
    expect(screen.getByText("Revizyon Bilgileri")).toBeInTheDocument();
    expect(screen.getByText("Yuvarlama yok")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Düzenle/ })).toBeInTheDocument();
    expect(screen.getByText("Etkilenen Fiyatlar")).toBeInTheDocument();
  });
});
