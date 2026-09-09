import React from "react";
import { describe, expect, it } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createMemoryRouter, RouterProvider } from "react-router-dom";
import { http, HttpResponse } from "msw";
import { config } from "@/infrastructure/config/appConfig";
import { server } from "@/tests/mocks/server";
import CategoryFormPage from "@/pages/catalog/CategoryFormPage";
import RegionFormPage from "@/pages/catalog/RegionFormPage";
import SupplierFormPage from "@/pages/catalog/SupplierFormPage";
import WarehouseFormPage from "@/pages/catalog/WarehouseFormPage";
import UnitDefinitionFormPage from "@/pages/catalog/UnitDefinitionFormPage";
import PriceListFormPage from "@/pages/pricing/PriceListFormPage";

const BASE = config.api.baseUrl.replace(/\/$/, "");

const CODE_GENERATION_COPY = /sistem tarafından üretilir|Kod sistem/;

function expectNoCodeGenerationCopy() {
  expect(screen.queryByText(CODE_GENERATION_COPY)).not.toBeInTheDocument();
}

function renderCreateForm(formPath: string, listPath: string, element: React.ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  const router = createMemoryRouter(
    [
      { path: formPath, element },
      { path: listPath, element: <div>Liste</div> },
    ],
    { initialEntries: [formPath] }
  );

  return render(
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  );
}

