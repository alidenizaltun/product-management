import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "reactstrap";
import { FormProvider, useForm, useWatch } from "react-hook-form";
import { parseApiErrors, toFormPath } from "@/utils/apiErrors";
import Content from "@/layout/content/Content";
import Head from "@/layout/head/Head";
import Icon from "@/components/icon/Icon";
import { Block } from "@/components/Component";
import PageHeader from "@/modules/shared/components/PageHeader";
import AppTabs, { TabItem } from "@/modules/shared/components/AppTabs";
import { useProductDetail } from "@/modules/products/hooks/useProductDetail";
import { useProductMutations } from "@/modules/products/hooks/useProductMutations";
import { ProductDetailDto } from "@/shared/types/productOperations.types";
import {
    ProductFormValues,
    PhysicalProfileForm,
    SoftwareProfileForm,
    ServiceProfileForm,
    SubscriptionProfileForm,
} from "@/modules/products/types/productEditor.types";
import ProductModulesTab from "@/modules/products/components/editor/ProductModulesTab";
import SoftwarePricingTiersTab from "@/modules/products/components/editor/SoftwarePricingTiersTab";
import LicenseOfferingsTab from "@/modules/products/components/editor/LicenseOfferingsTab";
import GeneralInfoTab from "@/modules/products/components/editor/GeneralInfoTab";
import VariantBuilder from "@/modules/products/components/editor/VariantBuilder";
import PriceMatrix from "@/modules/products/components/editor/PriceMatrix";
import AttributeSelector from "@/modules/products/components/editor/AttributeSelector";
import CategoryTreeSelector from "@/modules/products/components/editor/CategoryTreeSelector";
import SupplierMultiSelect from "@/modules/products/components/editor/SupplierMultiSelect";
import MediaUploadManager from "@/modules/products/components/editor/MediaUploadManager";
import BundleProductPicker from "@/modules/products/components/editor/BundleProductPicker";
import InventoryTab from "@/modules/products/components/editor/InventoryTab";
import InventoryTransactionTab from "@/modules/products/components/editor/InventoryTransactionTab";
import InventoryReservationTab from "@/modules/products/components/editor/InventoryReservationTab";
import PriceListItemTab from "@/modules/products/components/editor/PriceListItemTab";
import ProfileEditor from "@/modules/products/components/editor/ProfileEditor";
import ProductUnitConversionTab from "@/modules/products/components/editor/ProductUnitConversionTab";

