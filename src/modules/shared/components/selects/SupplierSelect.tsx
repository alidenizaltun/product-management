import React from "react";
import Select from "react-select";

interface SupplierSelectProps {
  value: string | null;
  onChange: (value: string | null) => void;
}

const options = [
  { value: "sup-1", label: "ABC Tedarik" },
  { value: "sup-2", label: "XYZ Dağıtım" },
];

const SupplierSelect: React.FC<SupplierSelectProps> = ({ value, onChange }) => {
  return (
    <Select
      options={options}
      value={options.find((item) => item.value === value) ?? null}
      onChange={(selected) => onChange(selected?.value ?? null)}
      placeholder="Tedarikçi seçin"
      isClearable
    />
  );
};

export default SupplierSelect;
