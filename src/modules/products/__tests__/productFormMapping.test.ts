/**
 * ProductFormPage içindeki mapProductToForm mantığını izole test eder.
 * Form değerlerine doğru map edilip edilmediğini kontrol eder.
 */
import { describe, it, expect } from "vitest";
import { mockProductDetailDto, mockSoftwareProductDetail } from "@/tests/mocks/fixtures";

// mapProductToForm doğrudan export edilmediği için mantığı burada kopyalıyoruz.
// Alternatif: fonksiyonu ayrı bir utils dosyasına taşıyıp export etmek.
// Bu test aynı zamanda o refactoring'in yapılması gerektiğini gösterir.

function mapProductToFormSimple(product: typeof mockProductDetailDto) {
    return {
        productCode: product.productCode ?? "",
        name: product.name ?? "",
        kind: product.kind ?? 1,
        isActive: Boolean(product.isActive),
        defaultCurrencyCode: product.defaultCurrencyCode ?? "TRY",
        attributeValues: (product.attributeValues ?? []).map((av) => ({
            attributeDefinitionId: av.attributeDefinitionId,
            valueText: av.valueText ?? "",
        })),
        variants: (product.variants ?? []).map((v) => ({
            sku: v.sku,
            name: v.name,
            optionValuesJson: v.optionValuesJson,
            additionalPrice: v.additionalPrice,
            isActive: v.isActive,
        })),
        prices: (product.prices ?? []).map((p) => ({
            priceType: p.priceType,
            amount: p.amount,
            currencyCode: p.currencyCode,
            minQuantity: p.minQuantity,
            customerGroupCode: p.customerGroupCode,
        })),
        inventories: (product.inventories ?? []).map((inv) => ({
            warehouseId: inv.warehouseId,
            quantityOnHand: inv.quantityOnHand,
            quantityReserved: inv.quantityReserved,
        })),
        supplierMaps: (product.supplierMaps ?? []).map((sm) => ({
            productSupplierId: sm.productSupplierId,
            supplierCost: sm.supplierCost,
            isPreferred: sm.isPreferred,
        })),
        physicalProfile: product.physicalProfile
            ? {
                weight: product.physicalProfile.weight,
                warrantyInMonths: product.physicalProfile.warrantyInMonths,
                requiresShipping: product.physicalProfile.requiresShipping,
            }
            : undefined,
        modules: (product.modules ?? []).map((m) => ({
            moduleCode: m.moduleCode,
            name: m.name,
            additionalPrice: m.additionalPrice,
            isActive: m.isActive,
        })),
        licenseOfferings: (product.licenseOfferings ?? []).map((lo) => ({
            id: lo.id,
            name: lo.name,
            basePrice: lo.basePrice,
            isActive: lo.isActive,
        })),
    };
}

describe("mapProductToForm - fiziksel ürün", () => {
    const form = mapProductToFormSimple(mockProductDetailDto);

    it("temel alanlar doğru map edilir", () => {
        expect(form.productCode).toBe("TEST-001");
        expect(form.name).toBe("Test Ürünü");
        expect(form.kind).toBe(1);
        expect(form.isActive).toBe(true);
    });

    it("çoklu attributeValues doğru map edilir", () => {
        expect(form.attributeValues).toHaveLength(2);
        expect(form.attributeValues[0].attributeDefinitionId).toBe("attr-001");
        expect(form.attributeValues[0].valueText).toBe("Kırmızı");
        expect(form.attributeValues[1].valueText).toBe("L");
    });

    it("çoklu variants doğru map edilir", () => {
        expect(form.variants).toHaveLength(2);
        expect(form.variants[0].sku).toBe("SKU-001-RED-L");
        expect(form.variants[1].sku).toBe("SKU-001-BLUE-M");
        expect(form.variants[1].additionalPrice).toBe(10);
    });

    it("çoklu prices doğru map edilir", () => {
        expect(form.prices).toHaveLength(2);
        expect(form.prices[0].amount).toBe(299.99);
        expect(form.prices[1].amount).toBe(249.99);
        expect(form.prices[1].customerGroupCode).toBe("KURUMSAL");
        expect(form.prices[1].minQuantity).toBe(10);
    });

    it("inventory doğru map edilir", () => {
        expect(form.inventories).toHaveLength(1);
        expect(form.inventories[0].quantityOnHand).toBe(100);
        expect(form.inventories[0].quantityReserved).toBe(10);
    });

    it("supplierMaps doğru map edilir", () => {
        expect(form.supplierMaps).toHaveLength(1);
        expect(form.supplierMaps[0].isPreferred).toBe(true);
        expect(form.supplierMaps[0].supplierCost).toBe(150);
    });

    it("physicalProfile doğru map edilir", () => {
        expect(form.physicalProfile?.weight).toBe(1.5);
        expect(form.physicalProfile?.warrantyInMonths).toBe(24);
        expect(form.physicalProfile?.requiresShipping).toBe(true);
    });

    it("yazılım alanları (modules, licenseOfferings) boş gelir", () => {
        expect(form.modules).toHaveLength(0);
        expect(form.licenseOfferings).toHaveLength(0);
    });
});

describe("mapProductToForm - yazılım ürünü (kind=2)", () => {
    const form = mapProductToFormSimple(mockSoftwareProductDetail);

    it("kind=2 doğru set edilir", () => {
        expect(form.kind).toBe(2);
    });

    it("çoklu modules doğru map edilir", () => {
        expect(form.modules).toHaveLength(2);
        expect(form.modules[0].moduleCode).toBe("CRM-HR");
        expect(form.modules[0].additionalPrice).toBe(500);
        expect(form.modules[1].moduleCode).toBe("CRM-ACC");
        expect(form.modules[1].additionalPrice).toBe(750);
    });

    it("licenseOfferings doğru map edilir", () => {
        expect(form.licenseOfferings).toHaveLength(1);
        expect(form.licenseOfferings[0].name).toBe("Standart Lisans");
        expect(form.licenseOfferings[0].basePrice).toBe(1200);
        expect(form.licenseOfferings[0].isActive).toBe(true);
    });

    it("fiziksel ürün alanları (variants, inventories, supplierMaps) boş gelir", () => {
        expect(form.variants).toHaveLength(0);
        expect(form.inventories).toHaveLength(0);
        expect(form.supplierMaps).toHaveLength(0);
    });

    it("physicalProfile undefined gelir", () => {
        expect(form.physicalProfile).toBeUndefined();
    });
});
