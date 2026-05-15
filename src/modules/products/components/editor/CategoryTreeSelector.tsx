import React from "react";
import { useFieldArray, useFormContext, Controller } from "react-hook-form";
import { ProductFormValues } from "@/modules/products/types/productEditor.types";
import CategoryTreeSelect from "@/modules/shared/components/selects/CategoryTreeSelect";

const emptyCategory = () => ({
  productCategoryId: "",
  isPrimary: false,
  sortOrder: 0,
});

const CategoryTreeSelector: React.FC = () => {
  const { control, register, formState: { errors } } = useFormContext<ProductFormValues>();
  const { fields, append, remove } = useFieldArray({ control, name: "categoryMaps" });

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h6 className="overline-title text-primary mb-0">Kategori Atamaları</h6>
          <p className="text-soft fs-13px mb-0">Ürünü bir veya birden fazla kategoriye atayın.</p>
        </div>
        <button
          type="button"
          className="btn btn-outline-primary btn-sm"
          onClick={() => append(emptyCategory())}
        >
          <em className="icon ni ni-plus me-1" />
          Kategori Ekle
        </button>
      </div>

      {fields.length === 0 && (
        <div className="text-center py-5 text-soft">
          <em className="icon ni ni-layers fs-2 d-block mb-2" />
          <p className="mb-0">Henüz kategori eklenmedi.</p>
        </div>
      )}

      {fields.map((field, index) => (
        <div key={field.id} className="card card-bordered mb-3">
          <div className="card-inner">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <span className="badge bg-outline-primary">Kategori #{index + 1}</span>
              <button
                type="button"
                className="btn btn-sm btn-icon btn-trigger text-danger"
                onClick={() => remove(index)}
                title="Kategoriyi Kaldır"
              >
                <em className="icon ni ni-trash" />
              </button>
            </div>

            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label">
                  Kategori <span className="text-danger">*</span>
                </label>
                <Controller
                  control={control}
                  name={`categoryMaps.${index}.productCategoryId`}
                  rules={{ required: "Kategori seçiniz" }}
                  render={({ field: f }) => (
                    <CategoryTreeSelect
                      value={f.value || null}
                      onChange={(val) => f.onChange(val ?? "")}
                    />
                  )}
                />
                {errors.categoryMaps?.[index]?.productCategoryId && (
                  <div className="text-danger fs-12px mt-1">
                    {errors.categoryMaps[index]?.productCategoryId?.message}
                  </div>
                )}
              </div>

              <div className="col-md-3">
                <label className="form-label">Sıralama</label>
                <input
                  type="number"
                  min="0"
                  className="form-control"
                  placeholder="0"
                  {...register(`categoryMaps.${index}.sortOrder`, { valueAsNumber: true })}
                />
              </div>

              <div className="col-md-3 d-flex align-items-end pb-1">
                <div className="form-check form-switch">
                  <input
                    type="checkbox"
                    className="form-check-input"
                    id={`cat-primary-${field.id}`}
                    {...register(`categoryMaps.${index}.isPrimary`)}
                  />
                  <label className="form-check-label" htmlFor={`cat-primary-${field.id}`}>
                    Birincil Kategori
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
          onClick={() => append(emptyCategory())}
        >
          <em className="icon ni ni-plus me-1" />
          Kategori Ekle
        </button>
      )}
    </div>
  );
};

export default CategoryTreeSelector;
