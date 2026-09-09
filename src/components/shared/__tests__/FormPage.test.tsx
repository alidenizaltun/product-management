import React from "react";
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { FormPage } from "@/components/shared/PageLayout";

describe("FormPage", () => {
  it("Kaydet LoadingButton kullanır, İptal outline light aksiyondur", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn((event: React.FormEvent) => event.preventDefault());
    const onCancel = vi.fn();

    render(
      <FormPage title="Yeni Kayıt" subtitle="Açıklama" onSubmit={onSubmit} onCancel={onCancel}>
        <input aria-label="Ad" />
      </FormPage>
    );

    expect(screen.getByRole("heading", { name: "Yeni Kayıt" })).toBeInTheDocument();
    expect(screen.getByText("Açıklama")).toBeInTheDocument();

    const cancel = screen.getByRole("button", { name: "İptal" });
    expect(cancel).toHaveClass("btn-outline-light");

    const save = screen.getByRole("button", { name: "Kaydet" });
    expect(save).toHaveClass("btn-primary");

    await user.click(cancel);
    expect(onCancel).toHaveBeenCalledTimes(1);

    await user.click(save);
    expect(onSubmit).toHaveBeenCalledTimes(1);
  });

  it("kaydederken spinner metni gösterir ve İptal'i kilitler", () => {
    render(
      <FormPage title="Yeni Kayıt" saving onSubmit={(event) => event.preventDefault()} onCancel={() => undefined}>
        <p>alanlar</p>
      </FormPage>
    );

    expect(screen.getByRole("button", { name: "Kaydediliyor..." })).toBeDisabled();
    expect(screen.getByRole("button", { name: "İptal" })).toBeDisabled();
  });

  it("yüklenirken iskelet gösterir, form içeriğini gizler", () => {
    render(
      <FormPage title="Düzenle" loading onSubmit={(event) => event.preventDefault()} onCancel={() => undefined}>
        <label htmlFor="name">Ad</label>
        <input id="name" />
      </FormPage>
    );

    expect(screen.queryByLabelText("Ad")).not.toBeInTheDocument();
    expect(document.querySelector(".placeholder")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Kaydet" })).toBeDisabled();
  });

  it("stickySave ikinci bir kaydet çubuğu ekler, ikinci başlık eklemez", () => {
    render(
      <FormPage
        title="Uzun Form"
        stickySave
        onSubmit={(event) => event.preventDefault()}
        onCancel={() => undefined}
      >
        <p>alanlar</p>
      </FormPage>
    );

    expect(screen.getAllByRole("heading", { name: "Uzun Form" })).toHaveLength(1);
    expect(screen.getAllByRole("button", { name: "Kaydet" })).toHaveLength(2);
    expect(screen.getAllByRole("button", { name: "İptal" })).toHaveLength(2);
  });
});
