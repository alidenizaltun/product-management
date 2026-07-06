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
import ProductUnitsTab from "@/modules/products/components/editor/ProductUnitsTab";
import GeneralInfoTab from "@/modules/products/components/editor/GeneralInfoTab";
import VariantBuilder from "@/modules/products/components/editor/VariantBuilder";
import PriceMatrix from "@/modules/products/components/editor/PriceMatrix";
import AttributeSelector from "@/modules/products/components/editor/AttributeSelector";
import CategoryTreeSelector from "@/modules/products/components/editor/CategoryTreeSelector";
import SupplierMultiSelect from "@/modules/products/components/editor/SupplierMultiSelect";
import MediaUploadManager from "@/modules/products/components/editor/MediaUploadManager";
import InventoryTab from "@/modules/products/components/editor/InventoryTab";
import InventoryTransactionTab from "@/modules/products/components/editor/InventoryTransactionTab";
import InventoryReservationTab from "@/modules/products/components/editor/InventoryReservationTab";
import PriceListItemTab from "@/modules/products/components/editor/PriceListItemTab";
import ProfileEditor from "@/modules/products/components/editor/ProfileEditor";

type WorkflowId = "start" | "sales" | "enrich" | "advanced";

const KIND_LABELS: Record<number, string> = {
    1: "Fiziksel",
    2: "Yazılım",
    3: "Hizmet",
    4: "Abonelik",
};

const STATUS_LABELS: Record<number, string> = {
    0: "Taslak",
    1: "Aktif",
    2: "Pasif",
    3: "Arşivlendi",
};

const toFiniteNumber = (value: unknown, fallback = 0) =>
    typeof value === "number" && Number.isFinite(value) ? value : fallback;

interface ProductPreviewPanelProps {
    values: Partial<ProductFormValues>;
    totalErrorCount: number;
    isDirty: boolean;
    isPending: boolean;
    onSubmit: () => void;
}

