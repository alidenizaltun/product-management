import React from "react";
import { describe, expect, it } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createMemoryRouter, RouterProvider } from "react-router-dom";
import { http, HttpResponse } from "msw";
import { config } from "@/infrastructure/config/appConfig";
import { server } from "@/tests/mocks/server";
import { mockPriceRevision } from "@/tests/mocks/fixtures";
import PriceRevisionFormPage from "@/pages/pricing/PriceRevisionFormPage";

const BASE = config.api.baseUrl.replace(/\/$/, "");

function renderRevisionForm(path = "/pricing/revisions/new") {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  const router = createMemoryRouter(
    [
      { path: "/pricing/revisions/new", element: <PriceRevisionFormPage /> },
      { path: "/pricing/revisions/:id/edit", element: <PriceRevisionFormPage /> },
      { path: "/pricing/revisions/:id", element: <div>Revizyon detay</div> },
      { path: "/pricing/revisions", element: <div>Revizyon listesi</div> },
    ],
    { initialEntries: [path] }
  );

  return render(
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  );
}

describe("PriceRevisionFormPage shell", () => {
  it("paylaşılan alanlarla zam oluşturur; ham label yığını kullanmaz", async () => {
    const user = userEvent.setup();
    let created: Record<string, unknown> | undefined;
    server.use(
      http.post(`${BASE}/api/price-revisions`, async ({ request }) => {
        created = (await request.json()) as Record<string, unknown>;
        return HttpResponse.json(mockPriceRevision, { status: 201 });
      })
    );

    renderRevisionForm();

    expect(screen.getByRole("heading", { name: "Yeni Zam" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "İptal" })).toHaveClass("btn-outline-light");
    expect(screen.getByRole("button", { name: "Devam Et" })).toHaveClass("btn-primary");
    expect(screen.queryByText(/sistem tarafından üretilir/i)).not.toBeInTheDocument();

    expect(screen.getByLabelText(/^Ad/)).toBeInTheDocument();
    expect(screen.getByLabelText("Zam türü")).toBeInTheDocument();
    expect(screen.getByLabelText(/^Değer/)).toBeInTheDocument();
    expect(screen.getByLabelText("Yuvarlama")).toBeInTheDocument();
    expect(screen.getByLabelText("Yuvarlama adımı")).toBeInTheDocument();
    expect(screen.getByLabelText("Geçerlilik tarihi")).toBeInTheDocument();
    expect(screen.getByLabelText("Açıklama")).toBeInTheDocument();

    await user.type(screen.getByLabelText(/^Ad/), "2026 Temmuz genel zam");
    await user.click(screen.getByRole("button", { name: "Devam Et" }));

    await waitFor(() => {
      expect(created).toMatchObject({
        name: "2026 Temmuz genel zam",
        adjustmentType: 1,
        value: 15,
      });
    });
    expect(created).not.toHaveProperty("code");
  });
});
