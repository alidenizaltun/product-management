import React from "react";
import { useFieldArray, useFormContext, Controller } from "react-hook-form";
import { ProductFormValues } from "@/modules/products/types/productEditor.types";
import ProductSelect from "@/modules/shared/components/selects/ProductSelect";

const emptyBundle = () => ({
  childProductId: "",
  quantity: 1,
  isOptional: false,
});

const BundleProductPicker: React.FC = () => {
  const { control, register, formState: { errors } } = useFormContext<ProductFormValues>();
  const { fields, append, remove } = useFieldArray({ control, name: "bundleItems" });

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h6 className="overline-title text-primary mb-0">Bundle Ürünler</h6>
          <p className="text-soft fs-13px mb-0">Bu paketin içindeki ürünleri ve miktarlarını tanımlayın.</p>
        </div>
        <button
          type="button"
          className="btn btn-outline-primary btn-sm"
          onClick={() => append(emptyBundle())}
        >
          <em className="icon ni ni-plus me-1" />
          Ürün Ekle
        </button>
      </div>

      {fields.length === 0 && (
        <div className="text-center py-5 text-soft">
          <em className="icon ni ni-box fs-2 d-block mb-2" />
          <p className="mb-0">Henüz bundle ürün eklenmedi.</p>
        </div>
      )}

      {fields.map((field, index) => (
        <div key={field.id} className="card card-bordered mb-3">
          <div className="card-inner">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <span className="badge bg-outline-primary">Bundle Öğe #{index + 1}</span>
              <button
                type="button"
                className="btn btn-sm btn-icon btn-trigger text-danger"
                onClick={() => remove(index)}
                title="Öğeyi Kaldır"
              >
                <em className="icon ni ni-trash" />
              </button>
            </div>

            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label">
                  Ürün <span className="text-danger">*</span>
                </label>
                <Controller
                  control={control}
                  name={`bundleItems.${index}.childProductId`}
                  rules={{ required: "Ürün seçiniz" }}
                  render={({ field: f }) => (
                    <ProductSelect
                      value={f.value || null}
                      onChange={(val) => f.onChange(val ?? "")}
                    />
                  )}
                />
                {errors.bundleItems?.[index]?.childProductId && (
                  <div className="text-danger fs-12px mt-1">
                    {errors.bundleItems[index]?.childProductId?.message}
                  </div>
                )}
              </div>

              <div className="col-md-3">
                <label className="form-label">
                  Miktar <span className="text-danger">*</span>
                </label>
                <input
                  type="number"
                  min="1"
                  className={`form-control ${errors.bundleItems?.[index]?.quantity ? "is-invalid" : ""}`}
                  placeholder="1"
                  {...register(`bundleItems.${index}.quantity`, {
                    valueAsNumber: true,
                    required: "Miktar zorunludur",
                    min: { value: 1, message: "En az 1 olmalıdır" },
                  })}
                />
                {errors.bundleItems?.[index]?.quantity && (
                  <div className="invalid-feedback">{errors.bundleItems[index]?.quantity?.message}</div>
                )}
              </div>

              <div className="col-md-3 d-flex align-items-end pb-1">
                <div className="form-check form-switch">
                  <input
                    type="checkbox"
                    className="form-check-input"
                    id={`bundle-optional-${field.id}`}
                    {...register(`bundleItems.${index}.isOptional`)}
                  />
                  <label className="form-check-label" htmlFor={`bundle-optional-${field.id}`}>
                    İsteğe Bağlı
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
          onClick={() => append(emptyBundle())}
        >
          <em className="icon ni ni-plus me-1" />
          Ürün Ekle
        </button>
      )}
    </div>
  );
};

export default BundleProductPicker;
