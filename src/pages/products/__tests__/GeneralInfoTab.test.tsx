import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { FormProvider, useForm } from "react-hook-form";
import GeneralInfoTab from "@/pages/products/components/editor/GeneralInfoTab";
import { buildDefaultValues } from "@/pages/products/utils/productFormMapper";
import type { ProductFormValues } from "@/pages/products/types/productEditor.types";

vi.mock("@/infrastructure/api/repositories", () => ({
    unitDefinitionRepository: {
        getLookup: vi.fn().mockResolvedValue([]),
    },
}));

const FormHost: React.FC<{ kind?: number; name?: string }> = ({ kind = 2, name = "E2E Yazılım" }) => {
    const form = useForm<ProductFormValues>({
        defaultValues: { ...buildDefaultValues(), kind, name, productCode: "PRD-E2E" },
    });

    return (
        <FormProvider {...form}>
            <GeneralInfoTab />
        </FormProvider>
    );
};

const skuInput = () => screen.getByRole("textbox", { name: /sku \/ ürün kodu/i });
const suggestButton = () => screen.getByRole("button", { name: /^öner$/i });

describe("GeneralInfoTab", () => {
    it("yazılım ürününde açıklama alanlarını gösterir, ürün seviyesi vergi alanlarını göstermez", () => {
        render(<FormHost />);

        expect(screen.getByLabelText("Kısa Açıklama")).toBeInTheDocument();
        expect(screen.getByLabelText("Detaylı Açıklama")).toBeInTheDocument();
        expect(screen.queryByLabelText("Vergi Oranı")).not.toBeInTheDocument();
        expect(screen.queryByLabelText("Vergi Kodu")).not.toBeInTheDocument();
    });

    it("ürün adı boşken Öner düğmesini devre dışı bırakır", () => {
        render(<FormHost name="" />);

        expect(suggestButton()).toBeDisabled();
    });

    it("Öner ile adından kod üretir ve ikinci tıklamada farklı kod yazar", async () => {
        const user = userEvent.setup();
        render(<FormHost />);

        await user.click(suggestButton());
        const firstCode = (skuInput() as HTMLInputElement).value;
        expect(firstCode).toMatch(/^PRD-E2E-YAZILIM-[A-Z0-9]+$/);
        expect(firstCode).not.toBe("PRD-E2E");

        await user.click(suggestButton());
        const secondCode = (skuInput() as HTMLInputElement).value;
        expect(secondCode).toMatch(/^PRD-E2E-YAZILIM-[A-Z0-9]+$/);
        expect(secondCode).not.toBe(firstCode);
    });

    it("yazılım ürününde stok takibini gizler, satış anahtarlarını B2B etiketleriyle gösterir", async () => {
        const user = userEvent.setup();
        render(<FormHost kind={2} />);

        await user.click(screen.getByRole("button", { name: /gelişmiş kimlik ve satış ayarları/i }));

        expect(screen.getByRole("checkbox", { name: "Satışa açık" })).toBeInTheDocument();
        expect(screen.getByRole("checkbox", { name: "Bayiler satın alabilir" })).toBeInTheDocument();
        expect(screen.queryByRole("checkbox", { name: "Stok Takibi" })).not.toBeInTheDocument();
    });

    it("yazılım olmayan üründe stok takibini düzenlenebilir anahtar olarak gösterir", async () => {
        const user = userEvent.setup();
        render(<FormHost kind={1} />);

        await user.click(screen.getByRole("button", { name: /gelişmiş kimlik ve satış ayarları/i }));

        const stockSwitch = screen.getByRole("checkbox", { name: "Stok Takibi" });
        expect(stockSwitch).toBeInTheDocument();
        expect(stockSwitch).toBeEnabled();
    });
});
