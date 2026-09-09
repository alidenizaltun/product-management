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

const FormHost: React.FC<{ kind?: number }> = ({ kind = 2 }) => {
    const form = useForm<ProductFormValues>({
        defaultValues: { ...buildDefaultValues(), kind, name: "E2E Yazılım", productCode: "PRD-E2E" },
    });

    return (
        <FormProvider {...form}>
            <GeneralInfoTab />
        </FormProvider>
    );
};

describe("GeneralInfoTab", () => {
    it("yazılım ürününde vergi oranı ve vergi kodu alanlarını gösterir", () => {
        render(<FormHost />);

        expect(screen.getByLabelText("Vergi Oranı")).toBeInTheDocument();
        expect(screen.getByLabelText("Vergi Kodu")).toBeInTheDocument();
        expect(screen.getByLabelText("Kısa Açıklama")).toBeInTheDocument();
        expect(screen.getByLabelText("Detaylı Açıklama")).toBeInTheDocument();
    });

    it("gelişmiş ayarlarda satılabilir ve satın alınabilir anahtarlarını açar", async () => {
        const user = userEvent.setup();
        render(<FormHost />);

        await user.click(screen.getByRole("button", { name: /gelişmiş kimlik ve satış ayarları/i }));

        expect(screen.getByRole("checkbox", { name: "Satılabilir" })).toBeInTheDocument();
        expect(screen.getByRole("checkbox", { name: "Satın Alınabilir" })).toBeInTheDocument();
    });
});
