import React from "react";
import { useFormContext, useWatch } from "react-hook-form";
import { ProductFormValues, ProductProfileType } from "@/modules/products/types/productEditor.types";

const profileByKind: Record<number, ProductProfileType> = {
  1: "physical",
  2: "software",
  3: "service",
  4: "subscription",
};

const ProfileEditor: React.FC = () => {
  const { control, register } = useFormContext<ProductFormValues>();
  const kind = useWatch({ control, name: "kind" });
  const profileType = profileByKind[Number(kind)] ?? "physical";

  return (
    <div className="card card-bordered">
      <div className="card-inner border-bottom">
        <div>
          <h6 className="mb-0">Profil</h6>
          <small className="text-muted">Profil tipi {profileType} secimine gore dinamik alanlar.</small>
        </div>
      </div>
      <div className="card-inner">
        {profileType === "physical" && (
          <div className="row g-3">
            <div className="col-md-3">
              <label className="form-label">Agirlik (kg)</label>
              <input
                type="number"
                step="0.01"
                className="form-control"
                {...register("metadata.profile.physical.weight", { valueAsNumber: true })}
              />
            </div>
            <div className="col-md-3">
              <label className="form-label">Genislik (cm)</label>
              <input
                type="number"
                className="form-control"
                {...register("metadata.profile.physical.width", { valueAsNumber: true })}
              />
            </div>
            <div className="col-md-3">
              <label className="form-label">Yukseklik (cm)</label>
              <input
                type="number"
                className="form-control"
                {...register("metadata.profile.physical.height", { valueAsNumber: true })}
              />
            </div>
            <div className="col-md-3">
              <label className="form-label">Derinlik (cm)</label>
              <input
                type="number"
                className="form-control"
                {...register("metadata.profile.physical.depth", { valueAsNumber: true })}
              />
            </div>
            <div className="col-md-3">
              <label className="form-label">Garanti (ay)</label>
              <input
                type="number"
                className="form-control"
                {...register("metadata.profile.physical.warrantyMonths", { valueAsNumber: true })}
              />
            </div>
          </div>
        )}

        {profileType === "software" && (
          <div className="row g-3">
            <div className="col-md-4">
              <label className="form-label">Lisans Tipi</label>
              <input className="form-control" {...register("metadata.profile.software.licenseType")} />
            </div>
            <div className="col-md-4">
              <label className="form-label">Download URL</label>
              <input className="form-control" {...register("metadata.profile.software.downloadUrl")} />
            </div>
            <div className="col-md-4">
              <label className="form-label">Platform</label>
              <input className="form-control" {...register("metadata.profile.software.platform")} />
            </div>
          </div>
        )}

        {profileType === "service" && (
          <div className="row g-3">
            <div className="col-md-6">
              <label className="form-label">Servis Tipi</label>
              <input className="form-control" {...register("metadata.profile.service.serviceType")} />
            </div>
            <div className="col-md-6">
              <label className="form-label">Sure (dakika)</label>
              <input
                type="number"
                className="form-control"
                {...register("metadata.profile.service.durationMinutes", { valueAsNumber: true })}
              />
            </div>
          </div>
        )}

        {profileType === "subscription" && (
          <div className="row g-3">
            <div className="col-md-6">
              <label className="form-label">Faturalama Donemi</label>
              <input className="form-control" {...register("metadata.profile.subscription.billingPeriod")} />
            </div>
            <div className="col-md-6">
              <label className="form-label">Deneme Gun</label>
              <input
                type="number"
                className="form-control"
                {...register("metadata.profile.subscription.trialDays", { valueAsNumber: true })}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileEditor;
