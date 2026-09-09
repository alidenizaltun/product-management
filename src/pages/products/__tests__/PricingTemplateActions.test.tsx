import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, waitFor, fireEvent, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { http, HttpResponse } from "msw";
import { config } from "@/infrastructure/config/appConfig";
import { server } from "@/tests/mocks/server";
import { mockPricingTemplate } from "@/tests/mocks/fixtures";
import { ApplyTemplateModal, SaveAsTemplateModal } from "@/pages/products/components/pricing/PricingTemplateActions";
import type { ProductPricingRuleDto } from "@/domain/types/productOperations.types";

const BASE = config.api.baseUrl.replace(/\/$/, "");

async function clickOverlay(dialog: HTMLElement) {
    fireEvent.mouseDown(dialog);
    fireEvent.click(dialog);
}

function renderWithQuery(ui: React.ReactElement) {
    const queryClient = new QueryClient({
        defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
    });
    return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>);
}

const RULE: ProductPricingRuleDto = {
    id: "rule-001",
    productId: "prod-001",
    code: "rule-standart",
    name: "Standart kural",
    priority: 10,
    isActive: true,
};

describe("PricingTemplateActions", () => {
    it("şablona alma penceresi İptal/Vazgeç ile kapanır, overlay kapatmaz", async () => {
        const user = userEvent.setup();
        const onClose = vi.fn();
        renderWithQuery(<SaveAsTemplateModal open rule={RULE} onClose={onClose} />);

        const dialog = await screen.findByRole("dialog");
        expect(within(dialog).getByRole("heading", { name: "Şablon Olarak Kaydet" })).toBeInTheDocument();

        await clickOverlay(dialog);
        expect(onClose).not.toHaveBeenCalled();

        await user.click(within(dialog).getByRole("button", { name: "Vazgeç" }));
        expect(onClose).toHaveBeenCalledTimes(1);
    });

    it("şablona alma gönderimi mevcut kaydetme yolunu çağırır", async () => {
        const user = userEvent.setup();
        const onClose = vi.fn();
        let saved: { name?: string } | undefined;
        server.use(
            http.post(`${BASE}/api/products/pricing-rules/:ruleId/save-as-template`, async ({ request }) => {
                saved = (await request.json()) as { name?: string };
                return HttpResponse.json({ ...mockPricingTemplate, name: saved.name }, { status: 201 });
            })
        );

        renderWithQuery(<SaveAsTemplateModal open rule={RULE} onClose={onClose} />);

        const dialog = await screen.findByRole("dialog");
        await user.click(within(dialog).getByRole("button", { name: "Şablona Al" }));

        await waitFor(() => {
            expect(saved?.name).toBe("Standart kural");
        });
        await waitFor(() => {
            expect(onClose).toHaveBeenCalledTimes(1);
        });
    });

    it("şablondan ekleme penceresi açık kalır ve Uygula mevcut apply yolunu çağırır", async () => {
        const user = userEvent.setup();
        const onClose = vi.fn();
        const onApplied = vi.fn();
        let applied: { productId?: string } | undefined;
        server.use(
            http.post(`${BASE}/api/pricing-templates/:id/apply`, async ({ request }) => {
                applied = (await request.json()) as { productId?: string };
                return HttpResponse.json({
                    productId: "prod-001",
                    productName: "Test Ürünü",
                    succeeded: true,
                    linkedOfferingCount: 0,
                    pricingRuleCode: "rule-from-template",
                });
            })
        );

        renderWithQuery(
            <ApplyTemplateModal open productId="prod-001" onClose={onClose} onApplied={onApplied} />
        );

        const dialog = await screen.findByRole("dialog");
        expect(within(dialog).getByRole("heading", { name: "Şablondan Kural Ekle" })).toBeInTheDocument();

        await clickOverlay(dialog);
        expect(onClose).not.toHaveBeenCalled();

        const combo = await within(dialog).findByRole("combobox");
        await waitFor(() => {
            expect(combo).not.toBeDisabled();
        });
        await user.click(combo);
        await user.click(await screen.findByText(`${mockPricingTemplate.code} · ${mockPricingTemplate.name}`));
        await user.click(within(dialog).getByRole("button", { name: "Uygula" }));

        await waitFor(() => {
            expect(applied?.productId).toBe("prod-001");
        });
        await waitFor(() => {
            expect(onApplied).toHaveBeenCalledTimes(1);
            expect(onClose).toHaveBeenCalledTimes(1);
        });
    });
});
