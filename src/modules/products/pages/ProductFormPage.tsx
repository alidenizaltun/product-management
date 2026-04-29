import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "reactstrap";
import { FormProvider, useForm } from "react-hook-form";
import Content from "@/layout/content/Content";
import Head from "@/layout/head/Head";
import AppTabs, { TabItem } from "@/modules/shared/components/AppTabs";
import { useProductDetail } from "@/modules/products/hooks/useProductDetail";
import { useProductMutations } from "@/modules/products/hooks/useProductMutations";
import { ProductDto } from "@/domain";
import {
  ProductFormValues,
  PhysicalProfileForm,
  SoftwareProfileForm,
  ServiceProfileForm,
  SubscriptionProfileForm,
} from "@/modules/products/types/productEditor.types";
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
  licenseModel: undefined,
  seatCount: undefined,
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
  unitOfMeasure: "",
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
});

const mapProductToForm = (product: ProductDto): ProductFormValues => {
  const base = buildDefaultValues();

  let parsed: Partial<ProductFormValues> = {};
  if (product.metadataJson) {
    try {
      parsed = JSON.parse(product.metadataJson) as Partial<ProductFormValues>;
    } catch {
      // ignore parse errors
    }
  }

  return {
    ...base,
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
    unitOfMeasure: product.unitOfMeasure ?? "",
    taxRate: product.taxRate ?? undefined,
    taxCode: product.taxCode ?? "",
    tags: product.tags ?? "",

    attributeValues: Array.isArray(parsed.attributeValues) ? parsed.attributeValues : [],
    variants: Array.isArray(parsed.variants) ? parsed.variants : [],
    prices: Array.isArray(parsed.prices) ? parsed.prices : [],
    inventories: Array.isArray(parsed.inventories) ? parsed.inventories : [],
    mediaItems: Array.isArray(parsed.mediaItems) ? parsed.mediaItems : [],
    categoryMaps: Array.isArray(parsed.categoryMaps) ? parsed.categoryMaps : [],
    bundleItems: Array.isArray(parsed.bundleItems) ? parsed.bundleItems : [],
    supplierMaps: Array.isArray(parsed.supplierMaps) ? parsed.supplierMaps : [],
    inventoryTransactions: Array.isArray(parsed.inventoryTransactions) ? parsed.inventoryTransactions : [],
    inventoryReservations: Array.isArray(parsed.inventoryReservations) ? parsed.inventoryReservations : [],
    priceListItems: Array.isArray(parsed.priceListItems) ? parsed.priceListItems : [],

    physicalProfile: (parsed.physicalProfile as PhysicalProfileForm) ?? buildDefaultPhysical(),
    softwareProfile: (parsed.softwareProfile as SoftwareProfileForm) ?? buildDefaultSoftware(),
    serviceProfile: (parsed.serviceProfile as ServiceProfileForm) ?? buildDefaultService(),
    subscriptionProfile: (parsed.subscriptionProfile as SubscriptionProfileForm) ?? buildDefaultSubscription(),
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
  if (Array.isArray(value)) return value.reduce((sum, item) => sum + countErrors(item), 0);
  if (typeof value === "object") {
    return Object.values(value as Record<string, unknown>).reduce(
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
      unitOfMeasure: values.unitOfMeasure || undefined,
      taxRate: values.taxRate,
      taxCode: values.taxCode || undefined,
      tags: values.tags || undefined,
      metadataJson: values.metadataJson || undefined,
    };

    const fullPayload = {
      product: productPayload,
      attributeValues: values.attributeValues?.length ? values.attributeValues : undefined,
      variants: values.variants?.length ? values.variants : undefined,
      prices: values.prices?.length
        ? values.prices.map((p) => ({ ...p, amount: p.amount ?? 0 }))
        : undefined,
      inventories: values.inventories?.length ? values.inventories : undefined,
      mediaItems: values.mediaItems?.length ? values.mediaItems : undefined,
      categoryMaps: values.categoryMaps?.length ? values.categoryMaps : undefined,
      bundleItems: values.bundleItems?.length ? values.bundleItems : undefined,
      supplierMaps: values.supplierMaps?.length ? values.supplierMaps : undefined,
      inventoryTransactions: values.inventoryTransactions?.length
        ? values.inventoryTransactions.map((t) => ({ ...t, quantity: t.quantity ?? 0 }))
        : undefined,
      inventoryReservations: values.inventoryReservations?.length
        ? values.inventoryReservations.map((r) => ({ ...r, quantity: r.quantity ?? 0 }))
        : undefined,
      priceListItems: values.priceListItems?.length
        ? values.priceListItems.map((pl) => ({ ...pl, amount: pl.amount ?? 0 }))
        : undefined,
      physicalProfile: values.kind === 1 ? values.physicalProfile : undefined,
      softwareProfile: values.kind === 2 ? values.softwareProfile : undefined,
      serviceProfile: values.kind === 3 ? values.serviceProfile : undefined,
      subscriptionProfile: values.kind === 4 ? values.subscriptionProfile : undefined,
    };

    if (isEdit && id) {
      await updateFullMutation.mutateAsync({ id, payload: fullPayload });
      navigate(`/products/${id}`);
      return;
    }

    const created = await createFullMutation.mutateAsync(fullPayload);
    navigate(`/products/${created.id}`);
  };

  const isPending = createFullMutation.isPending || updateFullMutation.isPending;

  const tabs: TabItem[] = [
    {
      id: "general",
      label: "Genel Bilgi",
      badge: tabErrorCounts.general || undefined,
      content: <GeneralInfoTab />,
    },
    {
      id: "variants",
      label: "Varyantlar",
      badge: tabErrorCounts.variants || undefined,
      content: <VariantBuilder />,
    },
    {
      id: "prices",
      label: "Fiyatlar",
      badge: tabErrorCounts.prices || undefined,
      content: <PriceMatrix />,
    },
    {
      id: "attributes",
      label: "Özellikler",
      badge: tabErrorCounts.attributes || undefined,
      content: <AttributeSelector />,
    },
    {
      id: "categories",
      label: "Kategoriler",
      badge: tabErrorCounts.categories || undefined,
      content: <CategoryTreeSelector />,
    },
    {
      id: "suppliers",
      label: "Tedarikçiler",
      badge: tabErrorCounts.suppliers || undefined,
      content: <SupplierMultiSelect />,
    },
    {
      id: "media",
      label: "Medya",
      badge: tabErrorCounts.media || undefined,
      content: <MediaUploadManager />,
    },
    {
      id: "bundles",
      label: "Bundle",
      badge: tabErrorCounts.bundles || undefined,
      content: <BundleProductPicker />,
    },
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
    {
      id: "inv-reservations",
      label: "Rezervasyonlar",
      badge: tabErrorCounts.invReservations || undefined,
      content: <InventoryReservationTab />,
    },
    {
      id: "price-list-items",
      label: "Fiyat Listesi",
      badge: tabErrorCounts.priceListItems || undefined,
      content: <PriceListItemTab />,
    },
    {
      id: "profile",
      label: "Profil",
      badge: tabErrorCounts.profile || undefined,
      content: <ProfileEditor />,
    },
  ];

  return (
    <>
      <Head title={isEdit ? "Ürün Düzenle" : "Yeni Ürün"} />
      <Content>
        <FormProvider {...form}>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="nk-block-head nk-block-head-sm">
              <div className="nk-block-between g-3">
                <div className="nk-block-head-content">
                  <h3 className="nk-block-title page-title">
                    {isEdit ? "Ürün Düzenle" : "Yeni Ürün"}
                  </h3>
                  {isEdit && product && (
                    <p className="text-soft mb-0">
                      <em className="icon ni ni-tag me-1" />
                      {product.productCode} — {product.name}
                    </p>
                  )}
                </div>
                <div className="nk-block-head-content">
                  <div className="d-flex gap-2">
                    <Button
                      color="light"
                      type="button"
                      disabled={isPending}
                      onClick={() => navigate("/products")}
                    >
                      İptal
                    </Button>
                    <Button color="primary" type="submit" disabled={isPending}>
                      {isPending ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" />
                          Kaydediliyor...
                        </>
                      ) : (
                        <>
                          <em className="icon ni ni-save me-1" />
                          Kaydet
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {isEdit && isLoading ? (
              <div className="card card-bordered">
                <div className="card-inner d-flex align-items-center gap-3 py-5">
                  <span className="spinner-border spinner-border-sm text-primary" />
                  <span>Ürün yükleniyor...</span>
                </div>
              </div>
            ) : (
              <>
                {totalErrorCount > 0 && (
                  <div className="alert alert-warning d-flex align-items-center gap-2 mb-3">
                    <em className="icon ni ni-alert-circle fs-5" />
                    <span>
                      Formda <strong>{totalErrorCount}</strong> hata bulunuyor. Lütfen kırmızı
                      sayaçlı sekmelerdeki alanları kontrol edin.
                    </span>
                  </div>
                )}
                <AppTabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />
              </>
            )}
          </form>
        </FormProvider>
      </Content>
    </>
  );
};

export default ProductFormPage;
