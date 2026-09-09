import { describe, expect, it } from "vitest";
import { screen } from "@testing-library/react";
import { mockPriceList, mockPriceListItem } from "@/tests/mocks/fixtures";
import { renderWithProviders } from "@/tests/utils/renderWithProviders";
import PriceListDetailPage from "@/pages/pricing/PriceListDetailPage";
import { EMPTY_DETAIL_VALUE } from "@/components/shared";

describe("PriceListDetailPage", () => {
  it("liste bilgilerini ve kalemleri DetailPage kabuğunda gösterir", async () => {
    renderWithProviders(<PriceListDetailPage />, {
      initialPath: `/pricing/price-lists/${mockPriceList.id}`,
      routePath: "/pricing/price-lists/:id",
    });

    expect(await screen.findByRole("heading", { name: mockPriceList.name })).toBeInTheDocument();
    expect(screen.getByText("Genel Bilgiler")).toBeInTheDocument();
    expect(screen.getByText("Geçerlilik")).toBeInTheDocument();
    expect(screen.getByText("Satış Kanalı").closest(".row")?.textContent).toContain(EMPTY_DETAIL_VALUE);
    expect(screen.getByText("Liste Kalemleri")).toBeInTheDocument();
    expect(screen.getByText(mockPriceListItem.productId)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Düzenle/ })).toHaveAttribute(
      "href",
      `/pricing/price-lists/${mockPriceList.id}/edit`
    );
  });
});
