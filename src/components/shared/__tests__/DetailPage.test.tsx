import React from "react";
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { DetailPage } from "@/components/shared/PageLayout";

describe("DetailPage", () => {
  it("yüklenirken DetailSkeleton gösterir, başlık aksiyonlarını gizler", () => {
    render(
      <MemoryRouter>
        <DetailPage title="Kayıt" loading editTo="/edit">
          <p>içerik</p>
        </DetailPage>
      </MemoryRouter>
    );

    expect(screen.getByRole("heading", { name: "Yükleniyor..." })).toBeInTheDocument();
    expect(document.querySelector(".placeholder")).toBeTruthy();
    expect(screen.queryByText("içerik")).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /Düzenle/ })).not.toBeInTheDocument();
  });

  it("hatada tekrar denenebilir StatusAlert gösterir", async () => {
    const user = userEvent.setup();
    const onRetry = vi.fn();

    render(
      <MemoryRouter>
        <DetailPage
          title="Kayıt"
          error
          errorMessage="Kayıt bulunamadı."
          onRetry={onRetry}
          backTo="/list"
        >
          <p>içerik</p>
        </DetailPage>
      </MemoryRouter>
    );

    expect(screen.getByText("Kayıt bulunamadı.")).toBeInTheDocument();
    expect(screen.queryByText("içerik")).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Tekrar Dene" }));
    expect(onRetry).toHaveBeenCalledTimes(1);
    expect(screen.getByRole("link", { name: /Geri Dön/ })).toHaveAttribute("href", "/list");
  });

  it("yüklendiğinde düzenle ve sil aksiyonlarını başlıkta tutar", () => {
    render(
      <MemoryRouter>
        <DetailPage title="Elektronik" subtitle="Kod: CAT-1" editTo="/edit" onDelete={() => undefined}>
          <p>içerik</p>
        </DetailPage>
      </MemoryRouter>
    );

    expect(screen.getByRole("heading", { name: "Elektronik" })).toBeInTheDocument();
    expect(screen.getByText("Kod: CAT-1")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Düzenle/ })).toHaveAttribute("href", "/edit");
    expect(screen.getByRole("button", { name: /Sil/ })).toBeInTheDocument();
    expect(screen.getByText("içerik")).toBeInTheDocument();
  });
});
