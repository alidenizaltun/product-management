import React from "react";
import { useFieldArray, useFormContext } from "react-hook-form";
import { ProductFormValues } from "@/modules/products/types/productEditor.types";

const TRANSACTION_TYPES = [
  { value: 1, label: "Giriş" },
  { value: 2, label: "Çıkış" },
  { value: 3, label: "Transfer" },
  { value: 4, label: "Düzeltme" },
  { value: 5, label: "İade" },
];

const emptyTransaction = () => ({
  transactionType: 1,
  quantity: undefined as number | undefined,
  unitCost: undefined as number | undefined,
  referenceType: "",
  referenceNumber: "",
  note: "",
  occurredAt: "",
});

const InventoryTransactionTab: React.FC = () => {
  const { control, register, formState: { errors } } = useFormContext<ProductFormValues>();
  const { fields, append, remove } = useFieldArray({ control, name: "inventoryTransactions" });

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h6 className="overline-title text-primary mb-0">Stok İşlemleri</h6>
          <p className="text-soft fs-13px mb-0">Başlangıç stok hareketleri ve düzeltmeler için kayıt oluşturun.</p>
        </div>
        <button
          type="button"
          className="btn btn-outline-primary btn-sm"
          onClick={() => append(emptyTransaction())}
        >
          <em className="icon ni ni-plus me-1" />
          İşlem Ekle
        </button>
      </div>

      {fields.length === 0 && (
        <div className="text-center py-5 text-soft">
          <em className="icon ni ni-exchange fs-2 d-block mb-2" />
          <p className="mb-0">Henüz stok işlemi eklenmedi.</p>
        </div>
      )}

      {fields.map((field, index) => (
        <div key={field.id} className="card card-bordered mb-3">
          <div className="card-inner">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <span className="badge bg-outline-primary">İşlem #{index + 1}</span>
              <button
                type="button"
                className="btn btn-sm btn-icon btn-trigger text-danger"
                onClick={() => remove(index)}
                title="İşlemi Sil"
              >
                <em className="icon ni ni-trash" />
              </button>
            </div>

            <div className="row g-3">
              <div className="col-md-3">
                <label className="form-label">İşlem Tipi</label>
                <select
                  className="form-control form-select"
                  {...register(`inventoryTransactions.${index}.transactionType`, { valueAsNumber: true })}
                >
                  {TRANSACTION_TYPES.map((tt) => (
                    <option key={tt.value} value={tt.value}>{tt.label}</option>
                  ))}
                </select>
              </div>

              <div className="col-md-3">
                <label className="form-label">
                  Miktar <span className="text-danger">*</span>
                </label>
                <input
                  type="number"
                  min="1"
                  className={`form-control ${errors.inventoryTransactions?.[index]?.quantity ? "is-invalid" : ""}`}
                  placeholder="0"
                  {...register(`inventoryTransactions.${index}.quantity`, {
                    valueAsNumber: true,
                    required: "Miktar zorunludur",
                  })}
                />
                {errors.inventoryTransactions?.[index]?.quantity && (
                  <div className="invalid-feedback">
                    {errors.inventoryTransactions[index]?.quantity?.message}
                  </div>
                )}
              </div>

              <div className="col-md-3">
                <label className="form-label">Birim Maliyet</label>
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
                    {...register(`inventoryTransactions.${index}.unitCost`, { valueAsNumber: true })}
                  />
                </div>
              </div>

              <div className="col-md-3">
                <label className="form-label">Gerçekleşme Tarihi</label>
                <input
                  type="datetime-local"
                  className="form-control"
                  {...register(`inventoryTransactions.${index}.occurredAt`)}
                />
              </div>

              <div className="col-md-3">
                <label className="form-label">Referans Tipi</label>
                <input
                  className="form-control"
                  placeholder="initial, order, adjustment..."
                  {...register(`inventoryTransactions.${index}.referenceType`)}
                />
              </div>

              <div className="col-md-3">
                <label className="form-label">Referans Numarası</label>
                <input
                  className="form-control"
                  placeholder="INIT-001"
                  {...register(`inventoryTransactions.${index}.referenceNumber`)}
                />
              </div>

              <div className="col-md-6">
                <label className="form-label">Not</label>
                <input
                  className="form-control"
                  placeholder="İşlem notu"
                  {...register(`inventoryTransactions.${index}.note`)}
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
          onClick={() => append(emptyTransaction())}
        >
          <em className="icon ni ni-plus me-1" />
          İşlem Ekle
        </button>
      )}
    </div>
  );
};

export default InventoryTransactionTab;
