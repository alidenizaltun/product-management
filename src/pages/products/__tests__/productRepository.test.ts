import { describe, it, expect } from "vitest";
import { http, HttpResponse } from "msw";
import { server } from "@/tests/mocks/server";
import { config } from "@/infrastructure/config/appConfig";
import { productRepository } from "@/infrastructure/api/repositories";
import { mockProductDto, mockProductDetailDto } from "@/tests/mocks/fixtures";

const API_BASE = config.api.baseUrl.replace(/\/$/, "");

describe("productRepository", () => {
 // ─── getProducts ──────────────────────────────────────────────────────────

 describe("getProducts", () => {
 it("ürün listesini döndürür", async () => {
 const result = await productRepository.getProducts();
 expect(result.totalCount).toBe(1);
 expect(result.items[0].productCode).toBe("TEST-001");
 });

 it("dizi döndürülürse items olarak sarmalar", async () => {
 server.use(
 http.get(`${API_BASE}/api/products`, () =>
 HttpResponse.json([mockProductDto])
 )
 );
 const result = await productRepository.getProducts();
 expect(result.items).toHaveLength(1);
 expect(result.totalCount).toBe(1);
 });

 it("filtre parametrelerini query string'e ekler", async () => {
 let capturedUrl = "";
 server.use(
 http.get(`${API_BASE}/api/products`, ({ request }) => {
 capturedUrl = request.url;
 return HttpResponse.json({ items: [], totalCount: 0 });
 })
 );
 await productRepository.getProducts({ search: "Test", page: 2, pageSize: 10 });
 expect(capturedUrl).toContain("search=Test");
 expect(capturedUrl).toContain("page=2");
 expect(capturedUrl).toContain("pageSize=10");
 });
 });

 // ─── getProductById ───────────────────────────────────────────────────────

 describe("getProductById", () => {
 it("ID ile tek ürün döndürür", async () => {
 const result = await productRepository.getProductById(mockProductDto.id);
 expect(result.id).toBe("prod-001");
 expect(result.name).toBe("Test Ürünü");
 });

 it("bulunamazsa 404 hatası fırlatır", async () => {
 await expect(productRepository.getProductById("yok-id")).rejects.toMatchObject({
 statusCode: 404,
 });
 });
 });

 // ─── getProductDetail ─────────────────────────────────────────────────────

 describe("getProductDetail", () => {
 it("ürün detayını (variants, prices, inventories) döndürür", async () => {
 const result = await productRepository.getProductDetail(mockProductDetailDto.id);
 expect(result.variants).toHaveLength(2);
 expect(result.prices).toHaveLength(2);
 expect(result.inventories).toHaveLength(1);
 });

 it("fiziksel profil alanlarını içerir", async () => {
 const result = await productRepository.getProductDetail(mockProductDetailDto.id);
 expect(result.physicalProfile?.weight).toBe(1.5);
 expect(result.physicalProfile?.warrantyInMonths).toBe(24);
 });
 });

 // ─── createFullProduct ────────────────────────────────────────────────────

 describe("createFullProduct", () => {
 it("yeni ürün oluşturur ve ID döndürür", async () => {
 const payload = {
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
 { sku: "NEW-SKU-001", name: "Varyant 1", isActive: true },
 { sku: "NEW-SKU-002", name: "Varyant 2", isActive: true },
 ],
 prices: [
 { priceType: 1, amount: 100, currencyCode: "TRY" },
 ],
 };
 const result = await productRepository.createFullProduct(payload);
 expect(result.id).toBe("new-prod-001");
 });

 it("request body'de çoklu varyant gönderir", async () => {
 let capturedBody: unknown = null;
 server.use(
 http.post(`${API_BASE}/api/products/full`, async ({ request }) => {
 capturedBody = await request.json();
 return HttpResponse.json({ ...mockProductDto, id: "x" }, { status: 201 });
 })
 );
 await productRepository.createFullProduct({
 product: { productCode: "P", name: "P", kind: 1, status: 0, isActive: true, isSellable: true, isPurchasable: true, trackInventory: true, defaultCurrencyCode: "TRY" },
 variants: [
 { sku: "V1", name: "V1", isActive: true },
 { sku: "V2", name: "V2", isActive: true },
 { sku: "V3", name: "V3", isActive: true },
 ],
 });
 expect((capturedBody as { variants: unknown[] }).variants).toHaveLength(3);
 });
 });

 // ─── updateFullProduct ────────────────────────────────────────────────────

 describe("updateFullProduct", () => {
 it("mevcut ürünü günceller (204 döner)", async () => {
 // hata fırlatmaması başarı anlamına gelir
 await expect(
 productRepository.updateFullProduct("prod-001", {
 product: { productCode: "TEST-001", name: "Güncellendi", kind: 1, status: 0, isActive: true, isSellable: true, isPurchasable: true, trackInventory: true, defaultCurrencyCode: "TRY" },
 prices: [],
 variants: [],
 })
 ).resolves.toBeUndefined();
 });

 it("request body'de çoklu fiyat gönderir", async () => {
 let capturedBody: unknown = null;
 server.use(
 http.put(`${API_BASE}/api/products/:id/full`, async ({ request }) => {
 capturedBody = await request.json();
 return new HttpResponse(null, { status: 204 });
 })
 );
 await productRepository.updateFullProduct("prod-001", {
 product: { productCode: "P", name: "P", kind: 1, status: 0, isActive: true, isSellable: true, isPurchasable: true, trackInventory: true, defaultCurrencyCode: "TRY" },
 prices: [
 { priceType: 1, amount: 100, currencyCode: "TRY" },
 { priceType: 2, amount: 80, currencyCode: "TRY", minQuantity: 5 },
 { priceType: 2, amount: 70, currencyCode: "TRY", minQuantity: 10, customerGroupCode: "VIP" },
 ],
 });
 expect((capturedBody as { prices: unknown[] }).prices).toHaveLength(3);
 });
 });

 // ─── deleteProduct ────────────────────────────────────────────────────────

 describe("deleteProduct", () => {
 it("ürünü siler", async () => {
 await expect(productRepository.deleteProduct("prod-001")).resolves.toBeUndefined();
 });
 });
});
