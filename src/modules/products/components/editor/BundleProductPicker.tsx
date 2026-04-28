import React from "react";
import { Button } from "reactstrap";
import { useFieldArray, useFormContext } from "react-hook-form";
import { ProductFormValues } from "@/modules/products/types/productEditor.types";

const BundleProductPicker: React.FC = () => {
  const { control, register } = useFormContext<ProductFormValues>();
  const { fields, append, remove } = useFieldArray({ control, name: "metadata.bundles" });

  return (
    <div className="card card-bordered">
      <div className="card-inner border-bottom">
        <div className="d-flex flex-wrap justify-content-between align-items-center gap-2">
          <div>
            <h6 className="mb-0">Bundle Urunler</h6>
            <small className="text-muted">Set halinde satilan urunleri iliskilendirin.</small>
          </div>
          <Button
            color="light"
            size="sm"
            type="button"
            onClick={() => append({ productId: "", variantId: "", quantity: 1 })}
          >
            Bundle Ekle
          </Button>
        </div>
      </div>

      <div className="card-inner">
        {fields.length === 0 ? (
          <div className="alert alert-light mb-0">Henus bundle urun eklenmedi.</div>
        ) : (
          <div className="d-flex flex-column gap-2">
            {fields.map((field, index) => (
              <div key={field.id} className="border rounded p-3">
                <div className="row g-3 align-items-end">
                  <div className="col-md-4">
                    <label className="form-label">Urun ID</label>
                    <input className="form-control" {...register(`metadata.bundles.${index}.productId` as const)} />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label">Varyant ID</label>
                    <input className="form-control" {...register(`metadata.bundles.${index}.variantId` as const)} />
                  </div>
                  <div className="col-md-2">
                    <label className="form-label">Adet</label>
                    <input
                      type="number"
                      className="form-control"
                      {...register(`metadata.bundles.${index}.quantity` as const, { valueAsNumber: true })}
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

export default BundleProductPicker;
