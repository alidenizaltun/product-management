import React from "react";
import { describe, expect, it } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createMemoryRouter, RouterProvider } from "react-router-dom";
import { http, HttpResponse } from "msw";
import { config } from "@/infrastructure/config/appConfig";
import { server } from "@/tests/mocks/server";
import { mockPricingTemplate } from "@/tests/mocks/fixtures";
import PricingTemplateFormPage from "@/pages/pricing/PricingTemplateFormPage";
import {
  adjustmentToForm,
  formToAdjustment,
} from "@/pages/pricing/adjustment/adjustmentForm";
import type { AdjustmentFormState } from "@/pages/pricing/adjustment/adjustmentForm";
import type { ProductPricingRuleAdjustmentDto } from "@/domain/types/productOperations.types";

const BASE = config.api.baseUrl.replace(/\/$/, "");

class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}

if (!globalThis.ResizeObserver) {
  globalThis.ResizeObserver = ResizeObserverMock as unknown as typeof ResizeObserver;
}

function renderTemplateForm(path = "/pricing/templates/new") {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  const router = createMemoryRouter(
    [
      { path: "/pricing/templates/new", element: <PricingTemplateFormPage /> },
      { path: "/pricing/templates/:id/edit", element: <PricingTemplateFormPage /> },
      { path: "/pricing/templates", element: <div>Şablon listesi</div> },
    ],
    { initialEntries: [path] }
  );

  return render(
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  );
}

const modeSelect = () => screen.getByRole("combobox", { name: /Hesaplama modu/ });
const operationSelect = () => screen.getByRole("combobox", { name: /Fiyat yönü/ });
const typeSelect = () => screen.getByRole("combobox", { name: /Değişim türü/ });
const valueInput = () => screen.getByRole("spinbutton", { name: /Değişim değeri/ });

const fillFixedPercentageDecrease = async (user: ReturnType<typeof userEvent.setup>) => {
  await user.selectOptions(operationSelect(), "subtract");
  await user.selectOptions(typeSelect(), "percentage");
  await user.clear(valueInput());
  await user.type(valueInput(), "10");
};

