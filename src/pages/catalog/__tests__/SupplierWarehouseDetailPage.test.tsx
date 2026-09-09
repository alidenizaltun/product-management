import { describe, expect, it } from "vitest";
import { screen } from "@testing-library/react";
import { mockSupplier, mockWarehouse } from "@/tests/mocks/fixtures";
import { renderWithProviders } from "@/tests/utils/renderWithProviders";
import SupplierDetailPage from "@/pages/catalog/SupplierDetailPage";
import WarehouseDetailPage from "@/pages/catalog/WarehouseDetailPage";
import { EMPTY_DETAIL_VALUE } from "@/components/shared";

describe("SupplierDetailPage / WarehouseDetailPage", () => {
  it("tedarikçi detayını DetailPage kabuğunda gösterir", async () => {
    renderWithProviders(<SupplierDetailPage />, {
      initialPath: `/definitions/suppliers/${mockSupplier.id}`,
      routePath: "/definitions/suppliers/:id",
    });

    expect(await screen.findByRole("heading", { name: mockSupplier.name })).toBeInTheDocument();
    expect(screen.getByText("Genel Bilgiler")).toBeInTheDocument();
    expect(screen.getByText("E-posta").closest(".row")?.textContent).toContain(EMPTY_DETAIL_VALUE);
    expect(screen.getByRole("link", { name: /Düzenle/ })).toHaveAttribute(
      "href",
      `/definitions/suppliers/${mockSupplier.id}/edit`
    );
  });

  it("depo detayını DetailPage kabuğunda gösterir", async () => {
    renderWithProviders(<WarehouseDetailPage />, {
      initialPath: `/definitions/warehouses/${mockWarehouse.id}`,
      routePath: "/definitions/warehouses/:id",
    });

    expect(await screen.findByRole("heading", { name: mockWarehouse.name })).toBeInTheDocument();
    expect(screen.getByText("Şehir").closest(".row")?.textContent).toContain(EMPTY_DETAIL_VALUE);
    expect(screen.getByRole("link", { name: /Düzenle/ })).toHaveAttribute(
      "href",
      `/definitions/warehouses/${mockWarehouse.id}/edit`
    );
  });
});
