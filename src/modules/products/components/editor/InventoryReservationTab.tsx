import React from "react";
import { useFieldArray, useFormContext } from "react-hook-form";
import { ProductFormValues } from "@/modules/products/types/productEditor.types";

const RESERVATION_STATUSES = [
  { value: 1, label: "Aktif" },
  { value: 2, label: "Tamamlandı" },
  { value: 3, label: "İptal Edildi" },
  { value: 4, label: "Süresi Doldu" },
];

const emptyReservation = () => ({
  quantity: undefined as number | undefined,
  reservationCode: "",
  reservedUntil: "",
  status: 1,
  sourceType: "",
  sourceId: "",
});

const InventoryReservationTab: React.FC = () => {
  const { control, register, formState: { errors } } = useFormContext<ProductFormValues>();
  const { fields, append, remove } = useFieldArray({ control, name: "inventoryReservations" });

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h6 className="overline-title text-primary mb-0">Stok Rezervasyonları</h6>
          <p className="text-soft fs-13px mb-0">Belirli siparişler veya müşteriler için stok rezervasyonu oluşturun.</p>
        </div>
        <button
          type="button"
          className="btn btn-outline-primary btn-sm"
          onClick={() => append(emptyReservation())}
        >
          <em className="icon ni ni-plus me-1" />
          Rezervasyon Ekle
        </button>
      </div>

      {fields.length === 0 && (
        <div className="text-center py-5 text-soft">
          <em className="icon ni ni-lock-alt fs-2 d-block mb-2" />
          <p className="mb-0">Henüz rezervasyon eklenmedi.</p>
        </div>
      )}

      {fields.map((field, index) => (
        <div key={field.id} className="card card-bordered mb-3">
          <div className="card-inner">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <span className="badge bg-outline-primary">Rezervasyon #{index + 1}</span>
              <button
                type="button"
                className="btn btn-sm btn-icon btn-trigger text-danger"
                onClick={() => remove(index)}
                title="Rezervasyonu Sil"
              >
                <em className="icon ni ni-trash" />
              </button>
            </div>

            <div className="row g-3">
              <div className="col-md-4">
                <label className="form-label">
                  Rezervasyon Kodu <span className="text-danger">*</span>
                </label>
                <input
                  className={`form-control ${errors.inventoryReservations?.[index]?.reservationCode ? "is-invalid" : ""}`}
                  placeholder="RES-001"
                  {...register(`inventoryReservations.${index}.reservationCode`, {
                    required: "Rezervasyon kodu zorunludur",
                  })}
                />
                {errors.inventoryReservations?.[index]?.reservationCode && (
                  <div className="invalid-feedback">
                    {errors.inventoryReservations[index]?.reservationCode?.message}
                  </div>
                )}
              </div>

              <div className="col-md-4">
                <label className="form-label">
                  Miktar <span className="text-danger">*</span>
                </label>
                <input
                  type="number"
                  min="1"
                  className={`form-control ${errors.inventoryReservations?.[index]?.quantity ? "is-invalid" : ""}`}
                  placeholder="1"
                  {...register(`inventoryReservations.${index}.quantity`, {
                    valueAsNumber: true,
                    required: "Miktar zorunludur",
                  })}
                />
                {errors.inventoryReservations?.[index]?.quantity && (
                  <div className="invalid-feedback">
                    {errors.inventoryReservations[index]?.quantity?.message}
                  </div>
                )}
              </div>

              <div className="col-md-4">
                <label className="form-label">Durum</label>
                <select
                  className="form-control form-select"
                  {...register(`inventoryReservations.${index}.status`, { valueAsNumber: true })}
                >
                  {RESERVATION_STATUSES.map((rs) => (
                    <option key={rs.value} value={rs.value}>{rs.label}</option>
                  ))}
                </select>
              </div>

              <div className="col-md-4">
                <label className="form-label">Rezervasyon Bitişi</label>
                <input
                  type="datetime-local"
                  className="form-control"
                  {...register(`inventoryReservations.${index}.reservedUntil`)}
                />
              </div>

              <div className="col-md-4">
                <label className="form-label">Kaynak Tipi</label>
                <input
                  className="form-control"
                  placeholder="order, quote, hold..."
                  {...register(`inventoryReservations.${index}.sourceType`)}
                />
              </div>

              <div className="col-md-4">
                <label className="form-label">Kaynak ID</label>
                <input
                  className="form-control"
                  placeholder="ORD-1001"
                  {...register(`inventoryReservations.${index}.sourceId`)}
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
          onClick={() => append(emptyReservation())}
        >
          <em className="icon ni ni-plus me-1" />
          Rezervasyon Ekle
        </button>
      )}
    </div>
  );
};

export default InventoryReservationTab;
