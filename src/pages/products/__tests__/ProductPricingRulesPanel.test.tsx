import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import ProductPricingRulesPanel from "@/pages/products/components/pricing-rules/ProductPricingRulesPanel";

function renderPanel() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <ProductPricingRulesPanel
        productId="prod-001"
        editable
        licenseOfferings={[
          {
            id: "lo-001",
            productId: "prod-001",
            licenseModel: 1,
            name: "Aylık Plan",
            basePrice: 1000,
            currencyCode: "TRY",
            autoRenew: true,
            isActive: true,
            sortOrder: 1,
            createdAt: "2025-01-01T00:00:00Z",
          },
        ]}
      />
    </QueryClientProvider>
  );
}

describe("ProductPricingRulesPanel bilgi butonları", () => {
  it("hesaplama modu yardımını hover ile açmaz, tıklayınca sabit ve kademeli örneklerini gösterir", async () => {
    const user = userEvent.setup();
    renderPanel();

    await user.click(await screen.findByRole("button", { name: "Yeni Kural" }));

    const helpButton = await screen.findByRole("button", { name: "Hesaplama modu hakkında bilgi" });

    await user.hover(helpButton);
    expect(screen.queryByText(/1\.000 TL plana %10 düşür/)).not.toBeInTheDocument();
    expect(screen.queryByText(/1–10 kullanıcı 50 TL\/kullanıcı/)).not.toBeInTheDocument();

    await user.click(helpButton);

    await waitFor(() => {
      expect(screen.getByText(/1\.000 TL plana %10 düşür/)).toBeVisible();
    });
    expect(screen.getByText(/1–10 kullanıcı 50 TL\/kullanıcı/)).toBeVisible();
  });
});
