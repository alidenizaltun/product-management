import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DetailModal, FormModal } from "@/components/shared/FormModal";

/**
 * reactstrap 9.2.3 handles overlay dismiss on the `.modal` node (role=dialog).
 * RTL pointer events land on `.modal-dialog`, so fireEvent is used for overlay.
 */
async function clickOverlay(dialog: HTMLElement) {
  fireEvent.mouseDown(dialog);
  fireEvent.click(dialog);
}

describe("FormModal dismiss policy", () => {
  it("does not call toggle when the overlay is clicked", async () => {
    const toggle = vi.fn();
    render(
      <FormModal open toggle={toggle} title="Form başlığı">
        <p>İçerik</p>
      </FormModal>
    );

    const dialog = await screen.findByRole("dialog");
    expect(dialog).toHaveClass("modal");
    await clickOverlay(dialog);

    expect(toggle).not.toHaveBeenCalled();
    expect(dialog).toBeInTheDocument();
  });

  it("calls toggle from İptal and the header close button", async () => {
    const user = userEvent.setup();
    const toggle = vi.fn();
    render(
      <FormModal open toggle={toggle} title="Form başlığı">
        <p>İçerik</p>
      </FormModal>
    );

    await user.click(await screen.findByRole("button", { name: "İptal" }));
    expect(toggle).toHaveBeenCalledTimes(1);

    const headerClose = document.querySelector(".modal-header .close");
    expect(headerClose).toBeInstanceOf(HTMLButtonElement);
    await user.click(headerClose as HTMLButtonElement);
    expect(toggle).toHaveBeenCalledTimes(2);
  });

  it("still submits from Kaydet", async () => {
    const user = userEvent.setup();
    const toggle = vi.fn();
    const onSubmit = vi.fn();
    render(
      <FormModal open toggle={toggle} title="Form başlığı" onSubmit={onSubmit}>
        <p>İçerik</p>
      </FormModal>
    );

    await user.click(await screen.findByRole("button", { name: "Kaydet" }));
    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(toggle).not.toHaveBeenCalled();
  });

  it("does not bubble submit to a parent form", async () => {
    const user = userEvent.setup();
    const parentSubmit = vi.fn((event: React.FormEvent) => event.preventDefault());
    const onSubmit = vi.fn();
    render(
      <form onSubmit={parentSubmit}>
        <button type="submit">Ürünü kaydet</button>
        <FormModal open toggle={() => undefined} title="Form başlığı" onSubmit={onSubmit}>
          <p>İçerik</p>
        </FormModal>
      </form>
    );

    await user.click(await screen.findByRole("button", { name: "Kaydet" }));
    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(parentSubmit).not.toHaveBeenCalled();
  });

  it("does not submit when disabled or loading", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    const { rerender } = render(
      <FormModal open toggle={() => undefined} title="Form başlığı" disabled onSubmit={onSubmit}>
        <p>İçerik</p>
      </FormModal>
    );

    await user.click(await screen.findByRole("button", { name: "Kaydet" }));
    expect(onSubmit).not.toHaveBeenCalled();

    rerender(
      <FormModal
        open
        toggle={() => undefined}
        title="Form başlığı"
        loading
        loadingText="Kaydediliyor..."
        onSubmit={onSubmit}
      >
        <p>İçerik</p>
      </FormModal>
    );

    expect(await screen.findByText("Kaydediliyor...")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Kaydediliyor/ })).toBeDisabled();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("forwards scrollable and xl size to the dialog", async () => {
    render(
      <FormModal open toggle={() => undefined} title="Form başlığı" size="xl" scrollable>
        <p>İçerik</p>
      </FormModal>
    );

    const dialog = await screen.findByRole("dialog");
    expect(dialog.querySelector(".modal-dialog")).toHaveClass("modal-dialog-scrollable");
    expect(dialog.querySelector(".modal-dialog")).toHaveClass("modal-xl");
    const form = dialog.querySelector("form");
    expect(form).toHaveClass("d-flex", "flex-column", "flex-grow-1", "overflow-hidden");
    expect(dialog.querySelector(".modal-body")).toHaveClass("flex-grow-1", "overflow-auto");
    expect(dialog.querySelector(".modal-footer")).toHaveClass("flex-shrink-0");
  });
});

describe("DetailModal dismiss policy", () => {
  it("does not call toggle when the overlay is clicked", async () => {
    const toggle = vi.fn();
    render(
      <DetailModal open toggle={toggle} title="Detay başlığı">
        <p>İçerik</p>
      </DetailModal>
    );

    await clickOverlay(await screen.findByRole("dialog"));
    expect(toggle).not.toHaveBeenCalled();
  });

  it("calls toggle from the header close button", async () => {
    const user = userEvent.setup();
    const toggle = vi.fn();
    render(
      <DetailModal open toggle={toggle} title="Detay başlığı">
        <p>İçerik</p>
      </DetailModal>
    );

    const headerClose = document.querySelector(".modal-header .close");
    expect(headerClose).toBeInstanceOf(HTMLButtonElement);
    await user.click(headerClose as HTMLButtonElement);
    expect(toggle).toHaveBeenCalledTimes(1);
  });
});
