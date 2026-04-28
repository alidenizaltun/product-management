import React from "react";
import Select from "react-select";
import { Controller, useFormContext } from "react-hook-form";
import { ProductFormValues } from "@/modules/products/types/productEditor.types";

const categoryOptions = [
  { value: "cat-electronics", label: "Elektronik" },
  { value: "cat-electronics-accessories", label: "Elektronik / Aksesuar" },
  { value: "cat-fashion", label: "Moda" },
  { value: "cat-fashion-men", label: "Moda / Erkek" },
  { value: "cat-fashion-women", label: "Moda / Kadin" },
  { value: "cat-software", label: "Yazilim" },
];

const CategoryTreeSelector: React.FC = () => {
  const { control } = useFormContext<ProductFormValues>();

  return (
    <div className="card card-bordered">
      <div className="card-inner border-bottom">
        <div>
          <h6 className="mb-0">Kategoriler</h6>
          <small className="text-muted">Ana ve ikincil kategorileri secin.</small>
        </div>
      </div>
      <div className="card-inner">
        <label className="form-label">Kategori Secimi</label>
        <Controller
          control={control}
          name="metadata.categories"
          render={({ field }) => (
            <Select
              isMulti
              options={categoryOptions}
              value={categoryOptions.filter((option) => field.value?.includes(option.value))}
              onChange={(selected) => field.onChange((selected ?? []).map((item) => item.value))}
              placeholder="Kategori secin"
            />
          )}
        />
      </div>
    </div>
  );
};

export default CategoryTreeSelector;
