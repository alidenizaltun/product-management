import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import SalesPlanListPanel from "@/pages/products/components/pricing/SalesPlanListPanel";
import type { LicenseOfferingForm } from "@/pages/products/types/productEditor.types";

const canEdit = vi.hoisted(() => ({ current: true }));

vi.mock("@/application/hooks/usePermission", () => ({
    usePermission: () => canEdit.current,
}));

const OFFERINGS: LicenseOfferingForm[] = [
    {
        id: "off-one-time",
        licenseModel: 1,
        name: "Tek Seferlik Lisans",
        basePrice: 0,
        currencyCode: "TRY",
        autoRenew: false,
        isActive: true,
        sortOrder: 1,
    },
    {
        id: "off-sub",
        licenseModel: 2,
        name: "Aylık Plan",
        basePrice: 0,
        currencyCode: "TRY",
        autoRenew: true,
        isActive: true,
        sortOrder: 2,
    },
    {
        licenseModel: 5,
        name: "Deneme Planı",
        basePrice: 0,
        currencyCode: "TRY",
        autoRenew: false,
        isActive: false,
        sortOrder: 3,
    },
];

function renderPanel(props?: Partial<React.ComponentProps<typeof SalesPlanListPanel>>) {
    const onCreateNew = vi.fn();
    const onEdit = vi.fn();
    const onDelete = vi.fn();
    const onOpenRules = vi.fn();

    const view = render(
        <SalesPlanListPanel
            offerings={OFFERINGS}
            onCreateNew={onCreateNew}
            onEdit={onEdit}
            onDelete={onDelete}
            onOpenRules={onOpenRules}
            {...props}
        />
    );

    return { ...view, onCreateNew, onEdit, onDelete, onOpenRules };
}

describe("SalesPlanListPanel", () => {
    beforeEach(() => {
        canEdit.current = true;
    });

    it("plan adlarını, model rozetlerini ve aktif/pasif durumunu gösterir", () => {
        renderPanel();

        expect(screen.getByRole("heading", { name: "Tek Seferlik Lisans" })).toBeInTheDocument();
        expect(screen.getByRole("heading", { name: "Aylık Plan" })).toBeInTheDocument();
        expect(screen.getByRole("heading", { name: "Deneme Planı" })).toBeInTheDocument();
        expect(screen.getByText("Tek Seferlik")).toBeInTheDocument();
        expect(screen.getByText("Abonelik")).toBeInTheDocument();
        expect(screen.getByText("Deneme")).toBeInTheDocument();
        expect(screen.getAllByText("Aktif")).toHaveLength(2);
        expect(screen.getByText("Pasif")).toBeInTheDocument();
    });

    it("her lisans modeline ayrı bir illüstrasyon alanı bağlar", () => {
        const { container } = renderPanel();

        expect(container.querySelector('[data-license-model="1"] .ni-package')).toBeTruthy();
        expect(container.querySelector('[data-license-model="2"] .ni-repeat')).toBeTruthy();
        expect(container.querySelector('[data-license-model="5"] .ni-clock')).toBeTruthy();
        expect(container.querySelectorAll(".sales-plan-card-art")).toHaveLength(3);
    });

    it("düzenleme izni varken Ayarlar, Fiyatlandırma ve sil düğmelerini açar", async () => {
        const user = userEvent.setup();
        const { onEdit, onOpenRules, onDelete } = renderPanel();

        await user.click(screen.getAllByRole("button", { name: "Ayarlar" })[1]);
        expect(onEdit).toHaveBeenCalledWith(1);

        await user.click(screen.getAllByRole("button", { name: "Fiyatlandırma" })[1]);
        expect(onOpenRules).toHaveBeenCalledWith(1);

        await user.click(screen.getAllByTitle("Planı sil")[0]);
        expect(onDelete).toHaveBeenCalledWith(0);

        expect(screen.getAllByRole("button", { name: "Fiyatlandırma" })).toHaveLength(2);
    });

    it("düzenleme izni yokken aksiyon düğmelerini gizler", () => {
        canEdit.current = false;
        renderPanel();

        expect(screen.queryByRole("button", { name: "Yeni Satış Planı" })).not.toBeInTheDocument();
        expect(screen.queryByRole("button", { name: "Ayarlar" })).not.toBeInTheDocument();
        expect(screen.queryByRole("button", { name: "Fiyatlandırma" })).not.toBeInTheDocument();
        expect(screen.queryByTitle("Planı sil")).not.toBeInTheDocument();
        expect(screen.getByRole("heading", { name: "Aylık Plan" })).toBeInTheDocument();
    });

    it("plan yokken boş durum metnini gösterir", () => {
        renderPanel({ offerings: [] });

        expect(screen.getByText("Henüz satış planı eklenmedi.")).toBeInTheDocument();
        expect(screen.queryByRole("heading", { name: "Aylık Plan" })).not.toBeInTheDocument();
    });
});
