import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "reactstrap";
import { FormProvider, useForm, useFormContext, useWatch } from "react-hook-form";
import Content from "@/layout/content/Content";
import Head from "@/layout/head/Head";
import AppTabs, { TabItem } from "@/modules/shared/components/AppTabs";
import { useProductDetail } from "@/modules/products/hooks/useProductDetail";
import { useProductMutations } from "@/modules/products/hooks/useProductMutations";
import { ProductDto } from "@/domain";
import VariantBuilder from "@/modules/products/components/editor/VariantBuilder";
import PriceMatrix from "@/modules/products/components/editor/PriceMatrix";
import AttributeSelector from "@/modules/products/components/editor/AttributeSelector";
import CategoryTreeSelector from "@/modules/products/components/editor/CategoryTreeSelector";
import SupplierMultiSelect from "@/modules/products/components/editor/SupplierMultiSelect";
import MediaUploadManager from "@/modules/products/components/editor/MediaUploadManager";
import BundleProductPicker from "@/modules/products/components/editor/BundleProductPicker";
import ProfileEditor from "@/modules/products/components/editor/ProfileEditor";
import { ProductFormValues, ProductMetadataForm } from "@/modules/products/types/productEditor.types";

const buildEmptyMetadata = (): ProductMetadataForm => ({
  variantAxes: [],
  variants: [],
  prices: [],
  attributes: [],
  categories: [],
  suppliers: [],
  media: [],
  bundles: [],
  profile: {
    type: "physical",
    physical: {},
    software: {},
    service: {},
    subscription: {},
  },
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
  metadata: buildEmptyMetadata(),
});

const normalizeMetadata = (value?: Partial<ProductMetadataForm>): ProductMetadataForm => ({
  variantAxes: Array.isArray(value?.variantAxes) ? value?.variantAxes ?? [] : [],
  variants: Array.isArray(value?.variants) ? value?.variants ?? [] : [],
  prices: Array.isArray(value?.prices) ? value?.prices ?? [] : [],
  attributes: Array.isArray(value?.attributes) ? value?.attributes ?? [] : [],
  categories: Array.isArray(value?.categories) ? value?.categories ?? [] : [],
  suppliers: Array.isArray(value?.suppliers) ? value?.suppliers ?? [] : [],
  media: Array.isArray(value?.media) ? value?.media ?? [] : [],
  bundles: Array.isArray(value?.bundles) ? value?.bundles ?? [] : [],
  profile: {
    type: value?.profile?.type ?? "physical",
    physical: value?.profile?.physical ?? {},
    software: value?.profile?.software ?? {},
    service: value?.profile?.service ?? {},
    subscription: value?.profile?.subscription ?? {},
  },
});

const safeParseMetadata = (metadataJson?: string): ProductMetadataForm => {
  if (!metadataJson) {
    return buildEmptyMetadata();
  }

  try {
    const parsed = JSON.parse(metadataJson) as Partial<ProductMetadataForm>;
    return normalizeMetadata(parsed);
  } catch {
    return buildEmptyMetadata();
  }
};

const mapProductToForm = (product: ProductDto): ProductFormValues => {
  const metadata = safeParseMetadata(product.metadataJson);

  return {
    ...buildDefaultValues(),
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
    metadata,
  };
};

const getNestedValue = (target: unknown, path: string) =>
  path.split(".").reduce<any>((acc, key) => (acc ? acc[key] : undefined), target as any);

const countErrors = (value: unknown): number => {
  if (!value) {
    return 0;
  }

  if (
    typeof value === "object" &&
    ((value as { message?: string; type?: string }).message || (value as { type?: string }).type)
  ) {
    return 1;
  }

  if (Array.isArray(value)) {
    return value.reduce((sum, item) => sum + countErrors(item), 0);
  }

  if (typeof value === "object") {
    return Object.values(value as Record<string, unknown>).reduce((sum, item) => sum + countErrors(item), 0);
  }

  return 0;
};

