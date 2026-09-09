import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createMemoryRouter, RouterProvider } from "react-router-dom";
import { http, HttpResponse } from "msw";
import { server } from "@/tests/mocks/server";
import { config } from "@/infrastructure/config/appConfig";
import { mockAttributeDefinition, mockCategory, mockRegion } from "@/tests/mocks/fixtures";
import ClassificationPage from "@/pages/products/sections/ClassificationPage";
import RegionsPage from "@/pages/products/sections/RegionsPage";

const BASE = config.api.baseUrl.replace(/\/$/, "");

function renderSection(path: string, element: React.ReactElement) {
    const queryClient = new QueryClient({
        defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
    });
    const router = createMemoryRouter(
        [
            { path: "/product-info/classification", element },
            { path: "/product-info/regions", element },
            { path: "/definitions/categories/new", element: <div>Kategori tanım sayfası</div> },
            { path: "/definitions/attributes/new", element: <div>Özellik tanım sayfası</div> },
            { path: "/definitions/regions/new", element: <div>Bölge tanım sayfası</div> },
            { path: "/products", element: <div>Ürün listesi</div> },
            { path: "/products/:id", element: <div>Ürün özeti</div> },
        ],
        { initialEntries: [path] }
    );

    return {
        router,
        ...render(
            <QueryClientProvider client={queryClient}>
                <RouterProvider router={router} />
            </QueryClientProvider>
        ),
    };
}

describe("Sınıflandırma inline tanım modalları", () => {
    it("yeni kategori tanımını ayrı sayfaya gitmeden modalda oluşturup ürüne ekler", async () => {
        const categories = [mockCategory];
        server.use(
            http.get(`${BASE}/api/catalog/categories`, () => HttpResponse.json(categories)),
            http.get(`${BASE}/api/lookups/categories`, () =>
                HttpResponse.json(categories.map((item) => ({ id: item.id, name: item.name })))
            ),
            http.post(`${BASE}/api/catalog/categories`, async ({ request }) => {
                const body = (await request.json()) as { name: string };
                const created = { ...mockCategory, id: "cat-new-001", name: body.name };
                categories.push(created);
                return HttpResponse.json(created, { status: 201 });
            })
        );

        const { router } = renderSection(
            "/product-info/classification?productId=prod-001",
            <ClassificationPage />
        );

        const createCategory = await screen.findByRole("button", { name: "Yeni Kategori Tanımı" });
        expect(screen.queryByRole("link", { name: "Yeni Kategori Tanımı" })).not.toBeInTheDocument();

        await userEvent.click(createCategory);
        const dialog = await screen.findByRole("dialog");
        expect(within(dialog).getByRole("heading", { name: "Yeni Kategori Tanımı" })).toBeInTheDocument();
        expect(within(dialog).queryByText(/Kod sistem tarafından üretilir/)).not.toBeInTheDocument();
        expect(router.state.location.pathname).toBe("/product-info/classification");

        await userEvent.click(within(dialog).getByRole("button", { name: "Oluştur" }));
        expect(await within(dialog).findByText("Ad zorunludur")).toBeInTheDocument();
        expect(screen.getByRole("dialog")).toBeInTheDocument();

        await userEvent.type(within(dialog).getByLabelText(/^Ad/), "Modal Kategori");
        await userEvent.click(within(dialog).getByRole("button", { name: "Oluştur" }));

        await waitFor(() => {
            expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
        });
        expect(await screen.findByText("Kategori #2")).toBeInTheDocument();
        expect(await screen.findByText("Modal Kategori")).toBeInTheDocument();
        expect(router.state.location.pathname).toBe("/product-info/classification");
        expect(screen.queryByText("Kategori tanım sayfası")).not.toBeInTheDocument();
    });

    it("yeni özellik tanımını modalda oluşturup ürüne ekler", async () => {
        const definitions = [mockAttributeDefinition];
        server.use(
            http.get(`${BASE}/api/attributes`, () => HttpResponse.json(definitions)),
            http.post(`${BASE}/api/attributes`, async ({ request }) => {
                const body = (await request.json()) as { key: string; displayName: string };
                const created = {
                    ...mockAttributeDefinition,
                    id: "attr-new-001",
                    key: body.key,
                    displayName: body.displayName,
                };
                definitions.push(created);
                return HttpResponse.json(created, { status: 201 });
            })
        );

        const { router } = renderSection(
            "/product-info/classification?productId=prod-001",
            <ClassificationPage />
        );

        const createAttribute = await screen.findByRole("button", { name: "Yeni Özellik Tanımı" });
        await userEvent.click(createAttribute);

        const dialog = await screen.findByRole("dialog");
        await userEvent.type(within(dialog).getByLabelText(/Anahtar/), "finish");
        await userEvent.type(within(dialog).getByLabelText(/Görünen Ad/), "Yüzey");
        await userEvent.click(within(dialog).getByRole("button", { name: "Oluştur" }));

        await waitFor(() => {
            expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
        });
        expect(await screen.findByText("Özellik #3")).toBeInTheDocument();
        expect(await screen.findByText("Yüzey")).toBeInTheDocument();
        expect(router.state.location.pathname).toBe("/product-info/classification");
        expect(screen.queryByText("Özellik tanım sayfası")).not.toBeInTheDocument();
    });
});

