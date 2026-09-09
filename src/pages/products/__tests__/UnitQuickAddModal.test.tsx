import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, waitFor, fireEvent, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import UnitQuickAddModal from "@/pages/products/components/pricing/UnitQuickAddModal";
import { mockUnitDefinition } from "@/tests/mocks/fixtures";

async function clickOverlay(dialog: HTMLElement) {
    fireEvent.mouseDown(dialog);
    fireEvent.click(dialog);
}

function renderModal(props?: Partial<React.ComponentProps<typeof UnitQuickAddModal>>) {
    const onClose = props?.onClose ?? vi.fn();
    const onUnitSelected = props?.onUnitSelected ?? vi.fn();
    const queryClient = new QueryClient({
        defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
    });

    return {
        onClose,
        onUnitSelected,
        ...render(
            <QueryClientProvider client={queryClient}>
                <UnitQuickAddModal
                    isOpen
                    onClose={onClose}
                    onUnitSelected={onUnitSelected}
                    {...props}
                />
            </QueryClientProvider>
        ),
    };
}

describe("UnitQuickAddModal", () => {
    it("İptal ile kapanır, karartılmış alana tıklayınca kapanmaz", async () => {
        const user = userEvent.setup();
        const { onClose } = renderModal();

        const dialog = await screen.findByRole("dialog");
        expect(within(dialog).getByRole("heading", { name: "Birim Ekle" })).toBeInTheDocument();

        await clickOverlay(dialog);
        expect(onClose).not.toHaveBeenCalled();

        await user.click(within(dialog).getByRole("button", { name: "İptal" }));
        expect(onClose).toHaveBeenCalledTimes(1);
    });

    it("seçilen birimi Ekle ile bildirir", async () => {
        const user = userEvent.setup();
        const { onUnitSelected, onClose } = renderModal();

        const dialog = await screen.findByRole("dialog");
        const select = await within(dialog).findByRole("listbox");
        await user.selectOptions(select, mockUnitDefinition.id);
        await user.click(within(dialog).getByRole("button", { name: "Ekle" }));

        await waitFor(() => {
            expect(onUnitSelected).toHaveBeenCalledWith(expect.objectContaining({ id: mockUnitDefinition.id }));
        });
        expect(onClose).not.toHaveBeenCalled();
    });
});
