import React from "react";
import Select from "react-select";

interface ProductSelectProps {
  value: string | null;
  onChange: (value: string | null) => void;
  placeholder?: string;
}

const options = [
  { value: "prod-001", label: "Ürün A (PRD-001)" },
  { value: "prod-002", label: "Ürün B (PRD-002)" },
  { value: "prod-003", label: "Ürün C (PRD-003)" },
];

const ProductSelect: React.FC<ProductSelectProps> = ({
  value,
  onChange,
  placeholder = "Ürün seçin",
}) => {
  return (
    <Select
      options={options}
      value={options.find((item) => item.value === value) ?? null}
      onChange={(selected) => onChange(selected?.value ?? null)}
      placeholder={placeholder}
      isClearable
    />
  );
};

export default ProductSelect;