describe("Create form code-generation copy", () => {
  it("kategori oluşturma sayfasında kod üretim cümlesini göstermez ve kaydeder", async () => {
    let created: Record<string, unknown> | undefined;
    server.use(
      http.post(`${BASE}/api/catalog/categories`, async ({ request }) => {
        created = (await request.json()) as Record<string, unknown>;
        return HttpResponse.json({ id: "cat-new", name: created.name, code: "CAT-000099" }, { status: 201 });
      })
    );

    renderCreateForm("/definitions/categories/new", "/definitions/categories", <CategoryFormPage />);

    expect(screen.getByRole("heading", { name: "Yeni Kategori" })).toBeInTheDocument();
    expect(screen.getByText("Kategori bilgilerini girin.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "İptal" })).toHaveClass("btn-outline-light");
    expect(screen.getByRole("button", { name: "Kaydet" })).toHaveClass("btn-primary");
    expectNoCodeGenerationCopy();
    expect(screen.queryByLabelText(/^Kod/)).not.toBeInTheDocument();

    await userEvent.type(screen.getByLabelText(/^Ad/), "Yeni Kategori");
    await userEvent.click(screen.getByRole("button", { name: "Kaydet" }));

    await waitFor(() => {
      expect(created).toEqual({ name: "Yeni Kategori" });
    });
  });

  it("bölge oluşturma sayfasında kod üretim cümlesini göstermez ve kaydeder", async () => {
    let created: Record<string, unknown> | undefined;
    server.use(
      http.post(`${BASE}/api/regions`, async ({ request }) => {
        created = (await request.json()) as Record<string, unknown>;
        return HttpResponse.json({ id: "region-new", name: created.name, code: "REG-000099" }, { status: 201 });
      })
    );

    renderCreateForm("/definitions/regions/new", "/definitions/regions", <RegionFormPage />);

    expect(screen.getByRole("heading", { name: "Yeni Bölge Tanımı" })).toBeInTheDocument();
    expect(screen.getByText("Satış bölgesi tanımlayın (Türkiye, Almanya, Marmara vb.)")).toBeInTheDocument();
    expectNoCodeGenerationCopy();
    expect(screen.queryByLabelText(/^Sıra/)).not.toBeInTheDocument();

    await userEvent.type(screen.getByLabelText(/^Ad/), "Ege");
    await userEvent.click(screen.getByRole("button", { name: "Kaydet" }));

    await waitFor(() => {
      expect(created).toMatchObject({ name: "Ege", sortOrder: 0 });
      expect(created).not.toHaveProperty("code");
    });
  });

  it("tedarikçi oluşturma sayfasında kod üretim cümlesini göstermez ve kaydeder", async () => {
    let created: Record<string, unknown> | undefined;
    server.use(
      http.post(`${BASE}/api/catalog/suppliers`, async ({ request }) => {
        created = (await request.json()) as Record<string, unknown>;
        return HttpResponse.json({ id: "sup-new", name: created.name, supplierCode: "SUP-000099" }, { status: 201 });
      })
    );

    renderCreateForm("/definitions/suppliers/new", "/definitions/suppliers", <SupplierFormPage />);

    expect(screen.getByRole("heading", { name: "Yeni Tedarikçi" })).toBeInTheDocument();
    expectNoCodeGenerationCopy();

    await userEvent.type(screen.getByPlaceholderText("Tedarikçi adı"), "Acme");
    await userEvent.click(screen.getByRole("button", { name: "Kaydet" }));

    await waitFor(() => {
      expect(created).toMatchObject({ name: "Acme", isActive: true });
      expect(created).not.toHaveProperty("supplierCode");
    });
  });

  it("depo oluşturma sayfasında kod üretim cümlesini göstermez ve kaydeder", async () => {
    let created: Record<string, unknown> | undefined;
    server.use(
      http.post(`${BASE}/api/catalog/warehouses`, async ({ request }) => {
        created = (await request.json()) as Record<string, unknown>;
        return HttpResponse.json({ id: "wh-new", name: created.name, code: "WH-000099" }, { status: 201 });
      })
    );

    renderCreateForm("/definitions/warehouses/new", "/definitions/warehouses", <WarehouseFormPage />);

    expect(screen.getByRole("heading", { name: "Yeni Depo" })).toBeInTheDocument();
    expectNoCodeGenerationCopy();

    await userEvent.type(screen.getByPlaceholderText("Depo adı"), "Merkez Depo");
    await userEvent.click(screen.getByRole("button", { name: "Kaydet" }));

    await waitFor(() => {
      expect(created).toMatchObject({ name: "Merkez Depo", isActive: true });
      expect(created).not.toHaveProperty("code");
    });
  });

  it("birim tanımı oluşturma sayfasında kod üretim cümlesini göstermez ve kaydeder", async () => {
    let created: Record<string, unknown> | undefined;
    server.use(
      http.post(`${BASE}/api/unit-definitions`, async ({ request }) => {
        created = (await request.json()) as Record<string, unknown>;
        return HttpResponse.json({ id: "unit-new", name: created.name, code: "UNIT-000099" }, { status: 201 });
      })
    );

    renderCreateForm("/definitions/software-units/new", "/definitions/software-units", <UnitDefinitionFormPage />);

    expect(screen.getByRole("heading", { name: "Yeni Birim Tanımı" })).toBeInTheDocument();
    expect(
      screen.getByText("Ürün ve fiyatlandırma birimlerini tanımlayın (Adet, Kullanıcı, Lisans, vb.)")
    ).toBeInTheDocument();
    expectNoCodeGenerationCopy();
    expect(screen.queryByLabelText(/^Sıra/)).not.toBeInTheDocument();

    await userEvent.type(screen.getByLabelText(/^Ad/), "Adet");
    await userEvent.click(screen.getByRole("button", { name: "Kaydet" }));

    await waitFor(() => {
      expect(created).toMatchObject({ name: "Adet", sortOrder: 0 });
      expect(created).not.toHaveProperty("code");
    });
  });

  it("fiyat listesi oluşturma sayfasında kod üretim cümlesini göstermez ve kaydeder", async () => {
    let created: Record<string, unknown> | undefined;
    server.use(
      http.post(`${BASE}/api/pricelists`, async ({ request }) => {
        created = (await request.json()) as Record<string, unknown>;
        return HttpResponse.json({ id: "pl-new", name: created.name, code: "PL-000099" }, { status: 201 });
      })
    );

    renderCreateForm("/pricing/price-lists/new", "/pricing/price-lists", <PriceListFormPage />);

    expect(screen.getByRole("heading", { name: "Yeni Fiyat Listesi" })).toBeInTheDocument();
    expectNoCodeGenerationCopy();

    await userEvent.type(screen.getByLabelText(/^Ad/), "Bayi Listesi");
    await userEvent.click(screen.getByRole("button", { name: "Kaydet" }));

    await waitFor(() => {
      expect(created).toMatchObject({ name: "Bayi Listesi" });
      expect(created).not.toHaveProperty("code");
    });
  });
});