const ProductPreviewPanel: React.FC<ProductPreviewPanelProps> = ({
    values,
    totalErrorCount,
    isDirty,
    isPending,
    onSubmit,
}) => {
    const mediaItems = values.mediaItems ?? [];
    const prices = values.prices ?? [];
    const inventories = values.inventories ?? [];
    const licenseOfferings = values.licenseOfferings ?? [];
    const categoryMaps = values.categoryMaps ?? [];

    const primaryMedia = mediaItems.find((media) => media.isPrimary && media.url) ?? mediaItems.find((media) => media.url);
    const basePrice = prices.find((price) => toFiniteNumber(price.amount) > 0)?.amount
        ?? licenseOfferings.find((offering) => toFiniteNumber(offering.basePrice) > 0)?.basePrice;
    const currency = prices.find((price) => price.currencyCode)?.currencyCode
        ?? licenseOfferings.find((offering) => offering.currencyCode)?.currencyCode
        ?? values.defaultCurrencyCode
        ?? "TRY";
    const totalStock = inventories.reduce((sum, item) => sum + toFiniteNumber(item.quantityOnHand), 0);
    const reservedStock = inventories.reduce((sum, item) => sum + toFiniteNumber(item.quantityReserved), 0);
    const sellableStock = Math.max(totalStock - reservedStock, 0);
    const isPhysical = Number(values.kind ?? 1) === 1;

    const checklist = [
        { label: "Ürün adı", done: Boolean(values.name?.trim()) },
        { label: "Ürün kodu", done: Boolean(values.productCode?.trim()) },
        { label: "Kategori", done: categoryMaps.length > 0 },
        { label: "Fiyat", done: Boolean(basePrice) },
        { label: "Kapak medya", done: Boolean(primaryMedia?.url) },
        { label: "Açıklama", done: Boolean(values.shortDescription?.trim() || values.description?.trim()) },
        ...(isPhysical ? [{ label: "Stok", done: inventories.length > 0 }] : []),
    ];
    const completed = checklist.filter((item) => item.done).length;
    const progress = Math.round((completed / checklist.length) * 100);

    return (
        <aside className="product-editor-preview position-sticky" style={{ top: 92 }}>
            <div className="card card-bordered product-editor-preview-card">
                <div className="card-inner border-bottom">
                    <div className="product-editor-preview-head d-flex justify-content-between align-items-start gap-3 h-100">
                        <div>
                            <span className="overline-title text-primary">Canlı Önizleme</span>
                            <h6 className="title mb-1">{values.name?.trim() || "İsimsiz ürün"}</h6>
                            <p className="text-soft fs-13px mb-0">
                                {values.productCode?.trim() || "SKU bekleniyor"} · {KIND_LABELS[Number(values.kind ?? 1)]}
                            </p>
                        </div>
                        <span className="badge badge-dim bg-primary">{STATUS_LABELS[Number(values.status ?? 0)]}</span>
                    </div>
                </div>

                <div className="card-inner product-editor-preview-body">
                    <div
                        className="rounded border bg-lighter d-flex align-items-center justify-content-center mb-3 overflow-hidden"
                        style={{ aspectRatio: "4 / 3" }}
                    >
                        {primaryMedia?.url ? (
                            <img
                                src={primaryMedia.thumbnailUrl || primaryMedia.url}
                                alt={primaryMedia.altText || values.name || "Ürün görseli"}
                                className="w-100 h-100"
                                style={{ objectFit: "cover" }}
                            />
                        ) : (
                            <div className="text-center text-soft px-3">
                                <em className="icon ni ni-img fs-1 d-block mb-2" />
                                <span className="fs-13px">Kapak görseli eklendiğinde burada görünür.</span>
                            </div>
                        )}
                    </div>

                    <div className="d-flex justify-content-between align-items-center mb-2">
                        <span className="text-soft fs-13px">Temel fiyat</span>
                        <strong>
                            {basePrice ? `${Number(basePrice).toLocaleString("tr-TR")} ${currency}` : "Henüz yok"}
                        </strong>
                    </div>
                    <div className="d-flex justify-content-between align-items-center mb-3">
                        <span className="text-soft fs-13px">Satılabilir stok</span>
                        <strong>{isPhysical ? sellableStock.toLocaleString("tr-TR") : "Uygulanmaz"}</strong>
                    </div>

                    <div className="border-top pt-3">
                        <div className="d-flex justify-content-between align-items-center mb-2">
                            <span className="fw-medium">Yayın hazırlığı</span>
                            <span className="fs-12px text-soft">{progress}%</span>
                        </div>
                        <div className="progress progress-md mb-3">
                            <div className="progress-bar" style={{ width: `${progress}%` }} />
                        </div>
                        <div className="product-editor-checklist">
                            {checklist.map((item) => (
                                <div key={item.label} className="product-editor-checklist-item d-flex align-items-center gap-2 h-100">
                                    <em className={`icon ni ni-${item.done ? "check-circle-fill text-success" : "alert-circle text-warning"}`} />
                                    <span className={item.done ? "text-base" : "text-soft"}>{item.label}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="card-inner border-top product-editor-preview-footer">
                    {totalErrorCount > 0 && (
                        <div className="alert alert-warning py-2 px-3 mb-3">
                            <span className="fs-13px">{totalErrorCount} alan kontrol bekliyor.</span>
                        </div>
                    )}
                    <Button color="primary" className="w-100" type="button" disabled={isPending} onClick={onSubmit}>
                        {isPending ? (
                            <>
                                <span className="spinner-border spinner-border-sm me-2" />
                                Kaydediliyor...
                            </>
                        ) : (
                            <>
                                <Icon name="save" className="me-1" id="" style={{}} />
                                {isDirty ? "Değişiklikleri Kaydet" : "Kaydet"}
                            </>
                        )}
                    </Button>
                </div>
            </div>
        </aside>
    );
};

interface WorkflowSectionProps {
    icon: string;
    title: string;
    description: string;
    children: React.ReactNode;
}

const WorkflowSection: React.FC<WorkflowSectionProps> = ({ icon, title, description, children }) => (
    <section className="card card-bordered product-editor-section mb-4">
        <div className="card-inner border-bottom">
            <div className="product-editor-section-head d-flex align-items-start gap-3 h-100">
                <span className="btn btn-icon btn-light rounded-circle flex-shrink-0">
                    <em className={`icon ni ni-${icon}`} />
                </span>
                <div>
                    <h5 className="title mb-1">{title}</h5>
                    <p className="text-soft mb-0">{description}</p>
                </div>
            </div>
        </div>
        <div className="card-inner">{children}</div>
    </section>
);

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
            role: unit.role,
            isDefault: unit.isDefault,
            isActive: unit.isActive,
            sortOrder: unit.sortOrder,
        })),

        modules: (product.modules ?? []).map((m) => ({
            id: m.id,
            moduleCode: m.moduleCode,
            name: m.name,
            description: m.description,
            currencyCode: m.currencyCode,
            isOptional: m.isOptional,
            isActive: m.isActive,
            sortOrder: m.sortOrder,
            offeringPrices: (product.moduleOfferingPrices ?? [])
                .filter((op) => op.productModuleId === m.id)
                .map((op) => ({
                    productLicenseOfferingId: op.productLicenseOfferingId,
                    price: op.price,
                    currencyCode: op.currencyCode,
                    isActive: op.isActive,
                })),
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
            productUnitId: lo.productUnitId ?? "",
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
    const [activeWorkflow, setActiveWorkflow] = useState<WorkflowId>("start");
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
        productUnits: getTabErrorCount(["productUnits"]),
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
            taxRate: Number.isFinite(values.taxRate) ? values.taxRate : 0,
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
                ? values.mediaItems
                    .filter((m) => Boolean(m.url?.trim()))
                    .map((m) => ({
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
                        role: Number(unit.role) as 1 | 2 | 3,
                        isDefault: Boolean(unit.isDefault),
                        isActive: Boolean(unit.isActive),
                        sortOrder: Number.isFinite(unit.sortOrder) ? unit.sortOrder : 0,
                    }))
                : (isEdit ? [] : undefined),
            // Yazılım ürünü (kind=2) için ek lisans alanları
            modules: values.kind === 2 && values.modules?.length
                ? values.modules.map((m) => ({
                    productId: id ?? undefined,
                    moduleCode: m.moduleCode,
                    name: m.name,
                    description: m.description,
                    currencyCode: m.currencyCode,
                    isOptional: m.isOptional,
                    isActive: m.isActive,
                    sortOrder: m.sortOrder,
                    offeringPrices: m.offeringPrices?.length
                        ? m.offeringPrices
                            .filter((op) => Boolean(op.productLicenseOfferingId) || Boolean(op.licenseOfferingTempId))
                            .map((op) => ({
                                productLicenseOfferingId: op.productLicenseOfferingId || undefined,
                                licenseOfferingTempId: op.licenseOfferingTempId || undefined,
                                price: op.price,
                                currencyCode: op.currencyCode,
                                isActive: op.isActive,
                            }))
                        : undefined,
                }))
                : undefined,
            softwarePricingTiers: undefined,
            licenseOfferings:
                values.kind === 2 && values.licenseOfferings?.length
                    ? values.licenseOfferings.map(({
                        id: loId,
                        convertToOfferingId,
                        _tempId,
                        productUnitId,
                        productUnitTempId,
                        ...lo
                    }) => ({
                        ...lo,
                        id: loId || undefined,
                        // Backend henüz kaydedilmemiş offering'leri _tempId ile eşleştirir
                        _tempId: _tempId || undefined,
                        productUnitId: productUnitId || undefined,
                        productUnitTempId: productUnitTempId || undefined,
                        convertToOfferingId: convertToOfferingId || undefined,
                        validFrom: lo.validFrom || null,
                        validTo: lo.validTo || null,
                        productId: id ?? undefined,
                    }))
                    : undefined,
            pricingRules:
                !isEdit && values.pricingRules?.length
                    ? values.pricingRules.map((rule) => ({
                        productLicenseOfferingId: rule.productLicenseOfferingId || undefined,
                        licenseOfferingTempId: rule.licenseOfferingTempId || undefined,
                        productUnitId: rule.productUnitId || undefined,
                        productUnitTempId: rule.productUnitTempId || undefined,
                        productVariantId: rule.productVariantId || null,
                        code: rule.code,
                        name: rule.name,
                        priority: Number(rule.priority ?? 0),
                        isActive: Boolean(rule.isActive),
                        validFrom: rule.validFrom || null,
                        validTo: rule.validTo || null,
                        salesChannel: rule.salesChannel || null,
                        customerGroupCode: rule.customerGroupCode || null,
                        priceAdjustment: rule.priceAdjustment ?? null,
                        priceAdjustmentJson: rule.priceAdjustmentJson ?? null,
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
    const formValues = useWatch({ control: form.control });
    const kind = Number(kindValue);

    // kind: 1=Fiziksel, 2=Yazılım, 3=Hizmet, 4=Abonelik
    const isPhysical = kind === 1;
    // Modüller sekmesi yalnızca yazılım türünde gösterilir
    const isSoftware = kind === 2;
    // Fiyat Parametreleri ve Fiyatlandırma; yazılım, hizmet veya abonelik türünde gösterilir
    const isLicensable = kind === 2 || kind === 3 || kind === 4;
    // Rezervasyonlar; fiziksel veya hizmet türünde gösterilir
    const hasReservations = kind === 1 || kind === 3;
    const pricingRuleProductUnits = isEdit
        ? product?.productUnits ?? []
        : (formValues.productUnits ?? []).map((unit) => ({
            id: unit.id ?? "",
            _tempId: unit._tempId,
            productId: id ?? "",
            unitDefinitionId: unit.unitDefinitionId,
            code: unit.code,
            name: unit.name,
            description: unit.description,
            role: unit.role,
            isDefault: unit.isDefault,
            isActive: unit.isActive,
            sortOrder: unit.sortOrder,
            createdAt: "",
        }));
    const pricingRuleLicenseOfferings = isEdit
        ? product?.licenseOfferings ?? []
        : (formValues.licenseOfferings ?? []).map((offering) => ({
            id: offering.id ?? "",
            _tempId: offering._tempId,
            productId: id ?? "",
            productUnitId: offering.productUnitId,
            productUnitName: pricingRuleProductUnits.find((unit) => unit.id === offering.productUnitId || unit._tempId === offering.productUnitTempId)?.name,
            licenseModel: Number(offering.licenseModel ?? 2),
            name: offering.name || "Yeni Plan",
            description: offering.description,
            basePrice: Number(offering.basePrice ?? 0),
            currencyCode: offering.currencyCode || "TRY",
            billingPeriodUnit: offering.billingPeriodUnit,
            billingPeriodValue: offering.billingPeriodValue,
            autoRenew: Boolean(offering.autoRenew),
            gracePeriodDays: offering.gracePeriodDays,
            trialDays: offering.trialDays,
            convertToOfferingId: offering.convertToOfferingId,
            maxSeats: offering.maxSeats,
            validFrom: offering.validFrom,
            validTo: offering.validTo,
            isActive: Boolean(offering.isActive),
            sortOrder: Number(offering.sortOrder ?? 0),
            createdAt: "",
        }));
    const draftPricingRules = (formValues.pricingRules ?? []).map((rule) => ({
        ...rule,
        id: rule.id ?? "",
        productId: "",
    }));

    const workflowErrorCounts: Record<WorkflowId, number> = {
        start: tabErrorCounts.general + tabErrorCounts.categories,
        sales:
            tabErrorCounts.prices +
            tabErrorCounts.productUnits +
            tabErrorCounts.priceListItems +
            tabErrorCounts.inventory +
            tabErrorCounts.invTransactions,
        enrich: tabErrorCounts.media + tabErrorCounts.variants + tabErrorCounts.attributes,
        advanced:
            tabErrorCounts.profile +
            tabErrorCounts.suppliers +
            tabErrorCounts.invReservations +
            tabErrorCounts.bundles,
    };

    const workflows: Array<{
        id: WorkflowId;
        label: string;
        description: string;
        icon: string;
        content: React.ReactNode;
    }> = [
        {
            id: "start",
            label: "Başla",
            description: "Ürünü tanımlayan karar alanları",
            icon: "flag",
            content: (
                <>
                    <WorkflowSection
                        icon="edit"
                        title="Ürün Bilgileri"
                        description="Önce ürünü zihinde netleştiren alanları doldurun; teknik alanlar gelişmiş bölümde saklanır."
                    >
                        <GeneralInfoTab isEdit={isEdit} />
                    </WorkflowSection>
                    <WorkflowSection
                        icon="folder-list"
                        title="Kategori"
                        description="Ürünün vitrindeki yerini belirleyin. İlk kategori ana kategori kabul edilir."
                    >
                        <CategoryTreeSelector />
                    </WorkflowSection>
                </>
            ),
        },
        {
            id: "sales",
            label: "Satışa Hazırla",
            description: "Fiyat tarifleri, satış planları, stok ve ticari kurallar",
            icon: "cart",
            content: (
                <>
                    {isLicensable && (
                        <WorkflowSection
                            icon="grid-add-c"
                            title="Ürün Birimleri"
                            description="Fiyatlandırma ve lisans tekliflerinde kullanılacak ürün içi birimleri tanımlayın."
                        >
                            <ProductUnitsTab productId={id} />
                        </WorkflowSection>
                    )}
                    <WorkflowSection
                        icon="coins"
                        title={isSoftware ? "Satış Planları" : "Fiyat Tarifleri"}
                        description={
                            isSoftware
                                ? "Aylık, yıllık, deneme veya koltuk bazlı planı şablonla başlatın; detayları yalnızca gerektiğinde açın."
                                : "Temel fiyatı bir kartla başlatın; kampanya, bayi veya kanal fiyatlarını ayrı tarifler olarak ekleyin."
                        }
                    >
                        {isSoftware ? (
                            <LicenseOfferingsTab productId={id} />
                        ) : (
                            <>
                                <PriceMatrix />
                                <div className="border-top mt-4 pt-4">
                                    <PriceListItemTab />
                                </div>
                            </>
                        )}
                    </WorkflowSection>
                    {isLicensable && (
                        <WorkflowSection
                            icon="layers"
                            title="Dinamik Kurallar"
                            description="Miktar, müşteri grubu veya kullanım gibi istisnaları ürün kaydedildikten sonra blok mantığıyla yönetin."
                        >
                            <SoftwarePricingTiersTab
                                productId={id}
                                licenseOfferings={pricingRuleLicenseOfferings}
                                variants={product?.variants ?? []}
                                productUnits={pricingRuleProductUnits}
                                draftRules={!id ? draftPricingRules : undefined}
                                onDraftRulesChange={
                                    !id
                                        ? (rules) =>
                                            form.setValue(
                                                "pricingRules",
                                                rules.map((rule) => ({
                                                    id: rule.id,
                                                    productLicenseOfferingId: rule.productLicenseOfferingId ?? undefined,
                                                    licenseOfferingTempId: rule.licenseOfferingTempId ?? undefined,
                                                    productUnitId: rule.productUnitId ?? undefined,
                                                    productUnitTempId: rule.productUnitTempId ?? undefined,
                                                    productVariantId: rule.productVariantId,
                                                    code: rule.code,
                                                    name: rule.name,
                                                    priority: rule.priority,
                                                    isActive: rule.isActive,
                                                    validFrom: rule.validFrom,
                                                    validTo: rule.validTo,
                                                    salesChannel: rule.salesChannel,
                                                    customerGroupCode: rule.customerGroupCode,
                                                    priceAdjustment: rule.priceAdjustment,
                                                    priceAdjustmentJson: rule.priceAdjustmentJson,
                                                })),
                                                { shouldDirty: true }
                                            )
                                        : undefined
                                }
                            />
                        </WorkflowSection>
                    )}
                    {isPhysical && (
                        <WorkflowSection
                            icon="archive"
                            title="Stok Paneli"
                            description="Depo bazlı eldeki, rezerve ve satılabilir stok durumunu aynı akışta izleyin."
                        >
                            <InventoryTab />
                        </WorkflowSection>
                    )}
                </>
            ),
        },
        {
            id: "enrich",
            label: "Zenginleştir",
            description: "Medya, varyant, özellik ve modüller",
            icon: "spark",
            content: (
                <>
                    <WorkflowSection
                        icon="img"
                        title="Medya Galerisi"
                        description="Kapak görseli, galeri sırası ve alt metinleri ürün bağlamında düzenleyin."
                    >
                        <MediaUploadManager />
                    </WorkflowSection>
                    {isPhysical && (
                        <WorkflowSection
                            icon="grid"
                            title="Varyantlar"
                            description="Seçenekleri ürünün doğal diliyle girin, SKU ve fiyat farklarını topluca yönetin."
                        >
                            <VariantBuilder />
                        </WorkflowSection>
                    )}
                    <WorkflowSection
                        icon="tag"
                        title="Özellikler"
                        description="Kategoriye göre beklenen özellik değerlerini ürünle birlikte tamamlayın."
                    >
                        <AttributeSelector />
                    </WorkflowSection>
                    {isSoftware && (
                        <WorkflowSection
                            icon="puzzle"
                            title="Yazılım Modülleri"
                            description="Modül ve lisans tekliflerini ürün bağlamında bir arada yönetin."
                        >
                            <ProductModulesTab />
                        </WorkflowSection>
                    )}
                </>
            ),
        },
        {
            id: "advanced",
            label: "Gelişmiş",
            description: "Profil, tedarik, hareketler ve rezervasyonlar",
            icon: "setting",
            content: (
                <>
                    <WorkflowSection
                        icon="setting-alt"
                        title="Profil ve Teknik Detaylar"
                        description="Ürün tipine özgü nadir veya teknik alanları ana akışı bozmadan düzenleyin."
                    >
                        <ProfileEditor />
                    </WorkflowSection>
                    {isPhysical && (
                        <WorkflowSection
                            icon="truck"
                            title="Tedarikçiler"
                            description="Satın alma kaynağı, maliyet ve teslim süresi bilgilerini yönetin."
                        >
                            <SupplierMultiSelect />
                        </WorkflowSection>
                    )}
                    {isPhysical && (
                        <WorkflowSection
                            icon="activity"
                            title="Stok İşlemleri"
                            description="Giriş, çıkış, transfer ve düzeltme hareketlerini ürün kaydıyla ilişkilendirin."
                        >
                            <InventoryTransactionTab />
                        </WorkflowSection>
                    )}
                    {hasReservations && (
                        <WorkflowSection
                            icon="clock"
                            title="Rezervasyonlar"
                            description="Rezerve miktarları ve kaynak kayıtlarını takip edin."
                        >
                            <InventoryReservationTab />
                        </WorkflowSection>
                    )}
                </>
            ),
        },
    ];

    const activeWorkflowConfig = workflows.find((workflow) => workflow.id === activeWorkflow) ?? workflows[0];

    return (
        <>
            <Head title={isEdit ? "Ürün Düzenle" : "Yeni Ürün"} />
            <Content>
                <FormProvider {...form}>
                    <form onSubmit={handleSubmit(onSubmit)}>
                        <PageHeader
                            title={isEdit ? "Ürün Düzenle" : "Yeni Ürün"}
                            description={
                                isEdit && product
                                    ? `${product.productCode} — ${product.name}`
                                    : "Ürünü yayınlamaya hazırlayan sade çalışma alanı"
                            }
                            actions={
                                <div className="d-flex gap-2 align-items-center flex-wrap">
                                    <span className={`badge badge-dim bg-${isDirty ? "warning" : "success"} d-none d-md-inline-flex`}>
                                        {isDirty ? "Kaydedilmemiş değişiklik" : "Taslak güncel"}
                                    </span>
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
                                                Formda <strong>{totalErrorCount}</strong> hata bulunuyor. Lütfen iş akışı
                                                başlıklarındaki sayaçları kontrol edin.
                                            </span>
                                        </div>
                                    )}
                                    <div className="row g-4 align-items-start product-editor-studio">
                                        <div className="col-xl-8 col-xxl-9">
                                            <div className="card card-bordered product-editor-workflow-card mb-4">
                                                <div className="card-inner py-3">
                                                    <div className="product-editor-workflow-nav d-flex flex-wrap gap-2 h-100">
                                                        {workflows.map((workflow) => {
                                                            const active = workflow.id === activeWorkflow;
                                                            const errorCount = workflowErrorCounts[workflow.id];

                                                            return (
                                                                <button
                                                                    key={workflow.id}
                                                                    type="button"
                                                                    className={`btn ${
                                                                        active ? "btn-primary" : "btn-outline-light"
                                                                    } product-editor-workflow-button d-flex align-items-center gap-2 h-100`}
                                                                    onClick={() => setActiveWorkflow(workflow.id)}
                                                                >
                                                                    <em className={`icon ni ni-${workflow.icon}`} />
                                                                    <span>{workflow.label}</span>
                                                                    {errorCount > 0 && (
                                                                        <span className={`badge bg-${active ? "light text-primary" : "danger"}`}>
                                                                            {errorCount}
                                                                        </span>
                                                                    )}
                                                                </button>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                                <div className="card-inner border-top py-3">
                                                    <div className="product-editor-section-head d-flex align-items-start gap-3 h-100">
                                                        <span className="btn btn-icon btn-light rounded-circle flex-shrink-0">
                                                            <em className={`icon ni ni-${activeWorkflowConfig.icon}`} />
                                                        </span>
                                                        <div>
                                                            <h4 className="title mb-1">{activeWorkflowConfig.label}</h4>
                                                            <p className="text-soft mb-0">{activeWorkflowConfig.description}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {activeWorkflowConfig.content}
                                        </div>

                                        <div className="col-xl-4 col-xxl-3">
                                            <ProductPreviewPanel
                                                values={formValues}
                                                totalErrorCount={totalErrorCount}
                                                isDirty={isDirty}
                                                isPending={isPending}
                                                onSubmit={() => void handleSubmit(onSubmit)()}
                                            />
                                        </div>
                                    </div>
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
