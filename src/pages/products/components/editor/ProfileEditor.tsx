import React from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useFormContext, useWatch } from "react-hook-form";
import { ProductFormValues } from "@/pages/products/types/productEditor.types";
import {
  Checkbox,
  EmptyState,
  FormField,
  InlineAlert,
  JsonFieldEditor,
  NumberInput,
  Textarea,
  TextInput,
} from "@/components/shared";
import { BILLING_UNITS, getBillingPeriodValueForUnit } from "@/pages/products/utils/billingPeriod";
import { KIND_LABELS } from "@/pages/products/components/detail/constants";
import { buildProductSectionLink } from "@/pages/products/config/productSections";

const SUPPORTED_PLATFORMS = ["Windows", "macOS", "Linux", "iOS", "Android", "Web"];

const DELIVERY_MODES = [
  { value: 1, label: "Fiziksel Konum" },
  { value: 2, label: "Online / Uzaktan" },
  { value: 3, label: "Karma" },
];

const PhysicalProfileForm: React.FC = () => {
  const { register } = useFormContext<ProductFormValues>();

  return (
    <div className="row g-3">
      <div className="col-12">
        <h6 className="overline-title text-primary mb-3">Boyutlar ve Ağırlık</h6>
      </div>

      <div className="col-6 col-lg-3">
        <NumberInput
          label="Ağırlık (kg)"
          min={0}
          step="0.001"
          placeholder="0.000"
          {...register("physicalProfile.weight", { valueAsNumber: true })}
        />
      </div>
      <div className="col-6 col-lg-3">
        <NumberInput
          label="Genişlik (cm)"
          min={0}
          step="0.1"
          placeholder="0.0"
          {...register("physicalProfile.width", { valueAsNumber: true })}
        />
      </div>
      <div className="col-6 col-lg-3">
        <NumberInput
          label="Yükseklik (cm)"
          min={0}
          step="0.1"
          placeholder="0.0"
          {...register("physicalProfile.height", { valueAsNumber: true })}
        />
      </div>
      <div className="col-6 col-lg-3">
        <NumberInput
          label="Uzunluk (cm)"
          min={0}
          step="0.1"
          placeholder="0.0"
          {...register("physicalProfile.length", { valueAsNumber: true })}
        />
      </div>

      <div className="col-md-6 col-lg-3">
        <NumberInput
          label="Garanti Süresi (ay)"
          min={0}
          placeholder="24"
          {...register("physicalProfile.warrantyInMonths", { valueAsNumber: true })}
        />
      </div>

      <div className="col-12 mt-2">
        <h6 className="overline-title text-primary mb-3">Kargo ve Teslimat</h6>
        <div className="d-flex flex-wrap gap-4">
          <Checkbox label="Kargo Gerektirir" switchStyle {...register("physicalProfile.requiresShipping")} />
          <Checkbox label="Kırılgan" switchStyle {...register("physicalProfile.isFragile")} />
          <Checkbox label="Tehlikeli Madde" switchStyle {...register("physicalProfile.isHazardous")} />
          <Checkbox label="Seri No Gerektirir" switchStyle {...register("physicalProfile.requiresSerialNumber")} />
        </div>
      </div>
    </div>
  );
};

const SoftwareProfileForm: React.FC = () => {
  const { register } = useFormContext<ProductFormValues>();

  return (
    <div className="row g-3">
      <div className="col-12">
        <h6 className="overline-title text-primary mb-3">Yazılım Kimliği</h6>
      </div>

      <div className="col-md-6 col-lg-4">
        <TextInput label="Sürüm" placeholder="1.0.0" {...register("softwareProfile.version")} />
      </div>
      <div className="col-md-6 col-lg-8">
        <TextInput
          label="İndirme URL"
          placeholder="https://example.com/download"
          {...register("softwareProfile.downloadUrl")}
        />
      </div>

      <div className="col-12 mt-2">
        <h6 className="overline-title text-primary mb-3">Teknik Detaylar</h6>
      </div>

      <div className="col-12">
        <JsonFieldEditor
          name="softwareProfile.supportedPlatformsJson"
          label="Desteklenen Platformlar"
          type="array"
          suggestions={SUPPORTED_PLATFORMS}
        />
      </div>
      <div className="col-12">
        <JsonFieldEditor
          name="softwareProfile.systemRequirementsJson"
          label="Sistem Gereksinimleri"
          type="object"
        />
      </div>
      <div className="col-12">
        <Textarea
          label="Sürüm Notları"
          rows={4}
          placeholder="Yeni özellikler ve değişiklikler..."
          {...register("softwareProfile.releaseNotes")}
        />
      </div>
    </div>
  );
};