const GeneralInfoTab: React.FC = () => {
  const {
    register,
    formState: { errors },
  } = useFormContext<ProductFormValues>();

  return (
    <div className="row g-3">
      <div className="col-md-4">
        <label className="form-label">Urun Kodu</label>
        <input className="form-control" {...register("productCode", { required: "Urun kodu zorunlu" })} />
        {errors.productCode ? <span className="invalid">Urun kodu zorunlu</span> : null}
      </div>
      <div className="col-md-4">
        <label className="form-label">Urun Adi</label>
        <input className="form-control" {...register("name", { required: "Urun adi zorunlu" })} />
        {errors.name ? <span className="invalid">Urun adi zorunlu</span> : null}
      </div>
      <div className="col-md-4">
        <label className="form-label">Para Birimi</label>
        <select
          className="form-control form-select"
          {...register("defaultCurrencyCode", { required: "Para birimi zorunlu" })}
        >
          <option value="TRY">TRY</option>
          <option value="USD">USD</option>
          <option value="EUR">EUR</option>
        </select>
        {errors.defaultCurrencyCode ? <span className="invalid">Para birimi zorunlu</span> : null}
      </div>
      <div className="col-md-6">
        <label className="form-label">Kisa Aciklama</label>
        <textarea className="form-control" rows={2} {...register("shortDescription")} />
      </div>
      <div className="col-md-6">
        <label className="form-label">Aciklama</label>
        <textarea className="form-control" rows={2} {...register("description")} />
      </div>
      <div className="col-md-3">
        <label className="form-label">Profil Tipi</label>
        <select className="form-control form-select" {...register("kind", { valueAsNumber: true })}>
          <option value={1}>Fiziksel</option>
          <option value={2}>Yazilim</option>
          <option value={3}>Servis</option>
          <option value={4}>Abonelik</option>
        </select>
      </div>
      <div className="col-md-3">
        <label className="form-label">Durum</label>
        <select className="form-control form-select" {...register("status", { valueAsNumber: true })}>
          <option value={0}>Taslak</option>
          <option value={1}>Aktif</option>
          <option value={2}>Pasif</option>
        </select>
      </div>
      <div className="col-md-3">
        <label className="form-label">Marka</label>
        <input className="form-control" {...register("brand")} />
      </div>
      <div className="col-md-3">
        <label className="form-label">Uretici</label>
        <input className="form-control" {...register("manufacturer")} />
      </div>
      <div className="col-md-3">
        <label className="form-label">Barkod</label>
        <input className="form-control" {...register("barcode")} />
      </div>
      <div className="col-md-3">
        <label className="form-label">Birim</label>
        <input className="form-control" {...register("unitOfMeasure")} />
      </div>
      <div className="col-md-3">
        <label className="form-label">Vergi Orani</label>
        <input type="number" className="form-control" {...register("taxRate", { valueAsNumber: true })} />
      </div>
      <div className="col-md-3">
        <label className="form-label">Vergi Kodu</label>
        <input className="form-control" {...register("taxCode")} />
      </div>
      <div className="col-md-6">
        <label className="form-label">Etiketler</label>
        <input className="form-control" placeholder="etiket1, etiket2" {...register("tags")} />
      </div>
      <div className="col-md-6">
        <label className="form-label">Satis Ayarlari</label>
        <div className="d-flex flex-wrap gap-3 mt-2">
          <div className="form-check">
            <input type="checkbox" className="form-check-input" {...register("isActive")} />
            <label className="form-check-label">Aktif</label>
          </div>
          <div className="form-check">
            <input type="checkbox" className="form-check-input" {...register("isSellable")} />
            <label className="form-check-label">Satilabilir</label>
          </div>
          <div className="form-check">
            <input type="checkbox" className="form-check-input" {...register("isPurchasable")} />
            <label className="form-check-label">Satin Alinabilir</label>
          </div>
          <div className="form-check">
            <input type="checkbox" className="form-check-input" {...register("trackInventory")} />
            <label className="form-check-label">Stok Takibi</label>
          </div>
        </div>
      </div>
    </div>
  );
};

const ProductFormPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  const { data: product, isLoading } = useProductDetail(id);
  const { createMutation, updateMutation } = useProductMutations();
  const [activeTab, setActiveTab] = useState("general");

  const defaultValues = useMemo(() => buildDefaultValues(), []);
  const form = useForm<ProductFormValues>({
    defaultValues,
    mode: "onBlur",
  });

  const {
    handleSubmit,
    reset,
    setValue,
    control,
    formState: { errors, isDirty },
  } = form;

  const kindValue = useWatch({ control, name: "kind" });

  useEffect(() => {
    if (product) {
      reset(mapProductToForm(product));
    }
  }, [product, reset]);

  useEffect(() => {
    const profileTypeMap: Record<number, "physical" | "software" | "service" | "subscription"> = {
      1: "physical",
      2: "software",
      3: "service",
      4: "subscription",
    };

    const nextType = profileTypeMap[Number(kindValue)] ?? "physical";
    setValue("metadata.profile.type", nextType, { shouldDirty: true });
  }, [kindValue, setValue]);

  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (!isDirty) {
        return;
      }
      event.preventDefault();
      event.returnValue = "";
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDirty]);

  const errorCount = countErrors(errors);
  const getTabErrorCount = (paths: string[]) =>
    paths.reduce((sum, path) => sum + countErrors(getNestedValue(errors, path)), 0);

  const tabErrorCounts = {
    general: getTabErrorCount(["productCode", "name", "defaultCurrencyCode"]),
    variants: getTabErrorCount(["metadata.variantAxes", "metadata.variants"]),
    prices: getTabErrorCount(["metadata.prices"]),
    attributes: getTabErrorCount(["metadata.attributes"]),
    categories: getTabErrorCount(["metadata.categories"]),
    suppliers: getTabErrorCount(["metadata.suppliers"]),
    media: getTabErrorCount(["metadata.media"]),
    bundles: getTabErrorCount(["metadata.bundles"]),
    profile: getTabErrorCount(["metadata.profile"]),
  };

  const onSubmit = async (values: ProductFormValues) => {
    const payloadBase = {
      productCode: values.productCode,
      name: values.name,
      shortDescription: values.shortDescription,
      description: values.description,
      kind: Number(values.kind ?? 0),
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
      metadataJson: JSON.stringify(values.metadata ?? buildEmptyMetadata()),
    };

    if (isEdit && id) {
      await updateMutation.mutateAsync({
        id,
        payload: payloadBase,
      });
      navigate(`/products/${id}`);
      return;
    }

    const created = await createMutation.mutateAsync(payloadBase);
    navigate(`/products/${created.id}`);
  };

  const tabs: TabItem[] = [
    { id: "general", label: "Genel Bilgi", badge: tabErrorCounts.general || undefined, content: <GeneralInfoTab /> },
    { id: "variants", label: "Varyantlar", badge: tabErrorCounts.variants || undefined, content: <VariantBuilder /> },
    { id: "prices", label: "Fiyatlar", badge: tabErrorCounts.prices || undefined, content: <PriceMatrix /> },
    { id: "attributes", label: "Ozellikler", badge: tabErrorCounts.attributes || undefined, content: <AttributeSelector /> },
    { id: "categories", label: "Kategoriler", badge: tabErrorCounts.categories || undefined, content: <CategoryTreeSelector /> },
    { id: "suppliers", label: "Tedarikciler", badge: tabErrorCounts.suppliers || undefined, content: <SupplierMultiSelect /> },
    { id: "media", label: "Medya", badge: tabErrorCounts.media || undefined, content: <MediaUploadManager /> },
    { id: "bundles", label: "Bundle Urunler", badge: tabErrorCounts.bundles || undefined, content: <BundleProductPicker /> },
    { id: "profile", label: "Profil", badge: tabErrorCounts.profile || undefined, content: <ProfileEditor /> },
  ];

  return (
    <>
      <Head title={isEdit ? "Urun Duzenle" : "Yeni Urun"} />
      <Content>
        <FormProvider {...form}>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="nk-block-head nk-block-head-sm">
              <div className="nk-block-between g-3">
                <div className="nk-block-head-content">
                  <h3 className="nk-block-title page-title">{isEdit ? "Urun Duzenle" : "Yeni Urun"}</h3>
                </div>
                <div className="nk-block-head-content">
                  <div className="d-flex gap-2">
                    <Button color="light" type="button" onClick={() => navigate("/products")}
                      disabled={createMutation.isPending || updateMutation.isPending}
                    >
                      Iptal
                    </Button>
                    <Button color="primary" type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                      Kaydet
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {isEdit && isLoading ? (
              <div className="card card-bordered">
                <div className="card-inner">Yukleniyor...</div>
              </div>
            ) : (
              <>
                {errorCount > 0 ? (
                  <div className="alert alert-warning">
                    Formda {errorCount} hata bulunuyor. Sekmeler uzerindeki sayaci takip edin.
                  </div>
                ) : null}
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
