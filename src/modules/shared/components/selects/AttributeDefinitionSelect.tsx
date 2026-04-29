import React from "react";
import Select from "react-select";

interface AttributeDefinitionSelectProps {
  value: string | null;
  onChange: (value: string | null) => void;
  placeholder?: string;
}

const options = [
  { value: "attr-color", label: "Renk" },
  { value: "attr-size", label: "Boyut" },
  { value: "attr-material", label: "Materyal" },
  { value: "attr-weight", label: "Ağırlık" },
];

const AttributeDefinitionSelect: React.FC<AttributeDefinitionSelectProps> = ({
  value,
  onChange,
  placeholder = "Özellik tanımı seçin",
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

export default AttributeDefinitionSelect;
