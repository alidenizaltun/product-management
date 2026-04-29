import React from "react";
import { useFieldArray, useFormContext, Controller } from "react-hook-form";
import { ProductFormValues } from "@/modules/products/types/productEditor.types";
import WarehouseSelect from "@/modules/shared/components/selects/WarehouseSelect";

const INVENTORY_POLICIES = [
  { value: 1, label: "Stok Takibi Yap" },
  { value: 2, label: "Stoksuzken Satış İzni" },
  { value: 3, label: "Stoksuzken Satış Engeli" },
];

const emptyInventory = () => ({
  warehouseId: "",
  warehouseCode: "",
  quantityOnHand: undefined as number | undefined,
  quantityReserved: undefined as number | undefined,
  reorderPoint: undefined as number | undefined,
  reorderQuantity: undefined as number | undefined,
  inventoryPolicy: 1,
});

const InventoryTab: React.FC = () => {
  const { control, register, formState: { errors } } = useFormContext<ProductFormValues>();
  const { fields, append, remove } = useFieldArray({ control, name: "inventories" });

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h6 className="overline-title text-primary mb-0">Stok Bilgileri</h6>
          <p className="text-soft fs-13px mb-0">Depo bazlı stok miktarları ve sipariş eşiklerini tanımlayın.</p>
        </div>
        <button
          type="button"
          className="btn btn-outline-primary btn-sm"
          onClick={() => append(emptyInventory())}
        >
          <em className="icon ni ni-plus me-1" />
          Depo Ekle
        </button>
      </div>

      {fields.length === 0 && (
        <div className="text-center py-5 text-soft">
          <em className="icon ni ni-archive fs-2 d-block mb-2" />
          <p className="mb-0">Henüz stok bilgisi eklenmedi.</p>
        </div>
      )}

      {fields.map((field, index) => (
        <div key={field.id} className="card card-bordered mb-3">
          <div className="card-inner">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <span className="badge bg-outline-primary">Depo #{index + 1}</span>
              <button
                type="button"
                className="btn btn-sm btn-icon btn-trigger text-danger"
                onClick={() => remove(index)}
                title="Depoyu Kaldır"
              >
                <em className="icon ni ni-trash" />
              </button>
            </div>

            <div className="row g-3">
              <div className="col-md-4">
                <label className="form-label">
                  Depo <span className="text-danger">*</span>
                </label>
                <Controller
                  control={control}
                  name={`inventories.${index}.warehouseId`}
                  rules={{ required: "Depo seçiniz" }}
                  render={({ field: f }) => (
                    <WarehouseSelect
                      value={f.value || null}
                      onChange={(val) => f.onChange(val ?? "")}
                    />
                  )}
                />
                {errors.inventories?.[index]?.warehouseId && (
                  <div className="text-danger fs-12px mt-1">
                    {errors.inventories[index]?.warehouseId?.message}
                  </div>
                )}
              </div>

              <div className="col-md-4">
                <label className="form-label">Depo Kodu</label>
                <input
                  className="form-control"
                  placeholder="IST-01"
                  {...register(`inventories.${index}.warehouseCode`)}
                />
              </div>

              <div className="col-md-4">
                <label className="form-label">Stok Politikası</label>
                <select
                  className="form-control form-select"
                  {...register(`inventories.${index}.inventoryPolicy`, { valueAsNumber: true })}
                >
                  {INVENTORY_POLICIES.map((ip) => (
                    <option key={ip.value} value={ip.value}>{ip.label}</option>
                  ))}
                </select>
              </div>

              <div className="col-md-3">
                <label className="form-label">Eldeki Miktar</label>
                <input
                  type="number"
                  min="0"
                  className="form-control"
                  placeholder="0"
                  {...register(`inventories.${index}.quantityOnHand`, { valueAsNumber: true })}
                />
              </div>

              <div className="col-md-3">
                <label className="form-label">Rezerve Miktar</label>
                <input
                  type="number"
                  min="0"
                  className="form-control"
                  placeholder="0"
                  {...register(`inventories.${index}.quantityReserved`, { valueAsNumber: true })}
                />
              </div>

              <div className="col-md-3">
                <label className="form-label">Yeniden Sipariş Noktası</label>
                <input
                  type="number"
                  min="0"
                  className="form-control"
                  placeholder="5"
                  {...register(`inventories.${index}.reorderPoint`, { valueAsNumber: true })}
                />
              </div>

              <div className="col-md-3">
                <label className="form-label">Yeniden Sipariş Miktarı</label>
                <input
                  type="number"
                  min="0"
                  className="form-control"
                  placeholder="20"
                  {...register(`inventories.${index}.reorderQuantity`, { valueAsNumber: true })}
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
          onClick={() => append(emptyInventory())}
        >
          <em className="icon ni ni-plus me-1" />
          Depo Ekle
        </button>
      )}
    </div>
  );
};

export default InventoryTab;