describe("PricingTemplateFormPage adjustment block", () => {
  it("ürün kuralıyla aynı etiketleri kullanır; birim kapsamı ve plan ataması göstermez", async () => {
    renderTemplateForm();

    expect(await screen.findByRole("heading", { name: "Yeni Fiyat Şablonu" })).toBeInTheDocument();
    expect(modeSelect()).toBeInTheDocument();
    expect(operationSelect()).toBeInTheDocument();
    expect(typeSelect()).toBeInTheDocument();
    expect(valueInput()).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Hesaplama modu hakkında bilgi" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Gelişmiş ayarlar" })).toBeInTheDocument();

    expect(screen.queryByText("Ürünün birimleri")).not.toBeInTheDocument();
    expect(screen.queryByText("Kuralın geçerli olduğu birimler")).not.toBeInTheDocument();
    expect(screen.queryByText("1. Adım — Birimler")).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Yeni birim ekle/ })).not.toBeInTheDocument();
    expect(screen.queryByText("Geçerlilik başlangıcı")).not.toBeInTheDocument();
    expect(screen.queryByLabelText("Sıra")).not.toBeInTheDocument();
    expect(screen.queryByText("Tek tutar")).not.toBeInTheDocument();
    expect(screen.queryByText("Birim başına")).not.toBeInTheDocument();
  });

  it("sabit yüzde indirimini kural formuyla aynı ProductPricingRuleAdjustmentDto olarak kaydeder", async () => {
    const user = userEvent.setup();
    let created: Record<string, unknown> | undefined;
    server.use(
      http.post(`${BASE}/api/pricing-templates`, async ({ request }) => {
        created = (await request.json()) as Record<string, unknown>;
        return HttpResponse.json(mockPricingTemplate, { status: 201 });
      })
    );

    renderTemplateForm();
    await user.type(screen.getByLabelText(/^Ad/), "SMS indirimi");
    await fillFixedPercentageDecrease(user);
    await user.click(screen.getAllByRole("button", { name: "Oluştur" })[0]);

    const expectedForm: AdjustmentFormState = {
      ...adjustmentToForm({}),
      mode: "",
      type: "percentage",
      value: "10",
      operation: "subtract",
    };
    const expectedPayload = formToAdjustment(expectedForm);

    await waitFor(() => {
      expect(created).toMatchObject({
        name: "SMS indirimi",
        templateKind: 1,
        isActive: true,
        sortOrder: 0,
        payload: expectedPayload,
      });
    });
    expect(created?.payloadJson).toBeUndefined();
  });

  it("kademeli modda kademe tablosunu açar ve type+value yerine tiers yazar", async () => {
    const user = userEvent.setup();
    let created: Record<string, unknown> | undefined;
    server.use(
      http.post(`${BASE}/api/pricing-templates`, async ({ request }) => {
        created = (await request.json()) as Record<string, unknown>;
        return HttpResponse.json(mockPricingTemplate, { status: 201 });
      })
    );

    renderTemplateForm();
    await user.type(screen.getByLabelText(/^Ad/), "Kademeli SMS");
    await user.selectOptions(modeSelect(), "unit");

    expect(typeSelect()).toBeDisabled();
    expect(valueInput()).toBeDisabled();
    expect(screen.getByText(/Henüz kademe eklenmedi/)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /Kademe ekle/ }));
    await user.type(screen.getByLabelText("Kademe 1 aralık başlangıcı"), "1");
    await user.type(screen.getByLabelText("Kademe 1 aralık bitişi"), "10");
    await user.selectOptions(screen.getByLabelText("Kademe 1 türü"), "fixed");
    await user.type(screen.getByLabelText("Kademe 1 değeri"), "50");

    await user.click(screen.getAllByRole("button", { name: "Oluştur" })[0]);

    await waitFor(() => {
      expect(created).toBeDefined();
    });

    const payload = created?.payload as ProductPricingRuleAdjustmentDto;
    expect(payload).toEqual(
      formToAdjustment({
        ...adjustmentToForm({}),
        mode: "unit",
        type: "fixed",
        value: "",
        operation: "",
        tiers: [{ from: "1", to: "10", type: "fixed", value: "50" }],
      })
    );
    expect(payload.mode).toBe("unit");
    expect(payload.type).toBeUndefined();
    expect(payload.value).toBeUndefined();
    expect(payload.tiers).toEqual([{ from: 1, to: 10, type: "fixed", value: 50 }]);
  });

  it("düzenlemede mevcut sortOrder'ı korur ve birim kapsamı UI'sı eklemez", async () => {
    const user = userEvent.setup();
    let updated: Record<string, unknown> | undefined;
    server.use(
      http.get(`${BASE}/api/pricing-templates/:id`, () =>
        HttpResponse.json({
          ...mockPricingTemplate,
          name: "Mevcut Şablon",
          sortOrder: 7,
          payloadJson: JSON.stringify({
            type: "fixed",
            applyOn: "currentPrice",
            value: 25,
            operation: "subtract",
          }),
        })
      ),
      http.put(`${BASE}/api/pricing-templates/:id`, async ({ request }) => {
        updated = (await request.json()) as Record<string, unknown>;
        return new HttpResponse(null, { status: 204 });
      })
    );

    renderTemplateForm(`/pricing/templates/${mockPricingTemplate.id}/edit`);

    expect(await screen.findByDisplayValue("Mevcut Şablon")).toBeInTheDocument();
    expect(screen.queryByText("Ürünün birimleri")).not.toBeInTheDocument();
    expect(valueInput()).toHaveValue(25);

    await user.click(screen.getAllByRole("button", { name: "Güncelle" })[0]);

    await waitFor(() => {
      expect(updated).toMatchObject({
        name: "Mevcut Şablon",
        sortOrder: 7,
        payload: {
          type: "fixed",
          applyOn: "currentPrice",
          value: 25,
          operation: "subtract",
        },
      });
    });
  });
});
