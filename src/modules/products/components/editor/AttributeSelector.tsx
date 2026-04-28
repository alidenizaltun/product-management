import React from "react";
import { Button } from "reactstrap";
import { useFieldArray, useFormContext } from "react-hook-form";
import { ProductFormValues } from "@/modules/products/types/productEditor.types";

const AttributeSelector: React.FC = () => {
  const { control, register, watch } = useFormContext<ProductFormValues>();
  const { fields, append, remove } = useFieldArray({ control, name: "metadata.attributes" });

  return (
    <div className="card card-bordered">
      <div className="card-inner border-bottom">
        <div className="d-flex flex-wrap justify-content-between align-items-center gap-2">
          <div>
            <h6 className="mb-0">Ozellikler</h6>
            <small className="text-muted">Urun ve varyant bazli ozellikleri tanimlayin.</small>
          </div>
          <Button
            color="light"
            size="sm"
            type="button"
            onClick={() => append({ definitionKey: "", value: "", scope: "product", variantSku: "" })}
          >
            Ozellik Ekle
          </Button>
        </div>
      </div>

      <div className="card-inner">
        {fields.length === 0 ? (
          <div className="alert alert-light mb-0">Henus ozellik eklenmedi.</div>
        ) : (
          <div className="d-flex flex-column gap-2">
            {fields.map((field, index) => {
              const scope = watch(`metadata.attributes.${index}.scope` as const);
              return (
                <div key={field.id} className="border rounded p-3">
                  <div className="row g-3 align-items-end">
                    <div className="col-md-3">
                      <label className="form-label">Tanim Anahtari</label>
                      <input className="form-control" {...register(`metadata.attributes.${index}.definitionKey` as const)} />
                    </div>
                    <div className="col-md-3">
                      <label className="form-label">Deger</label>
                      <input className="form-control" {...register(`metadata.attributes.${index}.value` as const)} />
                    </div>
                    <div className="col-md-2">
                      <label className="form-label">Kapsam</label>
                      <select className="form-control form-select" {...register(`metadata.attributes.${index}.scope` as const)}>
                        <option value="product">Urun</option>
                        <option value="variant">Varyant</option>
                      </select>
                    </div>
                    <div className="col-md-3">
                      <label className="form-label">Varyant SKU</label>
                      <input
                        className="form-control"
                        disabled={scope !== "variant"}
                        {...register(`metadata.attributes.${index}.variantSku` as const)}
                      />
                    </div>
                    <div className="col-md-1 text-end">
                      <Button color="danger" size="sm" type="button" onClick={() => remove(index)}>
                        Kaldir
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default AttributeSelector;
