import React from "react";
import { useFieldArray, useFormContext, Controller } from "react-hook-form";
import { ProductFormValues } from "@/pages/products/types/productEditor.types";
import AttributeDefinitionSelect from "@/components/shared/selects/AttributeDefinitionSelect";

const emptyAttribute = () => ({
  attributeDefinitionId: "",
  valueText: "",
});

const AttributeSelector: React.FC = () => {
  const { control, register, formState: { errors } } = useFormContext<ProductFormValues>();
  const { fields, append, remove } = useFieldArray({ control, name: "attributeValues" });

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h6 className="overline-title text-primary mb-0">Ürün Özellikleri</h6>
          <p className="text-soft fs-13px mb-0">Ürüne atanacak özellik tanımı ve değerlerini girin.</p>
        </div>
        <button
          type="button"
          className="btn btn-outline-primary btn-sm"
          onClick={() => append(emptyAttribute())}
        >
          <em className="icon ni ni-plus me-1" />
          Özellik Ekle
        </button>
      </div>

      {fields.length === 0 && (
        <div className="text-center py-5 text-soft">
          <em className="icon ni ni-list-check fs-2 d-block mb-2" />
          <p className="mb-0">Henüz özellik eklenmedi.</p>
        </div>
      )}

      {fields.map((field, index) => (
        <div key={field.id} className="card card-bordered mb-3">
          <div className="card-inner">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <span className="badge bg-outline-primary">Özellik #{index + 1}</span>
              <button
                type="button"
                className="btn btn-sm btn-icon btn-trigger text-danger"
                onClick={() => remove(index)}
                title="Özelliği Sil"
              >
                <em className="icon ni ni-trash" />
              </button>
            </div>

            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label">
                  Özellik Tanımı <span className="text-danger">*</span>
                </label>
                <Controller
                  control={control}
                  name={`attributeValues.${index}.attributeDefinitionId`}
                  rules={{ required: "Özellik tanımı seçiniz" }}
                  render={({ field: f }) => (
                    <AttributeDefinitionSelect
                      value={f.value || null}
                      onChange={(val) => f.onChange(val ?? "")}
                    />
                  )}
                />
                {errors.attributeValues?.[index]?.attributeDefinitionId && (
                  <div className="text-danger fs-12px mt-1">
                    {errors.attributeValues[index]?.attributeDefinitionId?.message}
                  </div>
                )}
              </div>

              <div className="col-md-6">
                <label className="form-label">
                  Değer <span className="text-danger">*</span>
                </label>
                <input
                  className={`form-control ${errors.attributeValues?.[index]?.valueText ? "is-invalid" : ""}`}
                  placeholder="Özellik değeri"
                  {...register(`attributeValues.${index}.valueText`, { required: "Değer zorunludur" })}
                />
                {errors.attributeValues?.[index]?.valueText && (
                  <div className="invalid-feedback">
                    {errors.attributeValues[index]?.valueText?.message}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}

      {fields.length > 0 && (
        <button
          type="button"
          className="btn btn-outline-primary btn-sm"
          onClick={() => append(emptyAttribute())}
        >
          <em className="icon ni ni-plus me-1" />
          Özellik Ekle
        </button>
      )}
    </div>
  );
};

export default AttributeSelector;
