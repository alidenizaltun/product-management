import React from "react";
import { useFieldArray, useFormContext, Controller } from "react-hook-form";
import { ProductFormValues } from "@/pages/products/types/productEditor.types";
import PriceListSelect from "@/components/shared/selects/PriceListSelect";

const emptyPriceListItem = () => ({
  productPriceListId: "",
  amount: undefined as number | undefined,
  compareAtAmount: undefined as number | undefined,
  minQuantity: undefined as number | undefined,
  maxQuantity: undefined as number | undefined,
});

const PriceListItemTab: React.FC = () => {
  const { control, register, formState: { errors } } = useFormContext<ProductFormValues>();
  const { fields, append, remove } = useFieldArray({ control, name: "priceListItems" });

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h6 className="overline-title text-primary mb-0">Fiyat Listesi Kalemleri</h6>
          <p className="text-soft fs-13px mb-0">Ürünü özel fiyat listelerine fiyatıyla birlikte ekleyin.</p>
        </div>
        <button
          type="button"
          className="btn btn-outline-primary btn-sm"
          onClick={() => append(emptyPriceListItem())}
        >
          <em className="icon ni ni-plus me-1" />
          Fiyat Listesi Ekle
        </button>
      </div>

      {fields.length === 0 && (
        <div className="text-center py-5 text-soft">
          <em className="icon ni ni-clip fs-2 d-block mb-2" />
          <p className="mb-0">Henüz fiyat listesi kalemi eklenmedi.</p>
        </div>
      )}

      {fields.map((field, index) => (
        <div key={field.id} className="card card-bordered mb-3">
          <div className="card-inner">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <span className="badge bg-outline-primary">Fiyat Listesi Kalemi #{index + 1}</span>
              <button
                type="button"
                className="btn btn-sm btn-icon btn-trigger text-danger"
                onClick={() => remove(index)}
                title="Kalemi Sil"
              >
                <em className="icon ni ni-trash" />
              </button>
            </div>

            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label">
                  Fiyat Listesi <span className="text-danger">*</span>
                </label>
                <Controller
                  control={control}
                  name={`priceListItems.${index}.productPriceListId`}
                  rules={{ required: "Fiyat listesi seçiniz" }}
                  render={({ field: f }) => (
                    <PriceListSelect
                      value={f.value || null}
                      onChange={(val) => f.onChange(val ?? "")}
                    />
                  )}
                />
                {errors.priceListItems?.[index]?.productPriceListId && (
                  <div className="text-danger fs-12px mt-1">
                    {errors.priceListItems[index]?.productPriceListId?.message}
                  </div>
                )}
              </div>

              <div className="col-md-3">
                <label className="form-label">
                  Tutar <span className="text-danger">*</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  className={`form-control ${errors.priceListItems?.[index]?.amount ? "is-invalid" : ""}`}
                  placeholder="0.00"
                  {...register(`priceListItems.${index}.amount`, {
                    valueAsNumber: true,
                    required: "Tutar zorunludur",
                  })}
                />
                {errors.priceListItems?.[index]?.amount && (
                  <div className="invalid-feedback">{errors.priceListItems[index]?.amount?.message}</div>
                )}
              </div>

              <div className="col-md-3">
                <label className="form-label">Karşılaştırma Fiyatı</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  className="form-control"
                  placeholder="0.00"
                  {...register(`priceListItems.${index}.compareAtAmount`, { valueAsNumber: true })}
                />
              </div>

              <div className="col-md-3">
                <label className="form-label">Min. Miktar</label>
                <input
                  type="number"
                  min="1"
                  className="form-control"
                  placeholder="1"
                  {...register(`priceListItems.${index}.minQuantity`, { valueAsNumber: true })}
                />
              </div>

              <div className="col-md-3">
                <label className="form-label">Maks. Miktar</label>
                <input
                  type="number"
                  min="1"
                  className="form-control"
                  placeholder="—"
                  {...register(`priceListItems.${index}.maxQuantity`, { valueAsNumber: true })}
                />
              </div>
            </div>
          </div>
        </div>
      ))}

      {fields.length > 0 && (
        <button
          type="button"
          className="btn btn-outline-primary btn-sm"
          onClick={() => append(emptyPriceListItem())}
        >
          <em className="icon ni ni-plus me-1" />
          Fiyat Listesi Ekle
        </button>
      )}
    </div>
  );
};

export default PriceListItemTab;
