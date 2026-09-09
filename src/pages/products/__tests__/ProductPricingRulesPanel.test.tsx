import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen, waitFor, fireEvent, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { http, HttpResponse } from "msw";
import { config } from "@/infrastructure/config/appConfig";
import { server } from "@/tests/mocks/server";
import ProductPricingRulesPanel from "@/pages/products/components/pricing-rules/ProductPricingRulesPanel";
import {
  adjustmentToForm,
  formToAdjustment,
} from "@/pages/pricing/adjustment/adjustmentForm";
import type { ProductPricingRuleAdjustmentDto } from "@/domain/types/productOperations.types";

const BASE = config.api.baseUrl.replace(/\/$/, "");

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

  it("sabit yüzde indirimini önceki priceAdjustment şeklinde kaydeder", async () => {
    const user = userEvent.setup();
    let created: { priceAdjustment?: ProductPricingRuleAdjustmentDto } | undefined;
    server.use(
      http.post(`${BASE}/api/products/:id/pricing-rules`, async ({ request }) => {
        created = (await request.json()) as { priceAdjustment?: ProductPricingRuleAdjustmentDto };
        return HttpResponse.json(
          {
            id: "rule-new",
            productId: "prod-001",
            code: "rule-yuzde-indirim",
            name: "Yüzde indirim",
            priority: 10,
            isActive: true,
            priceAdjustment: created.priceAdjustment,
          },
          { status: 201 }
        );
      })
    );

    renderPanel();
    await user.click(await screen.findByRole("button", { name: "Yeni Kural" }));
    await user.selectOptions(screen.getByRole("combobox", { name: /Fiyat yönü/ }), "subtract");
    await user.selectOptions(screen.getByRole("combobox", { name: /Değişim türü/ }), "percentage");
    const valueInput = screen.getByRole("spinbutton", { name: /Değişim değeri/ });
    await user.clear(valueInput);
    await user.type(valueInput, "10");
    await user.click(screen.getByRole("button", { name: "Kural Ekle" }));

    await waitFor(() => {
      expect(created?.priceAdjustment).toEqual(
        formToAdjustment({
          ...adjustmentToForm({}),
          mode: "",
          type: "percentage",
          value: "10",
          operation: "subtract",
        })
      );
    });
  });

  it("kademeli kuralda type/value yerine mode + tiers yazar", async () => {
    const user = userEvent.setup();
    let created: { priceAdjustment?: ProductPricingRuleAdjustmentDto } | undefined;
    server.use(
      http.post(`${BASE}/api/products/:id/pricing-rules`, async ({ request }) => {
        created = (await request.json()) as { priceAdjustment?: ProductPricingRuleAdjustmentDto };
        return HttpResponse.json(
          {
            id: "rule-new",
            productId: "prod-001",
            code: "rule-kademeli-fiyat-kurali",
            name: "Kademeli fiyat kuralı",
            priority: 10,
            isActive: true,
            priceAdjustment: created.priceAdjustment,
          },
          { status: 201 }
        );
      })
    );

    renderPanel();
    await user.click(await screen.findByRole("button", { name: "Yeni Kural" }));
    await user.selectOptions(screen.getByRole("combobox", { name: /Hesaplama modu/ }), "unit");
    await user.click(screen.getByRole("button", { name: /Kademe ekle/ }));
    await user.type(screen.getByLabelText("Kademe 1 aralık başlangıcı"), "1");
    await user.type(screen.getByLabelText("Kademe 1 aralık bitişi"), "10");
    await user.selectOptions(screen.getByLabelText("Kademe 1 türü"), "fixed");
    await user.type(screen.getByLabelText("Kademe 1 değeri"), "50");
    await user.click(screen.getByRole("button", { name: "Kural Ekle" }));

    await waitFor(() => {
      expect(created?.priceAdjustment).toEqual({
        applyOn: "currentPrice",
        mode: "unit",
        unit: { freeUnits: null, rounding: "" },
        tiers: [{ from: 1, to: 10, type: "fixed", value: 50 }],
        limits: {
          minAdjustment: null,
          maxAdjustment: null,
          minFinalPrice: null,
          maxFinalPrice: null,
        },
        conditions: { operator: "all", items: [] },
      });
    });
    expect(created?.priceAdjustment?.type).toBeUndefined();
    expect(created?.priceAdjustment?.value).toBeUndefined();
  });

  it("kural formu FormModal kabuğunda açılır, overlay kapatmaz, İptal kapatır", async () => {
    const user = userEvent.setup();
    renderPanel();

    await user.click(await screen.findByRole("button", { name: "Yeni Kural" }));
    const dialog = await screen.findByRole("dialog");
    expect(within(dialog).getByRole("heading", { name: "Dinamik Kural Ekle" })).toBeInTheDocument();
    expect(dialog.querySelector(".modal-dialog")).toHaveClass("modal-dialog-scrollable");
    expect(dialog.querySelector(".modal-dialog")).toHaveClass("modal-xl");

    fireEvent.mouseDown(dialog);
    fireEvent.click(dialog);
    expect(screen.getByRole("dialog")).toBeInTheDocument();

    await user.click(within(dialog).getByRole("button", { name: "İptal" }));
    await waitFor(() => {
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });
  });
});
