/**
 * Ürün formunun tamamı için ortak varsayılan değer, DTO -> form eşlemesi ve
 * "full product" kayıt yükü üretimi.
 *
 * Eskiden ProductFormPage içinde yaşayan bu mantık, ürüne bağlı her bağımsız
 * sayfanın (Genel Bilgiler, Sınıflandırma, Medya, Fiyatlandırma...) aynı
 * eşlemeyi ve aynı kayıt yükünü kullanabilmesi için buraya taşındı.
 */
import { ProductDetailDto, UnitRole } from "@/shared/types/productOperations.types";
import { DEFAULT_CURRENCY_CODE } from "@/shared/config/currency";
import {
    ProductFormValues,
    PhysicalProfileForm,
    SoftwareProfileForm,
    ServiceProfileForm,
    SubscriptionProfileForm,
} from "@/modules/products/types/productEditor.types";
import {
    buildModuleOfferingPricePayloads,
    buildPricingRulePayloads,
} from "@/modules/products/utils/productFormPayload";

const mapProductUnitIds = (item: {
    productUnitIds?: string[];
    productUnitId?: string | null;
}) => (item.productUnitIds?.length ? item.productUnitIds : item.productUnitId ? [item.productUnitId] : []);

const mapProductUnitTempIds = (item: {
    productUnitTempIds?: string[];
    productUnitTempId?: string | null;
}) => (item.productUnitTempIds?.length ? item.productUnitTempIds : item.productUnitTempId ? [item.productUnitTempId] : []);

const createCodeSegment = (value: string) =>
    value
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/ı/g, "i")
        .replace(/ğ/g, "g")
        .replace(/ü/g, "u")
        .replace(/ş/g, "s")
        .replace(/ö/g, "o")
        .replace(/ç/g, "c")
        .toUpperCase()
        .replace(/[^A-Z0-9]+/g, "-")
        .replace(/^-|-$/g, "")
        .slice(0, 24);

export const createModuleCode = (name: string, index: number) =>
    `MOD-${createCodeSegment(name) || `MODUL-${index + 1}`}`;

export const ensureUniqueModuleCode = (baseCode: string, usedCodes: Set<string>) => {
    const trimmedBaseCode = baseCode.trim() || "MOD-MODUL";
    let candidate = trimmedBaseCode;
    let index = 2;

    while (usedCodes.has(candidate.toLocaleUpperCase("tr-TR"))) {
        candidate = `${trimmedBaseCode}-${index}`;
        index += 1;
    }

    usedCodes.add(candidate.toLocaleUpperCase("tr-TR"));
    return candidate;
};

export const normalizeLicenseModel = (value?: number | null) => {
    const model = Number(value ?? 2);
    return model === 1 || model === 2 || model === 5 ? model : 2;
};

export const buildDefaultPhysical = (): PhysicalProfileForm => ({
    weight: undefined,
    width: undefined,
    height: undefined,
    length: undefined,
    requiresShipping: true,
    isFragile: false,
    isHazardous: false,
    requiresSerialNumber: false,
    warrantyInMonths: undefined,
});

export const buildDefaultSoftware = (): SoftwareProfileForm => ({
    version: "",
    downloadUrl: "",
    supportedPlatformsJson: "",
    systemRequirementsJson: "",
    releaseNotes: "",
});

export const buildDefaultService = (): ServiceProfileForm => ({
    deliveryMode: undefined,
    durationInMinutes: undefined,
    maxConcurrentBooking: undefined,
    serviceAreaJson: "",
});

export const buildDefaultSubscription = (): SubscriptionProfileForm => ({
    billingPeriodUnit: undefined,
    billingPeriodValue: undefined,
    trialDays: undefined,
    autoRenew: true,
    gracePeriodDays: undefined,
    cancellationPolicy: "",
});

