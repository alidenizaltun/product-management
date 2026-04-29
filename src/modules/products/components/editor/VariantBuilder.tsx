import React from "react";
import { useFieldArray, useFormContext } from "react-hook-form";
import { ProductFormValues } from "@/modules/products/types/productEditor.types";

const emptyVariant = () => ({
  sku: "",
  name: "",
  optionValuesJson: "",
  additionalPrice: undefined as number | undefined,
  additionalCost: undefined as number | undefined,
  isActive: true,
});

const VariantBuilder: React.FC = () => {
  const { control, register, formState: { errors } } = useFormContext<ProductFormValues>();
  const { fields, append, remove } = useFieldArray({ control, name: "variants" });

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h6 className="overline-title text-primary mb-0">Ürün Varyantları</h6>
          <p className="text-soft fs-13px mb-0">Her varyant için SKU, fiyat farkı ve seçenek değerleri tanımlayın.</p>
        </div>
        <button
          type="button"
          className="btn btn-outline-primary btn-sm"
          onClick={() => append(emptyVariant())}
        >
          <em className="icon ni ni-plus me-1" />
          Varyant Ekle
        </button>
      </div>

      {fields.length === 0 && (
        <div className="text-center py-5 text-soft">
          <em className="icon ni ni-package fs-2 d-block mb-2" />
          <p className="mb-0">Henüz varyant eklenmedi.</p>
        </div>
      )}

      {fields.map((field, index) => (
        <div key={field.id} className="card card-bordered mb-3">
          <div className="card-inner">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <span className="badge bg-outline-primary">Varyant #{index + 1}</span>
              <button
                type="button"
                className="btn btn-sm btn-icon btn-trigger text-danger"
                onClick={() => remove(index)}
                title="Varyantı Sil"
              >
                <em className="icon ni ni-trash" />
              </button>
            </div>

            <div className="row g-3">
              <div className="col-md-4">
                <label className="form-label">
                  SKU <span className="text-danger">*</span>
                </label>
                <input
                  className={`form-control ${errors.variants?.[index]?.sku ? "is-invalid" : ""}`}
                  placeholder="PRD-0001-RED-L"
                  {...register(`variants.${index}.sku`, { required: "SKU zorunludur" })}
                />
                {errors.variants?.[index]?.sku && (
                  <div className="invalid-feedback">{errors.variants[index]?.sku?.message}</div>
                )}
              </div>

              <div className="col-md-4">
                <label className="form-label">Varyant Adı</label>
                <input
                  className="form-control"
                  placeholder="Kırmızı / L"
                  {...register(`variants.${index}.name`)}
                />
              </div>

              <div className="col-md-4">
                <label className="form-label">Seçenek Değerleri (JSON)</label>
                <input
                  className="form-control"
                  placeholder='{"color":"red","size":"L"}'
                  {...register(`variants.${index}.optionValuesJson`)}
                />
              </div>

              <div className="col-md-3">
                <label className="form-label">Ek Fiyat</label>
                <div className="form-control-wrap">
                  <div className="form-icon form-icon-left">
                    <em className="icon ni ni-sign-turkish-lira" />
                  </div>
                  <input
                    type="number"
                    step="0.01"
                    className="form-control ps-4"
                    placeholder="0.00"
                    {...register(`variants.${index}.additionalPrice`, { valueAsNumber: true })}
                  />
                </div>
              </div>

              <div className="col-md-3">
                <label className="form-label">Ek Maliyet</label>
                <div className="form-control-wrap">
                  <div className="form-icon form-icon-left">
                    <em className="icon ni ni-sign-turkish-lira" />
                  </div>
                  <input
                    type="number"
                    step="0.01"
                    className="form-control ps-4"
                    placeholder="0.00"
                    {...register(`variants.${index}.additionalCost`, { valueAsNumber: true })}
                  />
                </div>
              </div>

              <div className="col-md-3 d-flex align-items-end pb-1">
                <div className="form-check form-switch">
                  <input
                    type="checkbox"
                    className="form-check-input"
                    id={`variant-active-${field.id}`}
                    {...register(`variants.${index}.isActive`)}
                  />
                  <label className="form-check-label" htmlFor={`variant-active-${field.id}`}>
                    Aktif
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}

      {fields.length > 0 && (
        <button
          type="button"
          className="btn btn-outline-primary btn-sm"
          onClick={() => append(emptyVariant())}
        >
          <em className="icon ni ni-plus me-1" />
          Varyant Ekle
        </button>
      )}
    </div>
  );
};

export default VariantBuilder;
