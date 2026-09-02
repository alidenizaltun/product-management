import { http, HttpResponse } from "msw";
import { config } from "@/infrastructure/config/appConfig";
import {
 mockProductDto,
 mockProductDetailDto,
 mockAuthResponse,
 mockAttributeDefinition,
 mockCategory,
 mockIntegration,
 mockInventory,
 mockInventoryReservation,
 mockInventoryTransaction,
 mockAllLookups,
 mockLookupItem,
 mockPriceList,
 mockPriceListItem,
 mockPriceRevision,
 mockPriceRevisionLine,
 mockPriceRevisionExecutionResult,
 mockPricingTemplate,
 mockPricingTemplateUsage,
 mockApplyPricingTemplateResult,
 mockRegion,
 mockSupplier,
 mockSystemSetting,
 mockUnitDefinition,
 mockWarehouse,
 mockRole,
 mockPermissionDefinition,
 mockAdminUser,
} from "./fixtures";

const BASE = config.api.baseUrl.replace(/\/$/, "");

export const handlers = [
 // GET /api/products - liste
 http.get(`${BASE}/api/products`, () => {
 return HttpResponse.json({
 items: [mockProductDto],
 totalCount: 1,
 });
 }),

 // GET /api/products/:id
 http.get(`${BASE}/api/products/:id`, ({ params }) => {
 if (params.id === mockProductDto.id) {
 return HttpResponse.json(mockProductDto);
 }
 return HttpResponse.json({ message: "Ürün bulunamadı." }, { status: 404 });
 }),

 // GET /api/products/:id/detail
 http.get(`${BASE}/api/products/:id/detail`, ({ params }) => {
 if (params.id === mockProductDetailDto.id) {
 return HttpResponse.json(mockProductDetailDto);
 }
 return HttpResponse.json({ message: "Ürün bulunamadı." }, { status: 404 });
 }),

 // POST /api/products/full - yeni ürün oluştur
 http.post(`${BASE}/api/products/full`, async ({ request }) => {
 const body = await request.json() as Record<string, unknown>;
 return HttpResponse.json(
 { ...mockProductDto, id: "new-prod-001", name: (body as { product?: { name?: string } }).product?.name ?? "Yeni Ürün" },
 { status: 201 }
 );
 }),

 // PUT /api/products/:id/full - ürün güncelle
 http.put(`${BASE}/api/products/:id/full`, () => {
 return new HttpResponse(null, { status: 204 });
 }),

 // DELETE /api/products/:id
 http.delete(`${BASE}/api/products/:id`, () => {
 return new HttpResponse(null, { status: 204 });
 }),

 // ─── Auth ───────────────────────────────────────────────────────────────
 http.post(`${BASE}/api/auth/login`, () => HttpResponse.json(mockAuthResponse)),
 http.post(`${BASE}/api/auth/register`, () => HttpResponse.json(mockAuthResponse)),
 http.post(`${BASE}/api/auth/refresh`, () => HttpResponse.json(mockAuthResponse)),
 http.post(`${BASE}/api/auth/forgot-password`, () => new HttpResponse(null, { status: 204 })),
 http.post(`${BASE}/api/auth/reset-password`, () => HttpResponse.json(mockAuthResponse)),
 http.post(`${BASE}/api/auth/change-password`, () => HttpResponse.json(mockAuthResponse)),
 http.post(`${BASE}/api/auth/logout`, () => new HttpResponse(null, { status: 204 })),
 http.post(`${BASE}/api/auth/logout-all`, () => new HttpResponse(null, { status: 204 })),
 http.get(`${BASE}/api/auth/me`, () => HttpResponse.json(mockAuthResponse.user)),
 http.get(`${BASE}/api/auth/confirm-email`, () => new HttpResponse(null, { status: 204 })),

 // ─── Lookups ────────────────────────────────────────────────────────────
 http.get(`${BASE}/api/lookups`, () => HttpResponse.json(mockAllLookups)),
 http.get(`${BASE}/api/lookups/products`, () => HttpResponse.json([mockLookupItem])),
 http.get(`${BASE}/api/lookups/categories`, () => HttpResponse.json([mockLookupItem])),
 http.get(`${BASE}/api/lookups/warehouses`, () => HttpResponse.json([mockLookupItem])),
 http.get(`${BASE}/api/lookups/suppliers`, () => HttpResponse.json([mockLookupItem])),
 http.get(`${BASE}/api/lookups/price-lists`, () => HttpResponse.json([mockLookupItem])),
 http.get(`${BASE}/api/lookups/unit-definitions`, () => HttpResponse.json([mockLookupItem])),
 http.get(`${BASE}/api/lookups/regions`, () => HttpResponse.json([mockLookupItem])),

 // ─── Unit Definitions ───────────────────────────────────────────────────
 http.get(`${BASE}/api/unit-definitions`, () => HttpResponse.json([mockUnitDefinition])),
 http.get(`${BASE}/api/unit-definitions/:id`, ({ params }) => {
 if (params.id === mockUnitDefinition.id) return HttpResponse.json(mockUnitDefinition);
 return HttpResponse.json({ message: "Birim bulunamadı." }, { status: 404 });
 }),
 http.post(`${BASE}/api/unit-definitions`, () => HttpResponse.json(mockUnitDefinition, { status: 201 })),
 http.put(`${BASE}/api/unit-definitions/:id`, () => new HttpResponse(null, { status: 204 })),
 http.delete(`${BASE}/api/unit-definitions/:id`, () => new HttpResponse(null, { status: 204 })),

 // ─── Regions ────────────────────────────────────────────────────────────
 http.get(`${BASE}/api/regions`, () => HttpResponse.json([mockRegion])),
 http.get(`${BASE}/api/regions/:id`, ({ params }) => {
 if (params.id === mockRegion.id) return HttpResponse.json(mockRegion);
 return HttpResponse.json({ message: "Bölge bulunamadı." }, { status: 404 });
 }),
 http.post(`${BASE}/api/regions`, () => HttpResponse.json(mockRegion, { status: 201 })),
 http.put(`${BASE}/api/regions/:id`, () => new HttpResponse(null, { status: 204 })),
 http.delete(`${BASE}/api/regions/:id`, () => new HttpResponse(null, { status: 204 })),

 // ─── Identity: Users & Roles ────────────────────────────────────────────
 http.get(`${BASE}/api/users`, () => HttpResponse.json([mockAdminUser])),
 http.get(`${BASE}/api/users/:id`, ({ params }) => {
 if (params.id === mockAdminUser.id) return HttpResponse.json(mockAdminUser);
 return HttpResponse.json({ message: "Kullanıcı bulunamadı." }, { status: 404 });
 }),
 http.post(`${BASE}/api/users`, () => HttpResponse.json(mockAdminUser, { status: 201 })),
 http.put(`${BASE}/api/users/:id`, () => new HttpResponse(null, { status: 204 })),
 http.delete(`${BASE}/api/users/:id`, () => new HttpResponse(null, { status: 204 })),
 http.post(`${BASE}/api/users/:id/resend-invitation`, () => new HttpResponse(null, { status: 204 })),
 http.get(`${BASE}/api/roles`, () => HttpResponse.json([mockRole])),
 http.get(`${BASE}/api/roles/permissions/catalog`, () => HttpResponse.json([mockPermissionDefinition])),
 http.get(`${BASE}/api/roles/:id`, ({ params }) => {
 if (params.id === mockRole.id) return HttpResponse.json(mockRole);
 return HttpResponse.json({ message: "Rol bulunamadı." }, { status: 404 });
 }),
 http.post(`${BASE}/api/roles`, () => HttpResponse.json(mockRole, { status: 201 })),
 http.put(`${BASE}/api/roles/:id`, () => new HttpResponse(null, { status: 204 })),
 http.delete(`${BASE}/api/roles/:id`, () => new HttpResponse(null, { status: 204 })),

 // ─── System: Settings & Integrations ────────────────────────────────────
 http.get(`${BASE}/api/system-settings`, () => HttpResponse.json([mockSystemSetting])),
 http.put(`${BASE}/api/system-settings`, () => new HttpResponse(null, { status: 204 })),
 http.get(`${BASE}/api/integrations`, () => HttpResponse.json([mockIntegration])),
 http.get(`${BASE}/api/integrations/:id`, ({ params }) => {
 if (params.id === mockIntegration.id) return HttpResponse.json(mockIntegration);
 return HttpResponse.json({ message: "Entegrasyon bulunamadı." }, { status: 404 });
 }),
 http.post(`${BASE}/api/integrations`, () => HttpResponse.json(mockIntegration, { status: 201 })),
 http.put(`${BASE}/api/integrations/:id`, () => new HttpResponse(null, { status: 204 })),
 http.delete(`${BASE}/api/integrations/:id`, () => new HttpResponse(null, { status: 204 })),
 http.post(`${BASE}/api/integrations/:id/test`, () => HttpResponse.json({ ...mockIntegration, lastTestSucceeded: true })),

 // ─── Attributes ─────────────────────────────────────────────────────────
 http.get(`${BASE}/api/attributes`, () => HttpResponse.json([mockAttributeDefinition])),
 http.get(`${BASE}/api/attributes/:id`, ({ params }) => {
 if (params.id === mockAttributeDefinition.id) return HttpResponse.json(mockAttributeDefinition);
 return HttpResponse.json({ message: "Öznitelik bulunamadı." }, { status: 404 });
 }),
 http.post(`${BASE}/api/attributes`, () => HttpResponse.json(mockAttributeDefinition, { status: 201 })),
 http.put(`${BASE}/api/attributes/:id`, () => new HttpResponse(null, { status: 204 })),
 http.delete(`${BASE}/api/attributes/:id`, () => new HttpResponse(null, { status: 204 })),

 // ─── Catalog: Categories/Suppliers/Warehouses ───────────────────────────
 http.get(`${BASE}/api/catalog/categories`, () => HttpResponse.json([mockCategory])),
 http.get(`${BASE}/api/catalog/categories/:id`, ({ params }) => {
 if (params.id === mockCategory.id) return HttpResponse.json(mockCategory);
 return HttpResponse.json({ message: "Kategori bulunamadı." }, { status: 404 });
 }),
 http.post(`${BASE}/api/catalog/categories`, () => HttpResponse.json(mockCategory, { status: 201 })),
 http.put(`${BASE}/api/catalog/categories/:id`, () => new HttpResponse(null, { status: 204 })),
 http.delete(`${BASE}/api/catalog/categories/:id`, () => new HttpResponse(null, { status: 204 })),
 http.get(`${BASE}/api/catalog/suppliers`, () => HttpResponse.json([mockSupplier])),
 http.get(`${BASE}/api/catalog/suppliers/:id`, ({ params }) => {
 if (params.id === mockSupplier.id) return HttpResponse.json(mockSupplier);
 return HttpResponse.json({ message: "Tedarikçi bulunamadı." }, { status: 404 });
 }),
 http.post(`${BASE}/api/catalog/suppliers`, () => HttpResponse.json(mockSupplier, { status: 201 })),
 http.put(`${BASE}/api/catalog/suppliers/:id`, () => new HttpResponse(null, { status: 204 })),
 http.delete(`${BASE}/api/catalog/suppliers/:id`, () => new HttpResponse(null, { status: 204 })),
 http.get(`${BASE}/api/catalog/warehouses`, () => HttpResponse.json([mockWarehouse])),
 http.get(`${BASE}/api/catalog/warehouses/:id`, ({ params }) => {
 if (params.id === mockWarehouse.id) return HttpResponse.json(mockWarehouse);
 return HttpResponse.json({ message: "Depo bulunamadı." }, { status: 404 });
 }),
 http.post(`${BASE}/api/catalog/warehouses`, () => HttpResponse.json(mockWarehouse, { status: 201 })),
 http.put(`${BASE}/api/catalog/warehouses/:id`, () => new HttpResponse(null, { status: 204 })),
 http.delete(`${BASE}/api/catalog/warehouses/:id`, () => new HttpResponse(null, { status: 204 })),

 // ─── Inventory ──────────────────────────────────────────────────────────
 http.get(`${BASE}/api/inventory/inventories`, () => HttpResponse.json([mockInventory])),
 http.get(`${BASE}/api/inventory/inventories/:id`, ({ params }) => {
 if (params.id === mockInventory.id) return HttpResponse.json(mockInventory);
 return HttpResponse.json({ message: "Envanter bulunamadı." }, { status: 404 });
 }),
 http.get(`${BASE}/api/inventory/transactions`, () => HttpResponse.json([mockInventoryTransaction])),
 http.post(`${BASE}/api/inventory/transactions`, () => HttpResponse.json(mockInventoryTransaction, { status: 201 })),
 http.get(`${BASE}/api/inventory/reservations`, () => HttpResponse.json([mockInventoryReservation])),
 http.get(`${BASE}/api/inventory/reservations/:id`, ({ params }) => {
 if (params.id === mockInventoryReservation.id) return HttpResponse.json(mockInventoryReservation);
 return HttpResponse.json({ message: "Rezervasyon bulunamadı." }, { status: 404 });
 }),
 http.patch(`${BASE}/api/inventory/reservations/:id/status`, () => new HttpResponse(null, { status: 204 })),

 // ─── Pricing Templates ──────────────────────────────────────────────────
 http.get(`${BASE}/api/pricing-templates`, () => HttpResponse.json([mockPricingTemplate])),
 http.get(`${BASE}/api/pricing-templates/:id/usages`, () => HttpResponse.json([mockPricingTemplateUsage])),
 http.get(`${BASE}/api/pricing-templates/:id`, ({ params }) => {
 if (params.id === mockPricingTemplate.id) return HttpResponse.json(mockPricingTemplate);
 return HttpResponse.json({ message: "Şablon bulunamadı." }, { status: 404 });
 }),
 http.post(`${BASE}/api/pricing-templates`, () => HttpResponse.json(mockPricingTemplate, { status: 201 })),
 http.put(`${BASE}/api/pricing-templates/:id`, () => new HttpResponse(null, { status: 204 })),
 http.delete(`${BASE}/api/pricing-templates/:id`, () => new HttpResponse(null, { status: 204 })),
 http.post(`${BASE}/api/pricing-templates/:id/apply`, () => HttpResponse.json(mockApplyPricingTemplateResult)),
 http.post(`${BASE}/api/pricing-templates/:id/apply-bulk`, () => HttpResponse.json([mockApplyPricingTemplateResult])),
 http.post(`${BASE}/api/products/pricing-rules/:ruleId/save-as-template`, () => HttpResponse.json(mockPricingTemplate, { status: 201 })),

 // ─── Price Revisions ────────────────────────────────────────────────────
 http.get(`${BASE}/api/price-revisions`, () => HttpResponse.json([mockPriceRevision])),
 http.get(`${BASE}/api/price-revisions/:id/lines`, () => HttpResponse.json({ items: [mockPriceRevisionLine], totalCount: 1 })),
 http.get(`${BASE}/api/price-revisions/:id`, ({ params }) => {
 if (params.id === mockPriceRevision.id) return HttpResponse.json(mockPriceRevision);
 return HttpResponse.json({ message: "Revizyon bulunamadı." }, { status: 404 });
 }),
 http.post(`${BASE}/api/price-revisions`, () => HttpResponse.json(mockPriceRevision, { status: 201 })),
 http.put(`${BASE}/api/price-revisions/:id`, () => new HttpResponse(null, { status: 204 })),
 http.delete(`${BASE}/api/price-revisions/:id`, () => new HttpResponse(null, { status: 204 })),
 http.post(`${BASE}/api/price-revisions/:id/scopes`, () =>
 HttpResponse.json({ id: "scope-001", priceRevisionId: mockPriceRevision.id, scopeType: 1, isExclude: false }, { status: 201 })
 ),
 http.delete(`${BASE}/api/price-revisions/:id/scopes/:scopeId`, () => new HttpResponse(null, { status: 204 })),
 http.post(`${BASE}/api/price-revisions/:id/preview`, () =>
 HttpResponse.json({
 lineCount: 1, excludedLineCount: 0, productCount: 1,
 totalOldValue: 100, totalNewValue: 110, totalDifference: 10,
 breakdown: [], skippedRules: [],
 })
 ),
 http.patch(`${BASE}/api/price-revisions/:id/lines/:lineId`, () => new HttpResponse(null, { status: 204 })),
 http.post(`${BASE}/api/price-revisions/:id/submit`, () => new HttpResponse(null, { status: 204 })),
 http.post(`${BASE}/api/price-revisions/:id/approve`, () => new HttpResponse(null, { status: 204 })),
 http.post(`${BASE}/api/price-revisions/:id/reject`, () => new HttpResponse(null, { status: 204 })),
 http.post(`${BASE}/api/price-revisions/:id/cancel`, () => new HttpResponse(null, { status: 204 })),
 http.post(`${BASE}/api/price-revisions/:id/apply`, () => HttpResponse.json(mockPriceRevisionExecutionResult)),
 http.post(`${BASE}/api/price-revisions/:id/rollback`, () => HttpResponse.json(mockPriceRevisionExecutionResult)),

 // ─── Price Lists ────────────────────────────────────────────────────────
 http.get(`${BASE}/api/pricelists`, () => HttpResponse.json([mockPriceList])),
 http.get(`${BASE}/api/pricelists/:id/items`, () => HttpResponse.json([mockPriceListItem])),
 http.get(`${BASE}/api/pricelists/:id`, ({ params }) => {
 if (params.id === mockPriceList.id) return HttpResponse.json(mockPriceList);
 return HttpResponse.json({ message: "Fiyat listesi bulunamadı." }, { status: 404 });
 }),
 http.post(`${BASE}/api/pricelists`, () => HttpResponse.json(mockPriceList, { status: 201 })),
 http.put(`${BASE}/api/pricelists/:id`, () => new HttpResponse(null, { status: 204 })),
 http.delete(`${BASE}/api/pricelists/:id`, () => new HttpResponse(null, { status: 204 })),
];
