import React from "react";
import { useFormContext, useWatch } from "react-hook-form";
import { ProductFormValues } from "@/modules/products/types/productEditor.types";

const PhysicalProfileForm: React.FC = () => {
  const { register } = useFormContext<ProductFormValues>();
  return (
    <div>
      <h6 className="overline-title text-primary mb-3">Fiziksel Özellikler</h6>
      <div className="row g-3">
        <div className="col-md-3">
          <label className="form-label">Ağırlık (kg)</label>
          <input
            type="number"
            step="0.001"
            min="0"
            className="form-control"
            placeholder="0.000"
            {...register("physicalProfile.weight", { valueAsNumber: true })}
          />
        </div>
        <div className="col-md-3">
          <label className="form-label">Genişlik (cm)</label>
          <input
            type="number"
            step="0.1"
            min="0"
            className="form-control"
            placeholder="0.0"
            {...register("physicalProfile.width", { valueAsNumber: true })}
          />
        </div>
        <div className="col-md-3">
          <label className="form-label">Yükseklik (cm)</label>
          <input
            type="number"
            step="0.1"
            min="0"
            className="form-control"
            placeholder="0.0"
            {...register("physicalProfile.height", { valueAsNumber: true })}
          />
        </div>
        <div className="col-md-3">
          <label className="form-label">Uzunluk (cm)</label>
          <input
            type="number"
            step="0.1"
            min="0"
            className="form-control"
            placeholder="0.0"
            {...register("physicalProfile.length", { valueAsNumber: true })}
          />
        </div>
        <div className="col-md-3">
          <label className="form-label">Garanti Süresi (ay)</label>
          <input
            type="number"
            min="0"
            className="form-control"
            placeholder="24"
            {...register("physicalProfile.warrantyInMonths", { valueAsNumber: true })}
          />
        </div>
        <div className="col-md-9">
          <label className="form-label">Özellikler</label>
          <div className="d-flex flex-wrap gap-4 mt-1">
            <div className="form-check form-switch">
              <input type="checkbox" className="form-check-input" id="requires-shipping" {...register("physicalProfile.requiresShipping")} />
              <label className="form-check-label" htmlFor="requires-shipping">Kargo Gerektirir</label>
            </div>
            <div className="form-check form-switch">
              <input type="checkbox" className="form-check-input" id="is-fragile" {...register("physicalProfile.isFragile")} />
              <label className="form-check-label" htmlFor="is-fragile">Kırılgan</label>
            </div>
            <div className="form-check form-switch">
              <input type="checkbox" className="form-check-input" id="is-hazardous" {...register("physicalProfile.isHazardous")} />
              <label className="form-check-label" htmlFor="is-hazardous">Tehlikeli Madde</label>
            </div>
            <div className="form-check form-switch">
              <input type="checkbox" className="form-check-input" id="requires-serial" {...register("physicalProfile.requiresSerialNumber")} />
              <label className="form-check-label" htmlFor="requires-serial">Seri No Gerektirir</label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const SoftwareProfileForm: React.FC = () => {
  const { register } = useFormContext<ProductFormValues>();
  const LICENSE_MODELS = [
    { value: 1, label: "Tek Seferlik" },
    { value: 2, label: "Abonelik" },
    { value: 3, label: "Açık Kaynak" },
    { value: 4, label: "Deneme" },
  ];
  return (
    <div>
      <h6 className="overline-title text-primary mb-3">Yazılım Profili</h6>
      <div className="row g-3">
        <div className="col-md-4">
          <label className="form-label">Sürüm</label>
          <input className="form-control" placeholder="1.0.0" {...register("softwareProfile.version")} />
        </div>
        <div className="col-md-4">
          <label className="form-label">Lisans Modeli</label>
          <select className="form-control form-select" {...register("softwareProfile.licenseModel", { valueAsNumber: true })}>
            <option value="">Seçiniz</option>
            {LICENSE_MODELS.map((lm) => (
              <option key={lm.value} value={lm.value}>{lm.label}</option>
            ))}
          </select>
        </div>
        <div className="col-md-4">
          <label className="form-label">Koltuk Sayısı</label>
          <input type="number" min="1" className="form-control" placeholder="1" {...register("softwareProfile.seatCount", { valueAsNumber: true })} />
        </div>
        <div className="col-12">
          <label className="form-label">İndirme URL</label>
          <input className="form-control" placeholder="https://example.com/download" {...register("softwareProfile.downloadUrl")} />
        </div>
        <div className="col-md-6">
          <label className="form-label">Desteklenen Platformlar (JSON)</label>
          <input className="form-control" placeholder='["windows","mac","linux"]' {...register("softwareProfile.supportedPlatformsJson")} />
        </div>
        <div className="col-md-6">
          <label className="form-label">Sistem Gereksinimleri (JSON)</label>
          <input className="form-control" placeholder='{"ram":"8GB","os":"Windows 10+"}' {...register("softwareProfile.systemRequirementsJson")} />
        </div>
        <div className="col-12">
          <label className="form-label">Sürüm Notları</label>
          <textarea className="form-control" rows={3} placeholder="Yeni özellikler ve değişiklikler..." {...register("softwareProfile.releaseNotes")} />
        </div>
      </div>
    </div>
  );
};

const ServiceProfileForm: React.FC = () => {
  const { register } = useFormContext<ProductFormValues>();
  const DELIVERY_MODES = [
    { value: 1, label: "Fiziksel Konum" },
    { value: 2, label: "Online / Uzaktan" },
    { value: 3, label: "Karma" },
  ];
  return (
    <div>
      <h6 className="overline-title text-primary mb-3">Hizmet Profili</h6>
      <div className="row g-3">
        <div className="col-md-4">
          <label className="form-label">Teslimat Modu</label>
          <select className="form-control form-select" {...register("serviceProfile.deliveryMode", { valueAsNumber: true })}>
            <option value="">Seçiniz</option>
            {DELIVERY_MODES.map((dm) => (
              <option key={dm.value} value={dm.value}>{dm.label}</option>
            ))}
          </select>
        </div>
        <div className="col-md-4">
          <label className="form-label">Süre (dakika)</label>
          <input type="number" min="0" className="form-control" placeholder="60" {...register("serviceProfile.durationInMinutes", { valueAsNumber: true })} />
        </div>
        <div className="col-md-4">
          <label className="form-label">Maks. Eşzamanlı Rezervasyon</label>
          <input type="number" min="1" className="form-control" placeholder="1" {...register("serviceProfile.maxConcurrentBooking", { valueAsNumber: true })} />
        </div>
        <div className="col-12">
          <label className="form-label">Hizmet Alanı (JSON)</label>
          <input className="form-control" placeholder='{"city":"Istanbul","district":"Kadıköy"}' {...register("serviceProfile.serviceAreaJson")} />
        </div>
      </div>
    </div>
  );
};

const SubscriptionProfileForm: React.FC = () => {
  const { register } = useFormContext<ProductFormValues>();
  const BILLING_UNITS = [
    { value: 1, label: "Gün" },
    { value: 2, label: "Hafta" },
    { value: 3, label: "Ay" },
    { value: 4, label: "Yıl" },
  ];
  return (
    <div>
      <h6 className="overline-title text-primary mb-3">Abonelik Profili</h6>
      <div className="row g-3">
        <div className="col-md-3">
          <label className="form-label">Faturalama Periyodu</label>
          <select className="form-control form-select" {...register("subscriptionProfile.billingPeriodUnit", { valueAsNumber: true })}>
            <option value="">Seçiniz</option>
            {BILLING_UNITS.map((bu) => (
              <option key={bu.value} value={bu.value}>{bu.label}</option>
            ))}
          </select>
        </div>
        <div className="col-md-3">
          <label className="form-label">Periyot Değeri</label>
          <input type="number" min="1" className="form-control" placeholder="1" {...register("subscriptionProfile.billingPeriodValue", { valueAsNumber: true })} />
        </div>
        <div className="col-md-3">
          <label className="form-label">Deneme Süresi (gün)</label>
          <input type="number" min="0" className="form-control" placeholder="14" {...register("subscriptionProfile.trialDays", { valueAsNumber: true })} />
        </div>
        <div className="col-md-3">
          <label className="form-label">İzin Süresi (gün)</label>
          <input type="number" min="0" className="form-control" placeholder="7" {...register("subscriptionProfile.gracePeriodDays", { valueAsNumber: true })} />
        </div>
        <div className="col-md-6">
          <label className="form-label">İptal Politikası</label>
          <input className="form-control" placeholder="Esnek, Katı..." {...register("subscriptionProfile.cancellationPolicy")} />
        </div>
        <div className="col-md-6 d-flex align-items-end pb-1">
          <div className="form-check form-switch">
            <input type="checkbox" className="form-check-input" id="auto-renew" {...register("subscriptionProfile.autoRenew")} />
            <label className="form-check-label" htmlFor="auto-renew">Otomatik Yenileme</label>
          </div>
        </div>
      </div>
    </div>
  );
};

const ProfileEditor: React.FC = () => {
  const { control } = useFormContext<ProductFormValues>();
  const kindValue = useWatch({ control, name: "kind" });
  const kind = Number(kindValue);

  const profileMap: Record<number, React.ReactNode> = {
    1: <PhysicalProfileForm />,
    2: <SoftwareProfileForm />,
    3: <ServiceProfileForm />,
    4: <SubscriptionProfileForm />,
  };

  const profileLabels: Record<number, string> = {
    1: "Fiziksel Ürün",
    2: "Yazılım",
    3: "Hizmet",
    4: "Abonelik",
  };

  return (
    <div>
      {kind && profileLabels[kind] ? (
        <div className="alert alert-info d-flex align-items-center gap-2 mb-4">
          <em className="icon ni ni-info" />
          <span>
            <strong>{profileLabels[kind]}</strong> tipine ait profil alanları gösteriliyor. Ürün tipini
            değiştirmek için <em>Genel Bilgi</em> sekmesine gidin.
          </span>
        </div>
      ) : null}
      {profileMap[kind] ?? (
        <div className="text-center py-5 text-soft">
          <em className="icon ni ni-file-doc fs-2 d-block mb-2" />
          <p className="mb-0">Profil görüntülemek için ürün tipini seçin.</p>
        </div>
      )}
    </div>
  );
};

export default ProfileEditor;
