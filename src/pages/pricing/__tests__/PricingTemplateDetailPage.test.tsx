import { describe, expect, it } from "vitest";
import { screen } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { config } from "@/infrastructure/config/appConfig";
import { mockPricingTemplate, mockPricingTemplateUsage } from "@/tests/mocks/fixtures";
import { server } from "@/tests/mocks/server";
import { renderWithProviders } from "@/tests/utils/renderWithProviders";
import PricingTemplateDetailPage from "@/pages/pricing/PricingTemplateDetailPage";
import { EMPTY_DETAIL_VALUE } from "@/components/shared";

const BASE = config.api.baseUrl.replace(/\/$/, "");

describe("PricingTemplateDetailPage", () => {
  it("şablon türünü Türkçe gösterir; ham JSON gövdesi basmaz", async () => {
    server.use(
      http.get(`${BASE}/api/pricing-templates/:id`, () =>
        HttpResponse.json({
          ...mockPricingTemplate,
          description: null,
          unitDefinitionName: null,
          payloadJson: JSON.stringify({ type: "percentage", value: 10, operation: "subtract" }),
        })
      ),
      http.get(`${BASE}/api/pricing-templates/:id/usages`, () => HttpResponse.json([mockPricingTemplateUsage]))
    );

    renderWithProviders(<PricingTemplateDetailPage />, {
      initialPath: `/pricing/templates/${mockPricingTemplate.id}`,
      routePath: "/pricing/templates/:id",
    });

    expect(await screen.findByRole("heading", { name: mockPricingTemplate.name })).toBeInTheDocument();
    expect(screen.getByText("Fiyat kuralı")).toBeInTheDocument();
    expect(screen.getByText(/Düşür/)).toBeInTheDocument();
    expect(screen.getByText(/Yüzde/)).toBeInTheDocument();
    expect(screen.queryByText(/payloadJson/)).not.toBeInTheDocument();
    expect(screen.queryByText("{")).not.toBeInTheDocument();
    expect(screen.getByText("Birim").closest(".row")?.textContent).toContain(EMPTY_DETAIL_VALUE);
    expect(screen.getByRole("link", { name: /Düzenle/ })).toHaveAttribute(
      "href",
      `/pricing/templates/${mockPricingTemplate.id}/edit`
    );
    expect(screen.getByText(mockPricingTemplateUsage.productName)).toBeInTheDocument();
  });
});
