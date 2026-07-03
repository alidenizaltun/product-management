import React, { useState } from "react";
import { useFieldArray, useFormContext } from "react-hook-form";
import { ProductFormValues } from "@/modules/products/types/productEditor.types";
import JsonFieldEditor from "@/modules/shared/components/JsonFieldEditor";

const emptyVariant = () => ({
  sku: "",
  name: "",
  optionValuesJson: "",
  additionalPrice: undefined as number | undefined,
  additionalCost: undefined as number | undefined,
  isActive: true,
});

const VariantBuilder: React.FC = () => {
  const { control, register, getValues, formState: { errors } } = useFormContext<ProductFormValues>();
  const { fields, append, remove } = useFieldArray({ control, name: "variants" });
  const [optionName, setOptionName] = useState("Renk");
  const [optionValue, setOptionValue] = useState("");
  const [optionValues, setOptionValues] = useState<string[]>([]);

  const addOptionValue = () => {
    const value = optionValue.trim();
    if (!value || optionValues.includes(value)) return;
    setOptionValues((current) => [...current, value]);
    setOptionValue("");
  };

  const createVariantsFromOptions = () => {
    const baseSku = getValues("productCode") || "PRD";
    optionValues.forEach((value) => {
      const suffix = value
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toUpperCase()
        .replace(/[^A-Z0-9]+/g, "-")
        .replace(/^-|-$/g, "");

      append({
        sku: `${baseSku}-${suffix || "VAR"}`,
        name: value,
        optionValuesJson: JSON.stringify({ [optionName || "Seçenek"]: value }),
        additionalPrice: 0,
        additionalCost: 0,
        isActive: true,
      });
    });
    setOptionValues([]);
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h6 className="overline-title text-primary mb-0">Ürün Varyantları</h6>
          <p className="text-soft fs-13px mb-0">Seçenek değerlerini girin, sistem varyant satırlarını oluştursun.</p>
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

      <div className="card card-bordered bg-lighter mb-3">
        <div className="card-inner">
          <div className="row g-3 align-items-end">
            <div className="col-md-3">
              <label className="form-label">Seçenek</label>
              <input
                className="form-control"
                value={optionName}
                onChange={(event) => setOptionName(event.target.value)}
                placeholder="Renk, Beden"
              />
            </div>
            <div className="col-md-5">
              <label className="form-label">Değer</label>
              <div className="input-group">
                <input
                  className="form-control"
                  value={optionValue}
                  onChange={(event) => setOptionValue(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      event.preventDefault();
                      addOptionValue();
                    }
                  }}
                  placeholder="Kırmızı, Siyah, L"
                />
                <button type="button" className="btn btn-outline-light" onClick={addOptionValue}>
                  Ekle
                </button>
              </div>
            </div>
            <div className="col-md-4">
              <button
                type="button"
                className="btn btn-primary w-100"
                disabled={!optionValues.length}
                onClick={createVariantsFromOptions}
              >
                <em className="icon ni ni-grid-plus me-1" />
                Matris oluştur
              </button>
            </div>
            {optionValues.length > 0 && (
              <div className="col-12 d-flex flex-wrap gap-2">
                {optionValues.map((value) => (
                  <span key={value} className="badge bg-outline-primary">
                    {value}
                    <button
                      type="button"
                      className="btn btn-xs btn-icon btn-trigger ms-1 p-0"
                      onClick={() => setOptionValues((current) => current.filter((item) => item !== value))}
                      aria-label={`${value} değerini kaldır`}
                    >
                      <em className="icon ni ni-cross" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
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
                <JsonFieldEditor
                  name={`variants.${index}.optionValuesJson`}
                  label="Seçenek Değerleri"
                  type="object"
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
