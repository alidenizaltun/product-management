import React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { http, HttpResponse } from "msw";
import { server } from "@/tests/mocks/server";
import { config } from "@/infrastructure/config/appConfig";
import { mockProductDto } from "@/tests/mocks/fixtures";
import ProductPicker from "@/pages/products/components/ProductPicker";
import {
    readRecentProducts,
    rememberRecentProduct,
} from "@/pages/products/utils/recentProducts";

const API_BASE = config.api.baseUrl.replace(/\/$/, "");
const STORAGE_KEY = "general";

const liveRecent = {
    id: mockProductDto.id,
    name: mockProductDto.name,
    productCode: mockProductDto.productCode,
    kind: mockProductDto.kind,
};
const deletedRecent = {
    id: "prod-deleted",
    name: "Silinmiş Ürün",
    productCode: "GONE-1",
    kind: 1,
};
const softwareRecent = {
    id: "prod-software",
    name: "Yazılım Ürünü",
    productCode: "SW-1",
    kind: 2,
};

function renderPicker(props?: Partial<React.ComponentProps<typeof ProductPicker>>) {
    const queryClient = new QueryClient({
        defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
    });
    const onChange = vi.fn();

    const view = render(
        <QueryClientProvider client={queryClient}>
            <ProductPicker
                allowedKinds={[1]}
                value={null}
                onChange={onChange}
                storageKey={STORAGE_KEY}
                {...props}
            />
        </QueryClientProvider>
    );

    return { ...view, onChange };
}

describe("ProductPicker recents", () => {
    beforeEach(() => {
        window.localStorage.clear();
        server.use(
            http.get(`${API_BASE}/api/lookups/products`, () =>
                HttpResponse.json([
                    { id: liveRecent.id, name: liveRecent.name },
                    { id: softwareRecent.id, name: softwareRecent.name },
                ])
            )
        );
    });

    afterEach(() => {
        window.localStorage.clear();
    });

    it("silinmiş ürünü Son kullanılanlar'da göstermez ve localStorage'dan siler", async () => {
        rememberRecentProduct(STORAGE_KEY, deletedRecent);
        rememberRecentProduct(STORAGE_KEY, liveRecent);

        renderPicker();
        await userEvent.click(screen.getByPlaceholderText("Ürün adı veya kodu ile ara…"));

        expect(await screen.findByText("Son kullanılanlar")).toBeInTheDocument();
        expect(screen.getAllByText(liveRecent.name).length).toBeGreaterThan(0);
        expect(screen.queryByText(deletedRecent.name)).not.toBeInTheDocument();

        await waitFor(() => {
            expect(readRecentProducts(STORAGE_KEY).map((item) => item.id)).toEqual([liveRecent.id]);
        });
    });

    it("canlı son kullanılanı seçilebilir bırakır", async () => {
        rememberRecentProduct(STORAGE_KEY, liveRecent);

        const { onChange } = renderPicker();
        await userEvent.click(screen.getByPlaceholderText("Ürün adı veya kodu ile ara…"));

        const recentButtons = await screen.findAllByRole("button", { name: new RegExp(liveRecent.name) });
        await userEvent.click(recentButtons[0]);

        expect(onChange).toHaveBeenCalledWith(liveRecent.id);
        expect(readRecentProducts(STORAGE_KEY)[0]?.id).toBe(liveRecent.id);
    });

    it("arama sayfasında olmasa da katalogdaki canlı recent'i gösterir", async () => {
        rememberRecentProduct(STORAGE_KEY, liveRecent);
        server.use(
            http.get(`${API_BASE}/api/products`, () => HttpResponse.json({ items: [], totalCount: 0 }))
        );

        renderPicker();
        await userEvent.click(screen.getByPlaceholderText("Ürün adı veya kodu ile ara…"));

        expect(await screen.findByText("Son kullanılanlar")).toBeInTheDocument();
        expect(screen.getByText(liveRecent.name)).toBeInTheDocument();
        expect(readRecentProducts(STORAGE_KEY).map((item) => item.id)).toEqual([liveRecent.id]);
    });

    it("katalog isteği başarısız olursa recents'i silinmiş saymaz", async () => {
        rememberRecentProduct(STORAGE_KEY, liveRecent);
        rememberRecentProduct(STORAGE_KEY, deletedRecent);
        server.use(
            http.get(`${API_BASE}/api/lookups/products`, () =>
                HttpResponse.json({ message: "lookup hatası" }, { status: 500 })
            )
        );

        renderPicker();
        await userEvent.click(screen.getByPlaceholderText("Ürün adı veya kodu ile ara…"));

        expect(await screen.findByText("Son kullanılanlar")).toBeInTheDocument();
        expect(screen.getByText(deletedRecent.name)).toBeInTheDocument();
        expect(readRecentProducts(STORAGE_KEY).map((item) => item.id)).toEqual([
            deletedRecent.id,
            liveRecent.id,
        ]);
    });

    it("izin verilen tip dışındaki canlı recents'i gizler ama unutmaz", async () => {
        rememberRecentProduct(STORAGE_KEY, softwareRecent);
        rememberRecentProduct(STORAGE_KEY, liveRecent);

        renderPicker();
        await userEvent.click(screen.getByPlaceholderText("Ürün adı veya kodu ile ara…"));

        expect(await screen.findByText("Son kullanılanlar")).toBeInTheDocument();
        expect(screen.getAllByText(liveRecent.name).length).toBeGreaterThan(0);
        expect(screen.queryByText(softwareRecent.name)).not.toBeInTheDocument();

        await waitFor(() => {
            expect(readRecentProducts(STORAGE_KEY).map((item) => item.id)).toEqual([
                liveRecent.id,
                softwareRecent.id,
            ]);
        });
    });
});
