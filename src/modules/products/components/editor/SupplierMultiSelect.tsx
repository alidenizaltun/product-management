import React from "react";
import { Button } from "reactstrap";
import { useFieldArray, useFormContext } from "react-hook-form";
import { ProductFormValues } from "@/modules/products/types/productEditor.types";

const supplierOptions = [
  { value: "sup-1", label: "ABC Tedarik" },
  { value: "sup-2", label: "XYZ Dagitim" },
];

const SupplierMultiSelect: React.FC = () => {
  const { control, register } = useFormContext<ProductFormValues>();
  const { fields, append, remove } = useFieldArray({ control, name: "metadata.suppliers" });

  return (
    <div className="card card-bordered">
      <div className="card-inner border-bottom">
        <div className="d-flex flex-wrap justify-content-between align-items-center gap-2">
          <div>
            <h6 className="mb-0">Tedarikciler</h6>
            <small className="text-muted">Urun icin birden fazla tedarikci ekleyebilirsiniz.</small>
          </div>
          <Button
            color="light"
            size="sm"
            type="button"
            onClick={() => append({ supplierId: "", leadTimeDays: undefined, purchasePrice: undefined })}
          >
            Tedarikci Ekle
          </Button>
        </div>
      </div>

      <div className="card-inner">
        {fields.length === 0 ? (
          <div className="alert alert-light mb-0">Henus tedarikci eklenmedi.</div>
        ) : (
          <div className="d-flex flex-column gap-2">
            {fields.map((field, index) => (
              <div key={field.id} className="border rounded p-3">
                <div className="row g-3 align-items-end">
                  <div className="col-md-4">
                    <label className="form-label">Tedarikci</label>
                    <select className="form-control form-select" {...register(`metadata.suppliers.${index}.supplierId` as const)}>
                      <option value="">Seciniz</option>
                      {supplierOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="col-md-3">
                    <label className="form-label">Lead Time (gun)</label>
                    <input
                      type="number"
                      className="form-control"
                      {...register(`metadata.suppliers.${index}.leadTimeDays` as const, { valueAsNumber: true })}
                    />
                  </div>
                  <div className="col-md-3">
                    <label className="form-label">Alis Fiyati</label>
                    <input
                      type="number"
                      step="0.01"
                      className="form-control"
                      {...register(`metadata.suppliers.${index}.purchasePrice` as const, { valueAsNumber: true })}
                    />
                  </div>
                  <div className="col-md-2 text-end">
                    <Button color="danger" size="sm" type="button" onClick={() => remove(index)}>
                      Kaldir
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SupplierMultiSelect;
