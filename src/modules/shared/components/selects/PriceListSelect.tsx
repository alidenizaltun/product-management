import React from "react";
import Select from "react-select";

interface PriceListSelectProps {
  value: string | null;
  onChange: (value: string | null) => void;
  placeholder?: string;
}

const options = [
  { value: "pl-retail", label: "Perakende Fiyat Listesi" },
  { value: "pl-wholesale", label: "Toptan Fiyat Listesi" },
  { value: "pl-vip", label: "VIP Fiyat Listesi" },
];

const PriceListSelect: React.FC<PriceListSelectProps> = ({
  value,
  onChange,
  placeholder = "Fiyat listesi seçin",
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

export default PriceListSelect;
