import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, fireEvent, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { FormProvider, useForm } from "react-hook-form";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import SalesPlanModal from "@/pages/products/components/pricing/SalesPlanModal";
import { EMPTY_OFFERING } from "@/pages/products/components/pricing/LicenseOfferingFormFields";
import { buildDefaultValues } from "@/pages/products/utils/productFormMapper";
import type { ProductFormValues } from "@/pages/products/types/productEditor.types";

const createLicenseOffering = vi.fn();
const updateLicenseOffering = vi.fn();

vi.mock("@/application/hooks/usePermission", () => ({
    usePermission: () => true,
}));

vi.mock("@/infrastructure/api/repositories", () => ({
    productRepository: {
        createLicenseOffering: (...args: unknown[]) => createLicenseOffering(...args),
        updateLicenseOffering: (...args: unknown[]) => updateLicenseOffering(...args),
    },
}));

async function clickOverlay(dialog: HTMLElement) {
    fireEvent.mouseDown(dialog);
    fireEvent.click(dialog);
}

function renderModal(options?: {
    offering?: Partial<ProductFormValues["licenseOfferings"][number]>;
    index?: number | null;
    onClose?: () => void;
    onParentSubmit?: (event: React.FormEvent) => void;
}) {
    const onClose = options?.onClose ?? vi.fn();
    const onRequestDelete = vi.fn();
    const onOpenRules = vi.fn();
    const onParentSubmit = options?.onParentSubmit ?? vi.fn((event: React.FormEvent) => event.preventDefault());
    const queryClient = new QueryClient({
        defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
    });

    const Host: React.FC = () => {
        const form = useForm<ProductFormValues>({
            defaultValues: {
                ...buildDefaultValues(),
                licenseOfferings: [
                    {
                        ...EMPTY_OFFERING,
                        _tempId: "temp-plan",
                        name: "",
                        ...options?.offering,
                    },
                ],
            },
        });

        return (
            <FormProvider {...form}>
                <form onSubmit={onParentSubmit}>
                    <button type="submit">Ürünü kaydet</button>
                    <SalesPlanModal
                        index={options?.index === undefined ? 0 : options.index}
                        productId="prod-001"
                        onClose={onClose}
                        onRequestDelete={onRequestDelete}
                        onOpenRules={onOpenRules}
                    />
                </form>
            </FormProvider>
        );
    };

    return {
        onClose,
        onRequestDelete,
        onParentSubmit,
        ...render(
            <QueryClientProvider client={queryClient}>
                <Host />
            </QueryClientProvider>
        ),
    };
}

describe("SalesPlanModal", () => {
    beforeEach(() => {
        createLicenseOffering.mockReset();
        updateLicenseOffering.mockReset();
        createLicenseOffering.mockResolvedValue({ id: "off-new" });
        updateLicenseOffering.mockResolvedValue(undefined);
    });

    it("İptal ile kapanır, karartılmış alana tıklayınca kapanmaz", async () => {
        const user = userEvent.setup();
        const { onClose } = renderModal();

        const dialog = await screen.findByRole("dialog");
        await clickOverlay(dialog);
        expect(onClose).not.toHaveBeenCalled();

        await user.click(within(dialog).getByRole("button", { name: "İptal" }));
        expect(onClose).toHaveBeenCalledTimes(1);
    });

    it("kaydetme üst ürün formunu göndermez", async () => {
        const user = userEvent.setup();
        const { onClose, onParentSubmit } = renderModal();

        const dialog = await screen.findByRole("dialog");
        await user.click(within(dialog).getByRole("button", { name: "Boş plan ile devam et" }));
        await user.type(within(dialog).getByPlaceholderText("Yıllık Abonelik"), "Aylık Plan");
        await user.click(within(dialog).getByRole("button", { name: "Planı Kaydet" }));

        await waitFor(() => {
            expect(createLicenseOffering).toHaveBeenCalledTimes(1);
        });
        expect(onParentSubmit).not.toHaveBeenCalled();
        await waitFor(() => {
            expect(onClose).toHaveBeenCalledTimes(1);
        });
    });
});
