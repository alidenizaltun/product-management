import React from "react";
import { Button } from "reactstrap";
import { useFieldArray, useFormContext } from "react-hook-form";
import { ProductFormValues } from "@/modules/products/types/productEditor.types";

const PriceMatrix: React.FC = () => {
  const { control, register } = useFormContext<ProductFormValues>();
  const { fields, append, remove } = useFieldArray({ control, name: "metadata.prices" });

  return (
    <div className="card card-bordered">
      <div className="card-inner border-bottom">
        <div className="d-flex flex-wrap justify-content-between align-items-center gap-2">
          <div>
            <h6 className="mb-0">Fiyat Matrisi</h6>
            <small className="text-muted">Fiyat listelerine gore urun ve varyant fiyatlarini girin.</small>
          </div>
          <Button
            color="light"
            size="sm"
            type="button"
            onClick={() =>
              append({
                priceListId: "",
                currency: "TRY",
                variantSku: "",
                amount: undefined,
                minQty: undefined,
                validFrom: "",
                validTo: "",
              })
            }
          >
            Satir Ekle
          </Button>
        </div>
      </div>
      <div className="card-inner">
        {fields.length === 0 ? (
          <div className="alert alert-light mb-0">Fiyat satiri bulunmuyor.</div>
        ) : (
          <div className="d-flex flex-column gap-2">
            {fields.map((field, index) => (
              <div key={field.id} className="border rounded p-3">
                <div className="row g-3 align-items-end">
                  <div className="col-md-3">
                    <label className="form-label">Fiyat Listesi</label>
                    <input className="form-control" {...register(`metadata.prices.${index}.priceListId` as const)} />
                  </div>
                  <div className="col-md-2">
                    <label className="form-label">Para Birimi</label>
                    <select className="form-control form-select" {...register(`metadata.prices.${index}.currency` as const)}>
                      <option value="TRY">TRY</option>
                      <option value="USD">USD</option>
                      <option value="EUR">EUR</option>
                    </select>
                  </div>
                  <div className="col-md-2">
                    <label className="form-label">Varyant SKU</label>
                    <input className="form-control" {...register(`metadata.prices.${index}.variantSku` as const)} />
                  </div>
                  <div className="col-md-2">
                    <label className="form-label">Tutar</label>
                    <input
                      type="number"
                      step="0.01"
                      className="form-control"
                      {...register(`metadata.prices.${index}.amount` as const, { valueAsNumber: true })}
                    />
                  </div>
                  <div className="col-md-1">
                    <label className="form-label">Min Adet</label>
                    <input
                      type="number"
                      className="form-control"
                      {...register(`metadata.prices.${index}.minQty` as const, { valueAsNumber: true })}
                    />
                  </div>
                  <div className="col-md-1">
                    <label className="form-label">Baslangic</label>
                    <input type="date" className="form-control" {...register(`metadata.prices.${index}.validFrom` as const)} />
                  </div>
                  <div className="col-md-1">
                    <label className="form-label">Bitis</label>
                    <input type="date" className="form-control" {...register(`metadata.prices.${index}.validTo` as const)} />
                  </div>
                  <div className="col-md-12 text-end">
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

export default PriceMatrix;
