import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ConfirmDialog from "@/components/shared/ConfirmDialog";

/**
 * reactstrap 9.2.3 handles overlay dismiss on the `.modal` node (role=dialog).
 * RTL pointer events land on `.modal-dialog`, so fireEvent is used for overlay.
 */
async function clickOverlay(dialog: HTMLElement) {
  fireEvent.mouseDown(dialog);
  fireEvent.click(dialog);
}

describe("ConfirmDialog dismiss policy", () => {
  it("does not call onCancel when the overlay is clicked", async () => {
    const onCancel = vi.fn();
    const onConfirm = vi.fn();
    render(
      <ConfirmDialog
        open
        title="Silinsin mi?"
        message="Bu işlem geri alınamaz."
        onCancel={onCancel}
        onConfirm={onConfirm}
      />
    );

    const dialog = await screen.findByRole("dialog");
    expect(dialog).toHaveClass("modal");
    await clickOverlay(dialog);

    expect(onCancel).not.toHaveBeenCalled();
    expect(onConfirm).not.toHaveBeenCalled();
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("calls onCancel from İptal", async () => {
    const user = userEvent.setup();
    const onCancel = vi.fn();
    const onConfirm = vi.fn();
    render(
      <ConfirmDialog
        open
        title="Silinsin mi?"
        message="Bu işlem geri alınamaz."
        onCancel={onCancel}
        onConfirm={onConfirm}
      />
    );

    await user.click(await screen.findByRole("button", { name: "İptal" }));
    expect(onCancel).toHaveBeenCalledTimes(1);
    expect(onConfirm).not.toHaveBeenCalled();
  });

  it("calls onConfirm from the confirm button", async () => {
    const user = userEvent.setup();
    const onCancel = vi.fn();
    const onConfirm = vi.fn();
    render(
      <ConfirmDialog
        open
        title="Silinsin mi?"
        message="Bu işlem geri alınamaz."
        confirmLabel="Sil"
        variant="danger"
        onCancel={onCancel}
        onConfirm={onConfirm}
      />
    );

    await user.click(await screen.findByRole("button", { name: "Sil" }));
    expect(onConfirm).toHaveBeenCalledTimes(1);
    expect(onCancel).not.toHaveBeenCalled();
  });
});
