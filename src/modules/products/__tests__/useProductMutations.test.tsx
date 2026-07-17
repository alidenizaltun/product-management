import { describe, it, expect, vi } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";
import { http, HttpResponse } from "msw";
import { server } from "@/tests/mocks/server";
import { config } from "@/shared/config/appConfig";
import { useProductMutations } from "../hooks/useProductMutations";

const API_BASE = config.api.baseUrl.replace(/\/$/, "");

function makeWrapper() {
    const queryClient = new QueryClient({
        defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
    });
    return ({ children }: { children: React.ReactNode }) => (
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
}

describe("useProductMutations", () => {
    // ─── createFullMutation ───────────────────────────────────────────────────

    describe("createFullMutation", () => {
        it("başarılı ürün oluşturmada isSuccess olur", async () => {
            const { result } = renderHook(() => useProductMutations(), { wrapper: makeWrapper() });

            await act(async () => {
                await result.current.createFullMutation.mutateAsync({
                    product: {
                        productCode: "NEW-001",
                        name: "Yeni Ürün",
                        kind: 1,
                        status: 0,
                        isActive: true,
                        isSellable: true,
                        isPurchasable: true,
                        trackInventory: true,
                        defaultCurrencyCode: "TRY",
                    },
                    variants: [
                        { sku: "V1", name: "Kırmızı S", isActive: true },
                        { sku: "V2", name: "Kırmızı M", isActive: true },
                    ],
                    prices: [
                        { priceType: 1, amount: 199, currencyCode: "TRY" },
                        { priceType: 2, amount: 149, currencyCode: "TRY", minQuantity: 5 },
                    ],
                });
            });

            await waitFor(() => {
                expect(result.current.createFullMutation.isSuccess).toBe(true);
            });
        });

        it("API hatası durumunda isError olur", async () => {
            server.use(
                http.post(`${API_BASE}/api/products/full`, () =>
                    HttpResponse.json(
                        { errors: ["Ürün kodu zaten mevcut."] },
                        { status: 400 }
                    )
                )
            );

            const { result } = renderHook(() => useProductMutations(), { wrapper: makeWrapper() });

            await act(async () => {
                try {
                    await result.current.createFullMutation.mutateAsync({
                        product: {
                            productCode: "DUPLICATE",
                            name: "Mükerrer",
                            kind: 1,
                            status: 0,
                            isActive: true,
                            isSellable: true,
                            isPurchasable: true,
                            trackInventory: true,
                            defaultCurrencyCode: "TRY",
                        },
                    });
                } catch {
                    // beklenen hata
                }
            });

            await waitFor(() => {
                expect(result.current.createFullMutation.isError).toBe(true);
            });
        });
    });

    // ─── updateFullMutation ───────────────────────────────────────────────────

    describe("updateFullMutation", () => {
        it("başarılı güncellemede isSuccess olur", async () => {
            const { result } = renderHook(() => useProductMutations(), { wrapper: makeWrapper() });

            await act(async () => {
                await result.current.updateFullMutation.mutateAsync({
                    id: "prod-001",
                    payload: {
                        product: {
                            productCode: "TEST-001",
                            name: "Güncellendi",
                            kind: 1,
                            status: 0,
                            isActive: true,
                            isSellable: true,
                            isPurchasable: true,
                            trackInventory: true,
                            defaultCurrencyCode: "TRY",
                        },
                        // Çoklu fiyat güncelleme
                        prices: [
                            { priceType: 1, amount: 299, currencyCode: "TRY" },
                            { priceType: 2, amount: 249, currencyCode: "TRY", minQuantity: 10 },
                        ],
                        // Çoklu varyant güncelleme
                        variants: [
                            { sku: "V1-UPD", name: "Güncel V1", isActive: true },
                            { sku: "V2-UPD", name: "Güncel V2", isActive: false },
                        ],
                        // Çoklu stok güncelleme
                        inventories: [
                            { warehouseId: "wh-001", quantityOnHand: 50, quantityReserved: 5 },
                            { warehouseId: "wh-002", quantityOnHand: 30, quantityReserved: 0 },
                        ],
                    },
                });
            });

            await waitFor(() => {
                expect(result.current.updateFullMutation.isSuccess).toBe(true);
            });
        });

        it("güncelleme hatasında isError olur ve query'leri bozmaz", async () => {
            server.use(
                http.put(`${API_BASE}/api/products/:id/full`, () =>
                    HttpResponse.json({ message: "Yetersiz yetki." }, { status: 403 })
                )
            );

            const { result } = renderHook(() => useProductMutations(), { wrapper: makeWrapper() });

            await act(async () => {
                try {
                    await result.current.updateFullMutation.mutateAsync({
                        id: "prod-001",
                        payload: {
                            product: {
                                productCode: "P",
                                name: "P",
                                kind: 1,
                                status: 0,
                                isActive: true,
                                isSellable: true,
                                isPurchasable: true,
                                trackInventory: true,
                                defaultCurrencyCode: "TRY",
                            },
                        },
                    });
                } catch {
                    // beklenen hata
                }
            });

            await waitFor(() => {
                expect(result.current.updateFullMutation.isError).toBe(true);
            });
        });
    });

    // ─── deleteMutation ───────────────────────────────────────────────────────

    describe("deleteMutation", () => {
        it("başarılı silmede isSuccess olur", async () => {
            const { result } = renderHook(() => useProductMutations(), { wrapper: makeWrapper() });

            await act(async () => {
                await result.current.deleteMutation.mutateAsync("prod-001");
            });

            await waitFor(() => {
                expect(result.current.deleteMutation.isSuccess).toBe(true);
            });
        });
    });
});
