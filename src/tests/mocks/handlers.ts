import { http, HttpResponse } from "msw";
import { mockProductDto, mockProductDetailDto } from "./fixtures";

const BASE = "https://pmapi.godeva.com.tr";

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
];
