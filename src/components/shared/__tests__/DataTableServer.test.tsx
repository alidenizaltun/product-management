import React from "react";
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import DataTableServer, { DataColumn } from "@/components/shared/DataTableServer";

type Row = { id: string; name: string };

const columns: DataColumn<Row>[] = [
  { key: "name", title: "Ad", render: (it) => it.name },
  {
    key: "actions",
    title: "İşlemler",
    className: "nk-tb-col-tools",
    render: (it) => (
      <ul className="nk-tb-actions gx-1 justify-content-end">
        <li>
          <button type="button" className="btn btn-icon btn-trigger" title="Detay">
            {it.name} detay
          </button>
        </li>
      </ul>
    ),
  },
];

const baseProps = {
  columns,
  page: 1,
  pageSize: 10,
  onPageChange: vi.fn(),
  emptyTitle: "Henüz kayıt yok",
  emptyDescription: "İlk kaydı ekleyerek başlayın.",
  emptyIcon: "inbox",
  rowKey: (it: Row) => it.id,
};

describe("DataTableServer", () => {
  it("yüklenirken tablo iskeleti gösterir, boş durum ve ham yükleme metni göstermez", () => {
    const { container } = render(
      <DataTableServer
        {...baseProps}
        items={[]}
        totalItems={0}
        isLoading
        emptyAction={<button type="button">Yeni Kayıt</button>}
      />
    );

    expect(container.querySelector(".placeholder-glow")).toBeInTheDocument();
    expect(container.querySelector(".nk-tb-list")).toBeInTheDocument();
    expect(screen.queryByText("Henüz kayıt yok")).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Yeni Kayıt" })).not.toBeInTheDocument();
    expect(container.querySelector(".spinner-border")).not.toBeInTheDocument();
    expect(screen.getByRole("status", { name: "Yükleniyor..." })).toBeInTheDocument();
    expect(screen.queryByText("Yükleniyor...")).not.toBeInTheDocument();
  });

  it("boş listede EmptyState ve aksiyonu gösterir, sayfalama göstermez", async () => {
    const user = userEvent.setup();
    const onCreate = vi.fn();

    const { container } = render(
      <DataTableServer
        {...baseProps}
        items={[]}
        totalItems={0}
        isLoading={false}
        emptyAction={
          <button type="button" onClick={onCreate}>
            Yeni Kayıt
          </button>
        }
      />
    );

    expect(screen.getByText("Henüz kayıt yok")).toBeInTheDocument();
    expect(screen.getByText("İlk kaydı ekleyerek başlayın.")).toBeInTheDocument();
    expect(container.querySelector(".placeholder-glow")).not.toBeInTheDocument();
    expect(container.querySelector(".nk-tb-head")).toBeInTheDocument();
    expect(container.querySelector(".dataTables_info")).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Yeni Kayıt" }));
    expect(onCreate).toHaveBeenCalledTimes(1);
  });

  it("satırları, işlem kolonunu ve sayfalamayı gösterir", () => {
    const { container } = render(
      <DataTableServer
        {...baseProps}
        items={[
          { id: "1", name: "Alfa" },
          { id: "2", name: "Beta" },
        ]}
        totalItems={12}
        isLoading={false}
      />
    );

    expect(screen.getByText("Alfa")).toBeInTheDocument();
    expect(screen.getByText("Beta")).toBeInTheDocument();
    const actionButtons = screen.getAllByTitle("Detay");
    expect(actionButtons).toHaveLength(2);
    expect(actionButtons[0]).toHaveClass("btn-trigger");
    expect(container.querySelector(".nk-tb-actions")).toBeInTheDocument();
    expect(container.querySelector(".nk-tb-col-tools.text-end")).toBeInTheDocument();
    expect(container.querySelector(".nk-tb-list.is-compact")).toBeInTheDocument();
    expect(container.querySelector(".dataTables_info")).toHaveTextContent("1 - 10 of 12");
  });
});
