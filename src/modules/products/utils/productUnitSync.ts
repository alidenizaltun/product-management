import type { QueryClient } from "@tanstack/react-query";
import type { UseFormGetValues, UseFormSetValue } from "react-hook-form";
import { productsApi } from "@/modules/products/api/products.api";
import { queryKeys } from "@/services/query/queryKeys";
import type { ProductFormValues, ProductUnitForm } from "@/modules/products/types/productEditor.types";
import type { CreateProductUnitRequestDto, ProductUnitDto, UnitRole } from "@/shared/types/productOperations.types";

export const DEFAULT_PRODUCT_UNIT_ROLE: UnitRole = 1;

export const generateProductUnitTempId = () =>
    `product-unit-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

export const buildProductUnitPayload = (unit: ProductUnitForm): CreateProductUnitRequestDto | null => {
    const unitDefinitionId = unit.unitDefinitionId?.trim();
    const code = unit.code?.trim();
    const name = unit.name?.trim();

    if (!unitDefinitionId || !code || !name) return null;

    return {
        id: unit.id || undefined,
        _tempId: unit._tempId || undefined,
        unitDefinitionId,
        code,
        name,
        description: unit.description?.trim() || undefined,
        role: DEFAULT_PRODUCT_UNIT_ROLE,
        isDefault: Boolean(unit.isDefault),
        isActive: Boolean(unit.isActive),
        sortOrder: Number.isFinite(unit.sortOrder) ? unit.sortOrder : 0,
    };
};

/**
 * Yeni kaydedilen bir ürün biriminin geçici (_tempId) referanslarını,
 * aynı formdaki satış planları ve fiyatlandırma kurallarında gerçek id ile değiştirir.
 * Üç alt-varlık aynı FormProvider altında çalıştığı için bu senkronizasyon şarttır.
 */
export const replaceProductUnitTempReferences = (
    getValues: UseFormGetValues<ProductFormValues>,
    setValue: UseFormSetValue<ProductFormValues>,
    tempId: string | undefined,
    createdId: string
) => {
    if (!tempId) return;

    const licenseOfferings = getValues("licenseOfferings") ?? [];
    licenseOfferings.forEach((offering, index) => {
        const tempIds = offering.productUnitTempIds ?? [];
        const hasTempReference = offering.productUnitTempId === tempId || tempIds.includes(tempId);
        if (!hasTempReference) return;

        const productUnitIds = [...(offering.productUnitIds ?? []), createdId].filter(Boolean);
        const productUnitTempIds = tempIds.filter((id) => id !== tempId);
        setValue(`licenseOfferings.${index}.productUnitIds`, [...new Set(productUnitIds)], { shouldDirty: true });
        setValue(`licenseOfferings.${index}.productUnitTempIds`, productUnitTempIds, { shouldDirty: true });
        setValue(`licenseOfferings.${index}.productUnitId`, productUnitIds[0], { shouldDirty: true });
        setValue(
            `licenseOfferings.${index}.productUnitTempId`,
            productUnitIds.length === 0 ? productUnitTempIds[0] : undefined,
            { shouldDirty: true }
        );
    });

    const pricingRules = getValues("pricingRules") ?? [];
    pricingRules.forEach((rule, index) => {
        const tempIds = rule.productUnitTempIds ?? [];
        const hasTempReference = rule.productUnitTempId === tempId || tempIds.includes(tempId);
        if (!hasTempReference) return;

        const productUnitIds = [...(rule.productUnitIds ?? []), createdId].filter(Boolean);
        const productUnitTempIds = tempIds.filter((id) => id !== tempId);
        setValue(`pricingRules.${index}.productUnitIds`, [...new Set(productUnitIds)], { shouldDirty: true });
        setValue(`pricingRules.${index}.productUnitTempIds`, productUnitTempIds, { shouldDirty: true });
        setValue(`pricingRules.${index}.productUnitId`, productUnitIds[0], { shouldDirty: true });
        setValue(
            `pricingRules.${index}.productUnitTempId`,
            productUnitIds.length === 0 ? productUnitTempIds[0] : undefined,
            { shouldDirty: true }
        );
    });
};

/**
 * Üç fiyatlandırma alt-varlığından (birim/plan/kural) herhangi biri kaydedildikten
 * sonra çağrılır; üçünün de cache'ini tutarlı biçimde tazeler.
 */
export const invalidateAllPricingQueries = async (queryClient: QueryClient, productId: string) => {
    await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.products.detail(productId) }),
        queryClient.invalidateQueries({ queryKey: queryKeys.products.units(productId) }),
        queryClient.invalidateQueries({ queryKey: queryKeys.products.pricingRules(productId) }),
        queryClient.invalidateQueries({ queryKey: queryKeys.products.all }),
    ]);
};

/**
 * RHF form state'indeki ürün birimlerini, ProductPricingRulesPanel gibi backend
 * DTO şekli bekleyen bileşenlere geçmek için uyarlar (henüz kaydedilmemiş,
 * sadece _tempId taşıyan satırlar için id alanı boş string olarak kalır).
 */
export const mapFormProductUnitsToDto = (
    units: ProductUnitForm[],
    productId: string
): (ProductUnitDto & { _tempId?: string })[] =>
    units
        .filter((unit) => unit.id || unit._tempId)
        .map((unit) => ({
            id: unit.id ?? "",
            _tempId: unit._tempId,
            productId,
            unitDefinitionId: unit.unitDefinitionId,
            code: unit.code,
            name: unit.name,
            description: unit.description,
            role: unit.role,
            isDefault: unit.isDefault,
            isActive: unit.isActive,
            sortOrder: unit.sortOrder,
            createdAt: new Date().toISOString(),
        }));

interface AddOrReuseUnitParams {
    productId: string;
    unitDefinitionId: string;
    unitDefinitionCode: string;
    unitDefinitionName: string;
    getValues: UseFormGetValues<ProductFormValues>;
    setValue: UseFormSetValue<ProductFormValues>;
    queryClient: QueryClient;
}

interface AddOrReuseUnitResult {
    productUnitId: string;
    reused: boolean;
}

/**
 * "+" ile evrensel birim ekleme akışının çekirdeği: aynı sözlük kaydına bağlı bir
 * ProductUnit zaten varsa onu yeniden kullanır (duplicate oluşturmaz); yoksa yeni
 * bir ProductUnit oluşturup backend'e kaydeder ve temp referanslarını senkronlar.
 */
export const addOrReuseProductUnit = async ({
    productId,
    unitDefinitionId,
    unitDefinitionCode,
    unitDefinitionName,
    getValues,
    setValue,
    queryClient,
}: AddOrReuseUnitParams): Promise<AddOrReuseUnitResult> => {
    const productUnits = getValues("productUnits") ?? [];
    const existing = productUnits.find((unit) => unit.unitDefinitionId === unitDefinitionId);

    if (existing?.id) {
        return { productUnitId: existing.id, reused: true };
    }

    if (existing?._tempId) {
        return { productUnitId: existing._tempId, reused: true };
    }

    const tempId = generateProductUnitTempId();
    const nextIndex = productUnits.length;
    const newUnit: ProductUnitForm = {
        _tempId: tempId,
        unitDefinitionId,
        code: unitDefinitionCode,
        name: unitDefinitionName,
        description: "",
        role: DEFAULT_PRODUCT_UNIT_ROLE,
        isDefault: productUnits.length === 0,
        isActive: true,
        sortOrder: productUnits.length,
    };
    setValue("productUnits", [...productUnits, newUnit], { shouldDirty: true });

    const payload = buildProductUnitPayload(newUnit);
    if (!payload) {
        return { productUnitId: tempId, reused: false };
    }

    const created = await productsApi.createProductUnit(productId, payload);
    setValue(`productUnits.${nextIndex}.id`, created.id, { shouldDirty: false });
    setValue(`productUnits.${nextIndex}._tempId`, undefined, { shouldDirty: false });
    replaceProductUnitTempReferences(getValues, setValue, tempId, created.id);
    await invalidateAllPricingQueries(queryClient, productId);

    return { productUnitId: created.id, reused: false };
};