export const buildDefaultValues = (): ProductFormValues => ({
    productCode: "",
    name: "",
    shortDescription: "",
    description: "",
    kind: 2,
    status: 0,
    brand: "",
    manufacturer: "",
    barcode: "",
    isActive: true,
    isSellable: true,
    isPurchasable: true,
    trackInventory: false,
    defaultCurrencyCode: DEFAULT_CURRENCY_CODE,
    unitDefinitionId: "",
    taxRate: 0,
    taxCode: "",
    tags: "",
    metadataJson: "",

    attributeValues: [],
    variants: [],
    prices: [],
    inventories: [],
    mediaItems: [],
    categoryMaps: [],
    bundleItems: [],
    supplierMaps: [],
    inventoryTransactions: [],
    inventoryReservations: [],
    priceListItems: [],

    physicalProfile: buildDefaultPhysical(),
    softwareProfile: buildDefaultSoftware(),
    serviceProfile: buildDefaultService(),
    subscriptionProfile: buildDefaultSubscription(),

    modules: [],
    productUnits: [],
    softwarePricingTiers: [],
    licenseOfferings: [],
    pricingRules: [],
    unitConversions: [],
});

export const mapProductToForm = (product: ProductDetailDto): ProductFormValues => {
    const base = buildDefaultValues();

    return {
        ...base,
        // Temel ürün alanları
        productCode: product.productCode ?? "",
        name: product.name ?? "",
        shortDescription: product.shortDescription ?? "",
        description: product.description ?? "",
        kind: product.kind ?? 1,
        status: product.status ?? 0,
        brand: product.brand ?? "",
        manufacturer: product.manufacturer ?? "",
        barcode: product.barcode ?? "",
        isActive: Boolean(product.isActive),
        isSellable: Boolean(product.isSellable),
        isPurchasable: Boolean(product.isPurchasable),
        trackInventory: Boolean(product.trackInventory),
        defaultCurrencyCode: product.defaultCurrencyCode ?? DEFAULT_CURRENCY_CODE,
        unitDefinitionId: product.unitDefinitionId ?? "",
        taxRate: product.taxRate ?? 0,
        taxCode: product.taxCode ?? "",
        tags: product.tags ?? "",
        metadataJson: product.metadataJson ?? "",

        // İlişkili veriler — ProductDetailDto'nun kendi alanlarından okunur
        attributeValues: (product.attributeValues ?? []).map((av) => ({
            attributeDefinitionId: av.attributeDefinitionId,
            valueText: av.valueText ?? "",
        })),

        variants: (product.variants ?? []).map((v) => ({
            sku: v.sku,
            name: v.name,
            optionValuesJson: v.optionValuesJson,
            additionalPrice: v.additionalPrice,
            additionalCost: v.additionalCost,
            isActive: v.isActive,
        })),

        prices: (product.prices ?? []).map((p) => ({
            priceType: p.priceType,
            amount: p.amount,
            compareAtAmount: p.compareAtAmount,
            currencyCode: p.currencyCode,
            minQuantity: p.minQuantity,
            maxQuantity: p.maxQuantity,
            validFrom: p.validFrom,
            validTo: p.validTo,
            salesChannel: p.salesChannel,
            customerGroupCode: p.customerGroupCode,
        })),

        inventories: (product.inventories ?? []).map((inv) => ({
            warehouseId: inv.warehouseId,
            warehouseCode: inv.warehouseCode,
            quantityOnHand: inv.quantityOnHand,
            quantityReserved: inv.quantityReserved,
            reorderPoint: inv.reorderPoint,
            reorderQuantity: inv.reorderQuantity,
            inventoryPolicy: inv.inventoryPolicy,
        })),

        mediaItems: (product.mediaItems ?? []).map((m) => ({
            mediaType: m.mediaType,
            url: m.url,
            thumbnailUrl: m.thumbnailUrl,
            mimeType: m.mimeType,
            altText: m.altText,
            isPrimary: m.isPrimary,
            sortOrder: m.sortOrder,
        })),

        categoryMaps: (product.categoryMaps ?? []).map((cm) => ({
            productCategoryId: cm.productCategoryId,
            isPrimary: cm.isPrimary,
            sortOrder: cm.sortOrder,
        })),

        bundleItems: (product.bundleItems ?? []).map((bi) => ({
            childProductId: bi.childProductId,
            quantity: bi.quantity,
            isOptional: bi.isOptional,
        })),

        supplierMaps: (product.supplierMaps ?? []).map((sm) => ({
            productSupplierId: sm.productSupplierId,
            supplierProductCode: sm.supplierProductCode,
            supplierCost: sm.supplierCost,
            leadTimeInDays: sm.leadTimeInDays,
            minOrderQuantity: sm.minOrderQuantity,
            isPreferred: sm.isPreferred,
        })),

        inventoryTransactions: (product.inventoryTransactions ?? []).map((t) => ({
            transactionType: t.transactionType,
            quantity: t.quantity,
            unitCost: t.unitCost,
            referenceType: t.referenceType,
            referenceNumber: t.referenceNumber,
            note: t.note,
            occurredAt: t.occurredAt,
        })),

        inventoryReservations: (product.inventoryReservations ?? []).map((r) => ({
            quantity: r.quantity,
            reservationCode: r.reservationCode,
            reservedUntil: r.reservedUntil,
            status: r.status,
            sourceType: r.sourceType,
            sourceId: r.sourceId,
        })),

        priceListItems: (product.priceListItems ?? []).map((pl) => ({
            productPriceListId: pl.productPriceListId,
            amount: pl.amount,
            compareAtAmount: pl.compareAtAmount,
            minQuantity: pl.minQuantity,
            maxQuantity: pl.maxQuantity,
        })),

        // Profil alanları
        physicalProfile: product.physicalProfile
            ? {
                weight: product.physicalProfile.weight,
                width: product.physicalProfile.width,
                height: product.physicalProfile.height,
                length: product.physicalProfile.length,
                requiresShipping: product.physicalProfile.requiresShipping,
                isFragile: product.physicalProfile.isFragile,
                isHazardous: product.physicalProfile.isHazardous,
                requiresSerialNumber: product.physicalProfile.requiresSerialNumber,
                warrantyInMonths: product.physicalProfile.warrantyInMonths,
            }
            : buildDefaultPhysical(),

        softwareProfile: product.softwareProfile
            ? {
                version: product.softwareProfile.version,
                downloadUrl: product.softwareProfile.downloadUrl,
                supportedPlatformsJson: product.softwareProfile.supportedPlatformsJson,
                systemRequirementsJson: product.softwareProfile.systemRequirementsJson,
                releaseNotes: product.softwareProfile.releaseNotes,
            }
            : buildDefaultSoftware(),

        serviceProfile: product.serviceProfile
            ? {
                deliveryMode: product.serviceProfile.deliveryMode,
                durationInMinutes: product.serviceProfile.durationInMinutes,
                maxConcurrentBooking: product.serviceProfile.maxConcurrentBooking,
                serviceAreaJson: product.serviceProfile.serviceAreaJson,
            }
            : buildDefaultService(),

        subscriptionProfile: product.subscriptionProfile
            ? {
                billingPeriodUnit: product.subscriptionProfile.billingPeriodUnit,
                billingPeriodValue: product.subscriptionProfile.billingPeriodValue,
                trialDays: product.subscriptionProfile.trialDays,
                autoRenew: product.subscriptionProfile.autoRenew,
                gracePeriodDays: product.subscriptionProfile.gracePeriodDays,
                cancellationPolicy: product.subscriptionProfile.cancellationPolicy,
            }
            : buildDefaultSubscription(),

        // Yazılım modülleri ve lisans alanları
        productUnits: (product.productUnits ?? []).map((unit) => ({
            id: unit.id,
            unitDefinitionId: unit.unitDefinitionId,
            code: unit.code,
            name: unit.name,
            description: unit.description ?? "",
            role: 1,
            isDefault: unit.isDefault,
            isActive: unit.isActive,
            sortOrder: unit.sortOrder,
        })),

        modules: (product.modules ?? []).map((m) => {
            const topLevelOfferingPrices = (product.moduleOfferingPrices ?? []).filter(
                (op) => op.productModuleId === m.id
            );
            const offeringPrices = topLevelOfferingPrices.length ? topLevelOfferingPrices : m.offeringPrices ?? [];

            return {
                id: m.id,
                moduleCode: m.moduleCode,
                name: m.name,
                description: m.description,
                currencyCode: m.currencyCode,
                isOptional: m.isOptional,
                isActive: m.isActive,
                sortOrder: m.sortOrder,
                offeringPrices: offeringPrices.map((op) => ({
                    productLicenseOfferingId: op.productLicenseOfferingId,
                    licenseOfferingTempId: op.licenseOfferingTempId,
                    price: op.price,
                    currencyCode: op.currencyCode,
                    isActive: op.isActive,
                })),
            };
        }),

        softwarePricingTiers: (product.softwarePricingTiers ?? []).map((t) => ({
            productLicenseOfferingId: t.productLicenseOfferingId,
            unitDefinitionId: t.unitDefinitionId,
            minUnits: t.minUnits,
            maxUnits: t.maxUnits,
            pricePerUnit: t.pricePerUnit,
            flatFee: t.flatFee,
            currencyCode: t.currencyCode,
            isActive: t.isActive,
        })),

        licenseOfferings: (product.licenseOfferings ?? []).map((lo) => ({
            id: lo.id,
            productUnitId: lo.productUnitId ?? lo.productUnitIds?.[0] ?? "",
            productUnitTempId: lo.productUnitTempId ?? "",
            productUnitIds: mapProductUnitIds(lo),
            productUnitTempIds: mapProductUnitTempIds(lo),
            licenseModel: normalizeLicenseModel(lo.licenseModel),
            name: lo.name,
            description: lo.description,
            basePrice: lo.basePrice,
            currencyCode: lo.currencyCode,
            billingPeriodUnit: lo.billingPeriodUnit,
            billingPeriodValue: lo.billingPeriodValue,
            autoRenew: lo.autoRenew,
            gracePeriodDays: lo.gracePeriodDays,
            trialDays: lo.trialDays,
            convertToOfferingId: lo.convertToOfferingId,
            validFrom: lo.validFrom ? lo.validFrom.slice(0, 10) : undefined,
            validTo: lo.validTo ? lo.validTo.slice(0, 10) : undefined,
            isActive: lo.isActive,
            sortOrder: lo.sortOrder,
        })),

        pricingRules: (product.pricingRules ?? []).map((rule) => ({
            id: rule.id,
            productLicenseOfferingId: rule.productLicenseOfferingId ?? rule.licenseOfferingId ?? undefined,
            licenseOfferingTempId: rule.licenseOfferingTempId ?? undefined,
            productUnitId: rule.productUnitId ?? rule.productUnitIds?.[0] ?? undefined,
            productUnitTempId: rule.productUnitTempId ?? undefined,
            productUnitIds: mapProductUnitIds(rule),
            productUnitTempIds: mapProductUnitTempIds(rule),
            productVariantId: rule.productVariantId,
            code: rule.code,
            name: rule.name,
            priority: rule.priority,
            isActive: rule.isActive,
            validFrom: rule.validFrom,
            validTo: rule.validTo,
            salesChannel: null,
            customerGroupCode: null,
            priceAdjustment: rule.priceAdjustment,
            priceAdjustmentJson: rule.priceAdjustmentJson,
        })),

        unitConversions: (product.unitConversions ?? []).map((uc) => ({
            fromUnitDefinitionId: uc.fromUnitDefinitionId,
            toUnitDefinitionId: uc.toUnitDefinitionId,
            conversionFactor: uc.conversionFactor,
            fromUnitRole: uc.fromUnitRole,
            isActive: uc.isActive,
        })),
    };
};

