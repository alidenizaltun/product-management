import React from "react";
import { useWarehouseLookups } from "@/services/lookup/useLookups";
import LookupSelect from "./LookupSelect";

interface WarehouseSelectProps {
  value: string | null;
  onChange: (value: string | null) => void;
  placeholder?: string;
  isInvalid?: boolean;
  error?: string;
  includeInactive?: boolean;
}

const WarehouseSelect: React.FC<WarehouseSelectProps> = ({
  value,
  onChange,
  placeholder = "Depo seçin",
  isInvalid,
  error,
  includeInactive = false,
}) => {
  const { data, isLoading } = useWarehouseLookups(includeInactive);

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

export default WarehouseSelect;
