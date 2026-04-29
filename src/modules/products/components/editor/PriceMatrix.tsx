import React from "react";
import { useFieldArray, useFormContext } from "react-hook-form";
import { ProductFormValues } from "@/modules/products/types/productEditor.types";

const PRICE_TYPES = [
  { value: 1, label: "Satış Fiyatı" },
  { value: 2, label: "Maliyet Fiyatı" },
  { value: 3, label: "Liste Fiyatı" },
  { value: 4, label: "Kampanya Fiyatı" },
];

const emptyPrice = () => ({
  priceType: 1,
  amount: undefined as number | undefined,
  compareAtAmount: undefined as number | undefined,
  currencyCode: "TRY",
  minQuantity: undefined as number | undefined,
  maxQuantity: undefined as number | undefined,
  validFrom: "",
  validTo: "",
  salesChannel: "",
  customerGroupCode: "",
});

const PriceMatrix: React.FC = () => {
  const { control, register, formState: { errors } } = useFormContext<ProductFormValues>();
  const { fields, append, remove } = useFieldArray({ control, name: "prices" });

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h6 className="overline-title text-primary mb-0">Fiyat Matrisi</h6>
          <p className="text-soft fs-13px mb-0">Farklı kanallar, müşteri grupları ve dönemler için fiyat tanımlayın.</p>
        </div>
        <button
          type="button"
          className="btn btn-outline-primary btn-sm"
          onClick={() => append(emptyPrice())}
        >
          <em className="icon ni ni-plus me-1" />
          Fiyat Ekle
        </button>
      </div>

      {fields.length === 0 && (
        <div className="text-center py-5 text-soft">
          <em className="icon ni ni-sign-turkish-lira fs-2 d-block mb-2" />
          <p className="mb-0">Henüz fiyat eklenmedi.</p>
        </div>
      )}

      {fields.map((field, index) => (
        <div key={field.id} className="card card-bordered mb-3">
          <div className="card-inner">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <span className="badge bg-outline-primary">Fiyat #{index + 1}</span>
              <button
                type="button"
                className="btn btn-sm btn-icon btn-trigger text-danger"
                onClick={() => remove(index)}
                title="Fiyatı Sil"
              >
                <em className="icon ni ni-trash" />
              </button>
            </div>

            <div className="row g-3">
              <div className="col-md-3">
                <label className="form-label">Fiyat Tipi</label>
                <select
                  className="form-control form-select"
                  {...register(`prices.${index}.priceType`, { valueAsNumber: true })}
                >
                  {PRICE_TYPES.map((pt) => (
                    <option key={pt.value} value={pt.value}>{pt.label}</option>
                  ))}
                </select>
              </div>

              <div className="col-md-3">
                <label className="form-label">
                  Tutar <span className="text-danger">*</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  className={`form-control ${errors.prices?.[index]?.amount ? "is-invalid" : ""}`}
                  placeholder="0.00"
                  {...register(`prices.${index}.amount`, {
                    valueAsNumber: true,
                    required: "Tutar zorunludur",
                  })}
                />
                {errors.prices?.[index]?.amount && (
                  <div className="invalid-feedback">{errors.prices[index]?.amount?.message}</div>
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
                  {...register(`prices.${index}.compareAtAmount`, { valueAsNumber: true })}
                />
              </div>

              <div className="col-md-3">
                <label className="form-label">Para Birimi</label>
                <select
                  className="form-control form-select"
                  {...register(`prices.${index}.currencyCode`)}
                >
                  <option value="TRY">TRY</option>
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                  <option value="GBP">GBP</option>
                </select>
              </div>

              <div className="col-md-3">
                <label className="form-label">Min. Miktar</label>
                <input
                  type="number"
                  min="1"
                  className="form-control"
                  placeholder="1"
                  {...register(`prices.${index}.minQuantity`, { valueAsNumber: true })}
                />
              </div>

              <div className="col-md-3">
                <label className="form-label">Maks. Miktar</label>
                <input
                  type="number"
                  min="1"
                  className="form-control"
                  placeholder="—"
                  {...register(`prices.${index}.maxQuantity`, { valueAsNumber: true })}
                />
              </div>

              <div className="col-md-3">
                <label className="form-label">Geçerlilik Başlangıcı</label>
                <input
                  type="datetime-local"
                  className="form-control"
                  {...register(`prices.${index}.validFrom`)}
                />
              </div>

              <div className="col-md-3">
                <label className="form-label">Geçerlilik Bitişi</label>
                <input
                  type="datetime-local"
                  className="form-control"
                  {...register(`prices.${index}.validTo`)}
                />
              </div>

              <div className="col-md-6">
                <label className="form-label">Satış Kanalı</label>
                <input
                  className="form-control"
                  placeholder="web, mobile, pos..."
                  {...register(`prices.${index}.salesChannel`)}
                />
              </div>

              <div className="col-md-6">
                <label className="form-label">Müşteri Grubu Kodu</label>
                <input
                  className="form-control"
                  placeholder="retail, wholesale, vip..."
                  {...register(`prices.${index}.customerGroupCode`)}
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
          onClick={() => append(emptyPrice())}
        >
          <em className="icon ni ni-plus me-1" />
          Fiyat Ekle
        </button>
      )}
    </div>
  );
};

export default PriceMatrix;