export interface BuildFullProductPayloadOptions {
    /** Kayıtlı ürün kimliği; yeni üründe boş bırakılır. */
    productId?: string;
    /** Güncelleme akışında sunucudaki güncel dinamik fiyat kuralları. */
    pricingRules?: ProductDetailDto["pricingRules"];
}

/**
 * Form değerlerinden create/update "full product" isteğini üretir.
 * Güncellemede boş koleksiyonlar bilinçli olarak `[]` gönderilir; böylece
 * sunucu tarafında silinen satırlar da senkronlanır.
 */
export const buildFullProductPayload = (
    values: ProductFormValues,
    { productId, pricingRules }: BuildFullProductPayloadOptions = {}
) => {
    const isEdit = Boolean(productId);
    const productPayload = {
        // Yeni üründe kod boş gelir ve gönderilmez; sistem üretir.
        productCode: values.productCode || undefined,
        name: values.name,
        shortDescription: values.shortDescription,
        description: values.description,
        kind: Number(values.kind ?? 1),
        status: Number(values.status ?? 0),
        brand: values.brand || undefined,
        manufacturer: values.manufacturer || undefined,
        barcode: values.barcode || undefined,
        isActive: Boolean(values.isActive),
        isSellable: Boolean(values.isSellable),
        isPurchasable: Boolean(values.isPurchasable),
        trackInventory: Number(values.kind ?? 1) === 2 ? false : Boolean(values.trackInventory),
        defaultCurrencyCode: values.defaultCurrencyCode,
        unitDefinitionId: Number(values.kind ?? 1) === 1 ? values.unitDefinitionId || undefined : undefined,
        taxRate: Number.isFinite(values.taxRate) ? values.taxRate : 0,
        taxCode: values.taxCode || undefined,
        tags: values.tags || undefined,
        metadataJson: values.metadataJson || undefined,
    };

    const pricingRulesForPayload = isEdit ? pricingRules ?? values.pricingRules : values.pricingRules;
    const usedModuleCodes = new Set<string>();
    const normalizedModules =
        values.kind === 2 && values.modules?.length
            ? values.modules.map((module, moduleIndex) => {
                const typedModuleCode = module.moduleCode.trim();
                const moduleCode = ensureUniqueModuleCode(
                    typedModuleCode || createModuleCode(module.name, moduleIndex),
                    usedModuleCodes
                );

                return {
                    ...module,
                    moduleCode,
                };
            })
            : values.modules;

    const payload = {
        product: productPayload,
        attributeValues: values.attributeValues?.length ? values.attributeValues : isEdit ? [] : undefined,
        variants: values.variants?.length ? values.variants : isEdit ? [] : undefined,
        prices: values.prices?.length
            ? values.prices.map((p) => ({ ...p, amount: p.amount ?? 0 }))
            : isEdit
                ? []
                : undefined,
        inventories: values.inventories?.length ? values.inventories : isEdit ? [] : undefined,
        mediaItems: values.mediaItems?.length
            ? values.mediaItems
                .filter((m) => Boolean(m.url?.trim()))
                .map((m) => ({
                    ...m,
                    sortOrder: Number.isFinite(m.sortOrder) ? m.sortOrder : 0,
                }))
            : isEdit
                ? []
                : undefined,
        categoryMaps: values.categoryMaps?.length
            ? values.categoryMaps.map((cm) => ({
                ...cm,
                sortOrder: Number.isFinite(cm.sortOrder) ? cm.sortOrder : 0,
            }))
            : isEdit
                ? []
                : undefined,
        bundleItems: values.bundleItems?.length ? values.bundleItems : isEdit ? [] : undefined,
        supplierMaps: values.supplierMaps?.length ? values.supplierMaps : isEdit ? [] : undefined,
        inventoryTransactions: values.inventoryTransactions?.length
            ? values.inventoryTransactions.map((t) => ({ ...t, quantity: t.quantity ?? 0 }))
            : isEdit
                ? []
                : undefined,
        inventoryReservations: values.inventoryReservations?.length
            ? values.inventoryReservations.map((r) => ({ ...r, quantity: r.quantity ?? 0 }))
            : isEdit
                ? []
                : undefined,
        priceListItems: values.priceListItems?.length
            ? values.priceListItems.map((pl) => ({ ...pl, amount: pl.amount ?? 0 }))
            : isEdit
                ? []
                : undefined,
        physicalProfile: values.kind === 1 ? values.physicalProfile : undefined,
        softwareProfile: values.kind === 2 ? values.softwareProfile : undefined,
        serviceProfile: values.kind === 3 ? values.serviceProfile : undefined,
        subscriptionProfile: values.kind === 4 ? values.subscriptionProfile : undefined,
        productUnits: values.productUnits?.length
            ? values.productUnits
                .filter((unit) => Boolean(unit.unitDefinitionId) && Boolean(unit.code?.trim()) && Boolean(unit.name?.trim()))
                .map((unit) => ({
                    id: unit.id || undefined,
                    _tempId: unit._tempId || undefined,
                    unitDefinitionId: unit.unitDefinitionId,
                    code: unit.code.trim(),
                    name: unit.name.trim(),
                    description: unit.description?.trim() || undefined,
                    role: 1 as UnitRole,
                    isDefault: Boolean(unit.isDefault),
                    isActive: Boolean(unit.isActive),
                    sortOrder: Number.isFinite(unit.sortOrder) ? unit.sortOrder : 0,
                }))
            : isEdit
                ? []
                : undefined,
        // Yazılım ürünü (kind=2) için ek lisans alanları
        modules:
            values.kind === 2
                ? normalizedModules?.length
                    ? normalizedModules.map((m) => {
                        const offeringPrices = buildModuleOfferingPricePayloads(
                            m.offeringPrices,
                            values.licenseOfferings,
                            values.defaultCurrencyCode
                        );

                        return {
                            productId: productId ?? undefined,
                            moduleCode: m.moduleCode,
                            name: m.name,
                            description: m.description,
                            currencyCode: m.currencyCode,
                            isOptional: m.isOptional,
                            isActive: m.isActive,
                            sortOrder: m.sortOrder,
                            offeringPrices,
                        };
                    })
                    : isEdit
                        ? []
                        : undefined
                : undefined,
        softwarePricingTiers: undefined,
        licenseOfferings:
            values.kind === 2
                ? values.licenseOfferings?.length
                    ? values.licenseOfferings.map(({
                        id: loId,
                        convertToOfferingId,
                        _tempId,
                        productUnitId,
                        productUnitTempId,
                        productUnitIds,
                        productUnitTempIds,
                        ...lo
                    }) => {
                        const savedUnitIds = (productUnitIds?.length ? productUnitIds : productUnitId ? [productUnitId] : [])
                            .filter(Boolean);
                        const tempUnitIds = (productUnitTempIds?.length
                            ? productUnitTempIds
                            : productUnitTempId
                                ? [productUnitTempId]
                                : []
                        ).filter(Boolean);

                        return {
                            ...lo,
                            basePrice: 0,
                            id: loId || undefined,
                            // Backend henüz kaydedilmemiş offering'leri _tempId ile eşleştirir
                            _tempId: _tempId || undefined,
                            productUnitId: savedUnitIds[0] || undefined,
                            productUnitTempId: savedUnitIds.length === 0 ? tempUnitIds[0] || undefined : undefined,
                            productUnitIds: savedUnitIds.length ? savedUnitIds : undefined,
                            productUnitTempIds: tempUnitIds.length ? tempUnitIds : undefined,
                            convertToOfferingId: convertToOfferingId || undefined,
                            validFrom: lo.validFrom || null,
                            validTo: lo.validTo || null,
                            productId: productId ?? undefined,
                        };
                    })
                    : isEdit
                        ? []
                        : undefined
                : undefined,
        pricingRules: buildPricingRulePayloads(pricingRulesForPayload, isEdit),
    };

    return { payload, normalizedModules };
};

/** Ürün tipine göre okunabilir etiketler (form ve kart başlıklarında kullanılır). */
export const PRODUCT_KIND_LABELS: Record<number, string> = {
    1: "Fiziksel",
    2: "Yazılım",
    3: "Hizmet",
    4: "Abonelik",
};

export const PRODUCT_STATUS_LABELS: Record<number, string> = {
    0: "Taslak",
    1: "Aktif",
    2: "Pasif",
    3: "Arşivlendi",
};