describe("Bölgeler inline tanım modalı", () => {
    it("yeni bölge tanımını ayrı sayfaya gitmeden modalda oluşturup ürüne ekler", async () => {
        const regions = [mockRegion];
        server.use(
            http.get(`${BASE}/api/regions`, () => HttpResponse.json(regions)),
            http.get(`${BASE}/api/lookups/regions`, () =>
                HttpResponse.json(regions.map((item) => ({ id: item.id, name: item.name })))
            ),
            http.post(`${BASE}/api/regions`, async ({ request }) => {
                const body = (await request.json()) as { name: string };
                const created = { ...mockRegion, id: "region-new-001", name: body.name };
                regions.push(created);
                return HttpResponse.json(created, { status: 201 });
            })
        );

        const { router } = renderSection(
            "/product-info/regions?productId=prod-001",
            <RegionsPage />
        );

        const createRegion = await screen.findByRole("button", { name: "Yeni Bölge Tanımı" });
        expect(screen.queryByRole("link", { name: "Yeni Bölge Tanımı" })).not.toBeInTheDocument();

        await userEvent.click(createRegion);
        const dialog = await screen.findByRole("dialog");
        expect(within(dialog).getByRole("heading", { name: "Yeni Bölge Tanımı" })).toBeInTheDocument();
        expect(within(dialog).queryByText(/Kod sistem tarafından üretilir/)).not.toBeInTheDocument();
        expect(within(dialog).queryByLabelText(/^Sıra/)).not.toBeInTheDocument();

        await userEvent.type(within(dialog).getByLabelText(/^Ad/), "Ege");
        await userEvent.click(within(dialog).getByRole("button", { name: "Oluştur" }));

        await waitFor(() => {
            expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
        });
        expect(await screen.findByText("Bölge #1")).toBeInTheDocument();
        expect(await screen.findByText("Ege")).toBeInTheDocument();
        expect(router.state.location.pathname).toBe("/product-info/regions");
        expect(screen.queryByText("Bölge tanım sayfası")).not.toBeInTheDocument();
    });

    it("hızlı ekleme formunda Sıra alanı göstermez", async () => {
        renderSection("/product-info/regions?productId=prod-001", <RegionsPage />);

        await userEvent.click(await screen.findByRole("button", { name: "Yeni Bölge Tanımı" }));
        const dialog = await screen.findByRole("dialog");

        expect(within(dialog).queryByLabelText(/^Sıra/)).not.toBeInTheDocument();
        expect(within(dialog).queryByRole("spinbutton")).not.toBeInTheDocument();
    });
});