const ServiceProfileForm: React.FC = () => {
  const { register } = useFormContext<ProductFormValues>();

  return (
    <div className="row g-3">
      <div className="col-12">
        <h6 className="overline-title text-primary mb-3">Hizmet Bilgileri</h6>
      </div>

      <div className="col-md-6 col-lg-4">
        <FormField label="Teslimat Modu" htmlFor="service-delivery-mode">
          <select
            id="service-delivery-mode"
            className="form-control form-select"
            {...register("serviceProfile.deliveryMode", { valueAsNumber: true })}
          >
            <option value="">Seçiniz</option>
            {DELIVERY_MODES.map((mode) => (
              <option key={mode.value} value={mode.value}>
                {mode.label}
              </option>
            ))}
          </select>
        </FormField>
      </div>
      <div className="col-md-6 col-lg-4">
        <NumberInput
          label="Süre (dakika)"
          min={0}
          placeholder="60"
          {...register("serviceProfile.durationInMinutes", { valueAsNumber: true })}
        />
      </div>
      <div className="col-md-6 col-lg-4">
        <NumberInput
          label="Maks. Eşzamanlı Rezervasyon"
          min={1}
          placeholder="1"
          {...register("serviceProfile.maxConcurrentBooking", { valueAsNumber: true })}
        />
      </div>

      <div className="col-12">
        <JsonFieldEditor name="serviceProfile.serviceAreaJson" label="Hizmet Alanı" type="object" />
      </div>
    </div>
  );
};

const SubscriptionProfileForm: React.FC = () => {
  const { register, setValue } = useFormContext<ProductFormValues>();

  return (
    <div className="row g-3">
      <div className="col-12">
        <h6 className="overline-title text-primary mb-3">Faturalama</h6>
      </div>

      <div className="col-md-6 col-lg-3">
        <FormField label="Faturalama Periyodu" htmlFor="subscription-billing-unit">
          <select
            id="subscription-billing-unit"
            className="form-control form-select"
            {...register("subscriptionProfile.billingPeriodUnit", {
              valueAsNumber: true,
              onChange: (event) => {
                const nextValue = getBillingPeriodValueForUnit(event.target.value);
                setValue("subscriptionProfile.billingPeriodValue", nextValue, { shouldDirty: true });
              },
            })}
          >
            <option value="">Seçiniz</option>
            {BILLING_UNITS.map((unit) => (
              <option key={unit.value} value={unit.value}>
                {unit.label}
              </option>
            ))}
          </select>
        </FormField>
      </div>
      <div className="col-md-6 col-lg-3">
        <NumberInput
          label="Periyot Değeri"
          min={1}
          placeholder="1"
          {...register("subscriptionProfile.billingPeriodValue", { valueAsNumber: true })}
        />
      </div>
      <div className="col-md-6 col-lg-3">
        <NumberInput
          label="Deneme Süresi (gün)"
          min={0}
          placeholder="14"
          {...register("subscriptionProfile.trialDays", { valueAsNumber: true })}
        />
      </div>
      <div className="col-md-6 col-lg-3">
        <NumberInput
          label="İzin Süresi (gün)"
          min={0}
          placeholder="7"
          {...register("subscriptionProfile.gracePeriodDays", { valueAsNumber: true })}
        />
      </div>

      <div className="col-12 mt-2">
        <h6 className="overline-title text-primary mb-3">Yenileme ve İptal</h6>
      </div>

      <div className="col-lg-8">
        <TextInput
          label="İptal Politikası"
          placeholder="Esnek, Katı..."
          {...register("subscriptionProfile.cancellationPolicy")}
        />
      </div>
      <div className="col-12">
        <Checkbox label="Otomatik Yenileme" switchStyle {...register("subscriptionProfile.autoRenew")} />
      </div>
    </div>
  );
};

const renderProfileForm = (kind: number) => {
  switch (kind) {
    case 1:
      return <PhysicalProfileForm />;
    case 2:
      return <SoftwareProfileForm />;
    case 3:
      return <ServiceProfileForm />;
    case 4:
      return <SubscriptionProfileForm />;
    default:
      return null;
  }
};

const ProfileEditor: React.FC = () => {
  const { control } = useFormContext<ProductFormValues>();
  const [searchParams] = useSearchParams();
  const kind = Number(useWatch({ control, name: "kind" }));
  const kindMeta = KIND_LABELS[kind];
  const generalLink = buildProductSectionLink("general", searchParams.get("productId") || undefined);

  if (!kindMeta) {
    return (
      <EmptyState
        icon="setting-alt"
        title="Profil görüntülemek için ürün tipini seçin"
        description="Ürün tipi Genel Bilgiler sayfasından belirlenir."
        action={
          <Link to={generalLink} className="btn btn-outline-light">
            Genel Bilgiler
          </Link>
        }
      />
    );
  }

  return (
    <div>
      <InlineAlert
        color="info"
        className="mb-4"
        message={
          <>
            <strong>{kindMeta.label}</strong> tipine ait profil alanları gösteriliyor. Ürün tipini
            değiştirmek için{" "}
            <Link to={generalLink} className="alert-link">
              Genel Bilgiler
            </Link>{" "}
            sayfasına gidin.
          </>
        }
      />
      {renderProfileForm(kind)}
    </div>
  );
};

export default ProfileEditor;
