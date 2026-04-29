import React from "react";
import { usePriceListLookups } from "@/services/lookup/useLookups";
import LookupSelect from "./LookupSelect";

interface PriceListSelectProps {
  value: string | null;
  onChange: (value: string | null) => void;
  placeholder?: string;
  isInvalid?: boolean;
  error?: string;
  includeInactive?: boolean;
}

const PriceListSelect: React.FC<PriceListSelectProps> = ({
  value,
  onChange,
  placeholder = "Fiyat listesi seçin",
  isInvalid,
  error,
  includeInactive = false,
}) => {
  const { data, isLoading } = usePriceListLookups(includeInactive);

  return (
    <LookupSelect
      items={data}
      isLoading={isLoading}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      isInvalid={isInvalid}
      error={error}
    />
  );
};

export default PriceListSelect;
