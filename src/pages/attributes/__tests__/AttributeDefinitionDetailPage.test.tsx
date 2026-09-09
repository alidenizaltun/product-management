import { describe, expect, it } from "vitest";
import { screen } from "@testing-library/react";
import { mockAttributeDefinition } from "@/tests/mocks/fixtures";
import { renderWithProviders } from "@/tests/utils/renderWithProviders";
import AttributeDefinitionDetailPage from "@/pages/attributes/AttributeDefinitionDetailPage";
import { EMPTY_DETAIL_VALUE } from "@/components/shared";

describe("AttributeDefinitionDetailPage", () => {
  it("veri tipini Türkçe etiketler; ham sayı veya İngilizce enum basmaz", async () => {
    renderWithProviders(<AttributeDefinitionDetailPage />, {
      initialPath: `/definitions/attributes/${mockAttributeDefinition.id}`,
      routePath: "/definitions/attributes/:id",
    });

    expect(await screen.findByRole("heading", { name: mockAttributeDefinition.displayName })).toBeInTheDocument();
    expect(screen.getByText("Metin")).toBeInTheDocument();
    expect(screen.queryByText("Boolean")).not.toBeInTheDocument();
    expect(screen.getByText("İzinli Değerler").closest(".row")?.textContent).toContain(EMPTY_DETAIL_VALUE);
    expect(screen.getByRole("link", { name: /Düzenle/ })).toHaveAttribute(
      "href",
      `/definitions/attributes/${mockAttributeDefinition.id}/edit`
    );
  });
});
