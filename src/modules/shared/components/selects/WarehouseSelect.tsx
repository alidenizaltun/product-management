import React from "react";
import Select from "react-select";

interface WarehouseSelectProps {
  value: string | null;
  onChange: (value: string | null) => void;
}

const options = [
  { value: "wh-ank", label: "Ankara Depo" },
  { value: "wh-ist", label: "İstanbul Depo" },
];

const WarehouseSelect: React.FC<WarehouseSelectProps> = ({ value, onChange }) => {
  return (
    <Select
      options={options}
      value={options.find((item) => item.value === value) ?? null}
      onChange={(selected) => onChange(selected?.value ?? null)}
      placeholder="Depo seçin"
      isClearable
    />
  );
};

export default WarehouseSelect;
