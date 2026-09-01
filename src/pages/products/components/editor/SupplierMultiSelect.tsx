import React from "react";
import { useFieldArray, useFormContext, Controller } from "react-hook-form";
import { ProductFormValues } from "@/pages/products/types/productEditor.types";
import SupplierSelect from "@/components/shared/selects/SupplierSelect";

const emptySupplier = () => ({
  productSupplierId: "",
  supplierProductCode: "",
  supplierCost: undefined as number | undefined,
  leadTimeInDays: undefined as number | undefined,
  minOrderQuantity: undefined as number | undefined,
  isPreferred: false,
});

const SupplierMultiSelect: React.FC = () => {
  const { control, register, formState: { errors } } = useFormContext<ProductFormValues>();
  const { fields, append, remove } = useFieldArray({ control, name: "supplierMaps" });

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h6 className="overline-title text-primary mb-0">Tedarikçi Atamaları</h6>
          <p className="text-soft fs-13px mb-0">Bu ürün için tedarikçi ve tedarik koşullarını tanımlayın.</p>
        </div>
        <button
          type="button"
          className="btn btn-outline-primary btn-sm"
          onClick={() => append(emptySupplier())}
        >
          <em className="icon ni ni-plus me-1" />
          Tedarikçi Ekle
        </button>
      </div>

      {fields.length === 0 && (
        <div className="text-center py-5 text-soft">
          <em className="icon ni ni-building fs-2 d-block mb-2" />
          <p className="mb-0">Henüz tedarikçi eklenmedi.</p>
        </div>
      )}

      {fields.map((field, index) => (
        <div key={field.id} className="card card-bordered mb-3">
          <div className="card-inner">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <span className="badge bg-outline-primary">Tedarikçi #{index + 1}</span>
              <button
                type="button"
                className="btn btn-sm btn-icon btn-trigger text-danger"
                onClick={() => remove(index)}
                title="Tedarikçiyi Kaldır"
              >
                <em className="icon ni ni-trash" />
              </button>
            </div>

            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label">
                  Tedarikçi <span className="text-danger">*</span>
                </label>
                <Controller
                  control={control}
                  name={`supplierMaps.${index}.productSupplierId`}
                  rules={{ required: "Tedarikçi seçiniz" }}
                  render={({ field: f }) => (
                    <SupplierSelect
                      value={f.value || null}
                      onChange={(val) => f.onChange(val ?? "")}
                    />
                  )}
                />
                {errors.supplierMaps?.[index]?.productSupplierId && (
                  <div className="text-danger fs-12px mt-1">
                    {errors.supplierMaps[index]?.productSupplierId?.message}
                  </div>
                )}
              </div>

              <div className="col-md-6">
                <label className="form-label">Tedarikçi Ürün Kodu</label>
                <input
                  className="form-control"
                  placeholder="SUP-001"
                  {...register(`supplierMaps.${index}.supplierProductCode`)}
                />
              </div>

              <div className="col-md-3">
                <label className="form-label">Tedarik Maliyeti</label>
                <div className="form-control-wrap">
                  <div className="form-icon form-icon-left">
                    <em className="icon ni ni-sign-turkish-lira" />
                  </div>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    className="form-control ps-4"
                    placeholder="0.00"
                    {...register(`supplierMaps.${index}.supplierCost`, { valueAsNumber: true })}
                  />
                </div>
              </div>

              <div className="col-md-3">
                <label className="form-label">Teslim Süresi (gün)</label>
                <input
                  type="number"
                  min="0"
                  className="form-control"
                  placeholder="3"
                  {...register(`supplierMaps.${index}.leadTimeInDays`, { valueAsNumber: true })}
                />
              </div>

              <div className="col-md-3">
                <label className="form-label">Min. Sipariş Miktarı</label>
                <input
                  type="number"
                  min="1"
                  className="form-control"
                  placeholder="1"
                  {...register(`supplierMaps.${index}.minOrderQuantity`, { valueAsNumber: true })}
                />
              </div>

              <div className="col-md-3 d-flex align-items-end pb-1">
                <div className="form-check form-switch">
                  <input
                    type="checkbox"
                    className="form-check-input"
                    id={`sup-preferred-${field.id}`}
                    {...register(`supplierMaps.${index}.isPreferred`)}
                  />
                  <label className="form-check-label" htmlFor={`sup-preferred-${field.id}`}>
                    Tercihli Tedarikçi
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
          onClick={() => append(emptySupplier())}
        >
          <em className="icon ni ni-plus me-1" />
          Tedarikçi Ekle
        </button>
      )}
    </div>
  );
};

export default SupplierMultiSelect;
