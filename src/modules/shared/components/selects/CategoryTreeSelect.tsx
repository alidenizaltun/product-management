import React from "react";
import Select from "react-select";

interface CategoryTreeSelectProps {
  value: string | null;
  onChange: (value: string | null) => void;
}

const options = [
  { value: "cat-electronics", label: "Elektronik" },
  { value: "cat-accessories", label: "Aksesuar" },
  { value: "cat-software", label: "Yazılım" },
];

const CategoryTreeSelect: React.FC<CategoryTreeSelectProps> = ({ value, onChange }) => {
  return (
    <Select
      options={options}
      value={options.find((item) => item.value === value) ?? null}
      onChange={(selected) => onChange(selected?.value ?? null)}
      placeholder="Kategori seçin"
      isClearable
    />
  );
};

export default CategoryTreeSelect;