const buildDefaultPhysical = (): PhysicalProfileForm => ({
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

const buildDefaultSoftware = (): SoftwareProfileForm => ({
    version: "",
    downloadUrl: "",
    supportedPlatformsJson: "",
    systemRequirementsJson: "",
    releaseNotes: "",
});

const buildDefaultService = (): ServiceProfileForm => ({
    deliveryMode: undefined,
    durationInMinutes: undefined,
    maxConcurrentBooking: undefined,
    serviceAreaJson: "",
});

const buildDefaultSubscription = (): SubscriptionProfileForm => ({
    billingPeriodUnit: undefined,
    billingPeriodValue: undefined,
    trialDays: undefined,
    autoRenew: true,
    gracePeriodDays: undefined,
    cancellationPolicy: "",
});

const buildDefaultValues = (): ProductFormValues => ({
    productCode: "",
    name: "",
    shortDescription: "",
    description: "",
    kind: 1,
    status: 0,
    brand: "",
    manufacturer: "",
    barcode: "",
    isActive: true,
    isSellable: true,
    isPurchasable: true,
    trackInventory: true,
    defaultCurrencyCode: "TRY",
    unitDefinitionId: "",
    taxRate: undefined,
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
    softwarePricingTiers: [],
    licenseOfferings: [],
    unitConversions: [],
});

const mapProductToForm = (product: ProductDetailDto): ProductFormValues => {
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
        defaultCurrencyCode: product.defaultCurrencyCode ?? "TRY",
        unitDefinitionId: product.unitDefinitionId ?? "",
        taxRate: product.taxRate ?? undefined,
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
        modules: (product.modules ?? []).map((m) => ({
            moduleCode: m.moduleCode,
            name: m.name,
            description: m.description,
            additionalPrice: m.additionalPrice,
            currencyCode: m.currencyCode,
            isOptional: m.isOptional,
            isActive: m.isActive,
            sortOrder: m.sortOrder,
        })),

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
 licenseModel: lo.licenseModel,
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
 maxSeats: lo.maxSeats,
 validFrom: lo.validFrom ? lo.validFrom.slice(0, 10) : undefined,
 validTo: lo.validTo ? lo.validTo.slice(0, 10) : undefined,
 isActive: lo.isActive,
 sortOrder: lo.sortOrder,
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

const getNestedValue = (target: unknown, path: string) =>
    path.split(".").reduce<unknown>((acc, key) => (acc ? (acc as Record<string, unknown>)[key] : undefined), target);

const countErrors = (value: unknown): number => {
    if (!value) return 0;
    if (
        typeof value === "object" &&
        ((value as { message?: string }).message || (value as { type?: string }).type)
    ) {
        return 1;
    }
    if (Array.isArray(value)) return value.reduce((sum: number, item) => sum + countErrors(item), 0);
    if (typeof value === "object") {
        return Object.values(value as Record<string, unknown>).reduce<number>(
            (sum, item) => sum + countErrors(item),
            0
        );
    }
    return 0;
};

const ProductFormPage: React.FC = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEdit = Boolean(id);

    const { data: product, isLoading } = useProductDetail(id);
    const { createFullMutation, updateFullMutation } = useProductMutations();
    const [activeTab, setActiveTab] = useState("general");
    const [submitError, setSubmitError] = useState<string | null>(null);

    const defaultValues = useMemo(() => buildDefaultValues(), []);
    const form = useForm<ProductFormValues>({
        defaultValues,
        mode: "onBlur",
    });

    const {
        handleSubmit,
        reset,
        formState: { errors, isDirty },
    } = form;

    useEffect(() => {
        if (product) {
            reset(mapProductToForm(product));
        }
    }, [product, reset]);

    useEffect(() => {
        const handleBeforeUnload = (event: BeforeUnloadEvent) => {
            if (!isDirty) return;
            event.preventDefault();
            event.returnValue = "";
        };
        window.addEventListener("beforeunload", handleBeforeUnload);
        return () => window.removeEventListener("beforeunload", handleBeforeUnload);
    }, [isDirty]);

    const getTabErrorCount = (paths: string[]) =>
        paths.reduce((sum, path) => sum + countErrors(getNestedValue(errors, path)), 0);

    const tabErrorCounts = {
        general: getTabErrorCount(["productCode", "name", "defaultCurrencyCode"]),
        variants: getTabErrorCount(["variants"]),
        prices: getTabErrorCount(["prices"]),
        attributes: getTabErrorCount(["attributeValues"]),
        categories: getTabErrorCount(["categoryMaps"]),
        suppliers: getTabErrorCount(["supplierMaps"]),
        media: getTabErrorCount(["mediaItems"]),
        bundles: getTabErrorCount(["bundleItems"]),
        inventory: getTabErrorCount(["inventories"]),
        invTransactions: getTabErrorCount(["inventoryTransactions"]),
        invReservations: getTabErrorCount(["inventoryReservations"]),
        priceListItems: getTabErrorCount(["priceListItems"]),
        profile: getTabErrorCount(["physicalProfile", "softwareProfile", "serviceProfile", "subscriptionProfile"]),
    };

    const totalErrorCount = Object.values(tabErrorCounts).reduce((a, b) => a + b, 0);

    const onSubmit = async (values: ProductFormValues) => {
        setSubmitError(null);
        const productPayload = {
            productCode: values.productCode,
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
            trackInventory: Boolean(values.trackInventory),
            defaultCurrencyCode: values.defaultCurrencyCode,
            unitDefinitionId: values.unitDefinitionId || undefined,
            taxRate: values.taxRate,
            taxCode: values.taxCode || undefined,
            tags: values.tags || undefined,
            metadataJson: values.metadataJson || undefined,
        };

        const fullPayload = {
            product: productPayload,
            attributeValues: values.attributeValues?.length ? values.attributeValues : (isEdit ? [] : undefined),
            variants: values.variants?.length ? values.variants : (isEdit ? [] : undefined),
            prices: values.prices?.length
                ? values.prices.map((p) => ({ ...p, amount: p.amount ?? 0 }))
                : (isEdit ? [] : undefined),
            inventories: values.inventories?.length ? values.inventories : (isEdit ? [] : undefined),
            mediaItems: values.mediaItems?.length
                ? values.mediaItems.map((m) => ({
                    ...m,
                    sortOrder: Number.isFinite(m.sortOrder) ? m.sortOrder : 0,
                }))
                : (isEdit ? [] : undefined),
            categoryMaps: values.categoryMaps?.length
                ? values.categoryMaps.map((cm) => ({
                    ...cm,
                    sortOrder: Number.isFinite(cm.sortOrder) ? cm.sortOrder : 0,
                }))
                : (isEdit ? [] : undefined),
            bundleItems: values.bundleItems?.length ? values.bundleItems : (isEdit ? [] : undefined),
            supplierMaps: values.supplierMaps?.length ? values.supplierMaps : (isEdit ? [] : undefined),
            inventoryTransactions: values.inventoryTransactions?.length
                ? values.inventoryTransactions.map((t) => ({ ...t, quantity: t.quantity ?? 0 }))
                : (isEdit ? [] : undefined),
            inventoryReservations: values.inventoryReservations?.length
                ? values.inventoryReservations.map((r) => ({ ...r, quantity: r.quantity ?? 0 }))
                : (isEdit ? [] : undefined),
            priceListItems: values.priceListItems?.length
                ? values.priceListItems.map((pl) => ({ ...pl, amount: pl.amount ?? 0 }))
                : (isEdit ? [] : undefined),
            physicalProfile: values.kind === 1 ? values.physicalProfile : undefined,
            softwareProfile: values.kind === 2 ? values.softwareProfile : undefined,
            serviceProfile: values.kind === 3 ? values.serviceProfile : undefined,
            subscriptionProfile: values.kind === 4 ? values.subscriptionProfile : undefined,
            // Yazılım ürünü (kind=2) için ek lisans alanları
            modules: values.kind === 2 && values.modules?.length
                ? values.modules.map((m) => ({ ...m, productId: id ?? undefined }))
                : undefined,
            softwarePricingTiers:
                values.kind === 2 && values.softwarePricingTiers?.length
                    ? values.softwarePricingTiers
                        .filter((t) => (Boolean(t.productLicenseOfferingId) || Boolean(t.licenseOfferingTempId)) && Boolean(t.unitDefinitionId))
                        .map((t) => ({
                            // Kaydedilmiş offering → id gönder; yeni offering → tempId ile eşleştir
                            productLicenseOfferingId: t.productLicenseOfferingId || undefined,
                            licenseOfferingTempId: t.licenseOfferingTempId || undefined,
                            unitDefinitionId: t.unitDefinitionId,
                            minUnits: t.minUnits,
                            maxUnits: t.maxUnits || undefined,
                            pricePerUnit: t.pricePerUnit,
                            flatFee: t.flatFee,
                            currencyCode: t.currencyCode,
                            isActive: t.isActive,
                            productId: id ?? undefined,
                        }))
                    : undefined,
            licenseOfferings:
                values.kind === 2 && values.licenseOfferings?.length
 ? values.licenseOfferings.map(({ id: loId, convertToOfferingId, _tempId, ...lo }) => ({
 ...lo,
 id: loId || undefined,
 // Backend henüz kaydedilmemiş offering'leri _tempId ile eşleştirir
 _tempId: _tempId || undefined,
 convertToOfferingId: convertToOfferingId || undefined,
 validFrom: lo.validFrom || null,
 validTo: lo.validTo || null,
 productId: id ?? undefined,
 }))
                    : undefined,
        };

        try {
            if (isEdit && id) {
                await updateFullMutation.mutateAsync({ id, payload: fullPayload });
                navigate(`/products/${id}`);
                return;
            }

            const created = await createFullMutation.mutateAsync(fullPayload);
            navigate(`/products/${created.id}`);
        } catch (err: unknown) {
            const { fieldErrors, generalErrors } = parseApiErrors(err);

            let hasFieldErrors = false;
            for (const [serverKey, messages] of Object.entries(fieldErrors)) {
                const path = toFormPath(serverKey) as Parameters<typeof form.setError>[0];
                form.setError(path, {
                    type: "server",
                    message: messages[0] ?? "Geçersiz değer",
                });
                hasFieldErrors = true;
            }

            if (generalErrors.length > 0) {
                setSubmitError(generalErrors.join(" "));
            } else if (!hasFieldErrors) {
                setSubmitError("Kayıt sırasında bir hata oluştu. Lütfen tekrar deneyin.");
            }
        }
    };

    const isPending = createFullMutation.isPending || updateFullMutation.isPending;

    // kind: 1=Fiziksel, 2=Yazılım, 3=Hizmet, 4=Abonelik
    const kindValue = useWatch({ control: form.control, name: "kind" });
    const kind = Number(kindValue);

    // kind: 1=Fiziksel, 2=Yazılım, 3=Hizmet, 4=Abonelik
    const isPhysical = kind === 1;
    // Modüller sekmesi yalnızca yazılım türünde gösterilir
    const isSoftware = kind === 2;
    // Fiyat Kademeleri ve Lisans Teklifleri; yazılım, hizmet veya abonelik türünde gösterilir
    const isLicensable = kind === 2 || kind === 3 || kind === 4;
    // Rezervasyonlar; fiziksel veya hizmet türünde gösterilir
    const hasReservations = kind === 1 || kind === 3;

    // Kind değiştiğinde, artık gösterilmeyen bir sekmedeyse genel bilgiye dön
    useEffect(() => {
        const physicalOnlyTabs = ["variants", "suppliers", "inventory", "inv-transactions"];
        const softwareOnlyTabs = ["modules"];
        const licensableTabs = ["pricing-tiers", "license-offerings"];
        const reservationTabs = ["inv-reservations"];

        if (physicalOnlyTabs.includes(activeTab) && !isPhysical) {
            setActiveTab("general");
        }
        if (reservationTabs.includes(activeTab) && !hasReservations) {
            setActiveTab("general");
        }
        if (softwareOnlyTabs.includes(activeTab) && !isSoftware) {
            setActiveTab("general");
        }
        if (licensableTabs.includes(activeTab) && !isLicensable) {
            setActiveTab("general");
        }
    }, [kind, activeTab, isPhysical, hasReservations, isSoftware, isLicensable]);

    const baseTabs: TabItem[] = [
        // 1. Genel ürün bilgileri
        {
            id: "general",
            label: "Genel Bilgi",
            badge: tabErrorCounts.general || undefined,
            content: <GeneralInfoTab />,
        },
        {
            id: "profile",
            label: "Profil",
            badge: tabErrorCounts.profile || undefined,
            content: <ProfileEditor />,
        },
        {
            id: "categories",
            label: "Kategoriler",
            badge: tabErrorCounts.categories || undefined,
            content: <CategoryTreeSelector />,
        },
        {
            id: "attributes",
            label: "Özellikler",
            badge: tabErrorCounts.attributes || undefined,
            content: <AttributeSelector />,
        },
        {
            id: "media",
            label: "Medya",
            badge: tabErrorCounts.media || undefined,
            content: <MediaUploadManager />,
        },
        // 2. Ticari & fiyatlandırma
        {
            id: "prices",
            label: "Fiyatlar",
            badge: tabErrorCounts.prices || undefined,
            content: <PriceMatrix />,
            hidden: isSoftware,
        },
        {
            id: "price-list-items",
            label: "Fiyat Listesi",
            badge: tabErrorCounts.priceListItems || undefined,
            content: <PriceListItemTab />,
            hidden: isSoftware,
        },
        // Yalnızca Fiziksel ürünlerde gösterilir
        ...(isPhysical ? [{
            id: "suppliers",
            label: "Tedarikçiler",
            badge: tabErrorCounts.suppliers || undefined,
            content: <SupplierMultiSelect />,
        }] : []),
        // Yalnızca Fiziksel ürünlerde gösterilir
        ...(isPhysical ? [{
            id: "variants",
            label: "Varyantlar",
            badge: tabErrorCounts.variants || undefined,
            content: <VariantBuilder />,
        }] : []),
        // 3. Bundle
        // {
        //     id: "bundles",
        //     label: "Bundle",
        //     badge: tabErrorCounts.bundles || undefined,
        //     content: <BundleProductPicker />,
        // },
        // 4. Stok & lojistik (yalnızca Fiziksel)
        ...(isPhysical ? [
            {
                id: "inventory",
                label: "Stok",
                badge: tabErrorCounts.inventory || undefined,
                content: <InventoryTab />,
            },
            {
                id: "inv-transactions",
                label: "Stok İşlemleri",
                badge: tabErrorCounts.invTransactions || undefined,
                content: <InventoryTransactionTab />,
            },
        ] : []),
        // Fiziksel veya Hizmet ürünlerde gösterilir
        ...(hasReservations ? [{
            id: "inv-reservations",
            label: "Rezervasyonlar",
            badge: tabErrorCounts.invReservations || undefined,
            content: <InventoryReservationTab />,
        }] : []),
        // Birim dönüşümleri — tüm ürün türleri için
        // {
        //     id: "unit-conversions",
        //     label: "Birim Dönüşümleri",
        //     content: <ProductUnitConversionTab />,
        // },
    ];

    // Yazılım türüne özel sekme
    if (isSoftware) {
        baseTabs.push({
            id: "modules",
            label: "Modüller",
            content: <ProductModulesTab />,
        });
    }

    // Yazılım / Hizmet / Abonelik türlerine özel sekmeler
    if (isLicensable) {
        baseTabs.push({
            id: "license-offerings",
            label: "Lisans Teklifleri",
            content: <LicenseOfferingsTab />,
        });
        baseTabs.push({
            id: "pricing-tiers",
            label: "Fiyat Kademeleri",
            content: <SoftwarePricingTiersTab />,
        });
    }

    const tabs = baseTabs;

    return (
        <>
            <Head title={isEdit ? "Ürün Düzenle" : "Yeni Ürün"} />
            <Content>
                <FormProvider {...form}>
                    <form onSubmit={handleSubmit(onSubmit)}>
                        <PageHeader
                            title={isEdit ? "Ürün Düzenle" : "Yeni Ürün"}
                            description={
                                isEdit && product ? `${product.productCode} — ${product.name}` : undefined
                            }
                            actions={
                                <div className="d-flex gap-2">
                                    <Button
                                        color="light py-2"
                                        type="button"
                                        disabled={isPending}
                                        onClick={() => navigate("/products")}
                                    >
                                        İptal
                                    </Button>
                                    <Button color="primary py-2" type="submit" disabled={isPending}>
                                        {isPending ? (
                                            <>
                                                <span className="spinner-border spinner-border-sm me-2" />
                                                Kaydediliyor...
                                            </>
                                        ) : (
                                            <>
                                                <Icon name="save" className="me-1" id="" style={{}} />
                                                Kaydet
                                            </>
                                        )}
                                    </Button>
                                </div>
                            }
                        />
                        <Block className="" size="">
                            {isEdit && isLoading ? (
                                <div className="card card-bordered">
                                    <div className="card-inner d-flex align-items-center gap-3 py-5">
                                        <span className="spinner-border spinner-border-sm text-primary" />
                                        <span>Ürün yükleniyor...</span>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    {submitError && (
                                        <div className="alert alert-danger d-flex align-items-center gap-2 mb-3">
                                            <Icon name="cross-circle" className="fs-5" id="" style={{}} />
                                            <span>{submitError}</span>
                                            <button
                                                type="button"
                                                className="btn-close ms-auto"
                                                aria-label="Kapat"
                                                onClick={() => setSubmitError(null)}
                                            />
                                        </div>
                                    )}
                                    {totalErrorCount > 0 && (
                                        <div className="alert alert-warning d-flex align-items-center gap-2 mb-3">
                                            <Icon name="alert-circle" className="fs-5" id="" style={{}} />
                                            <span>
                                                Formda <strong>{totalErrorCount}</strong> hata bulunuyor. Lütfen kırmızı
                                                sayaçlı sekmelerdeki alanları kontrol edin.
                                            </span>
                                        </div>
                                    )}
                                    <AppTabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />
                                </>
                            )}
                        </Block>
                    </form>
                </FormProvider>
            </Content>
        </>
    );
};

export default ProductFormPage;
