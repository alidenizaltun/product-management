import React from "react";
import { useSupplierLookups } from "@/services/lookup/useLookups";
import LookupSelect from "./LookupSelect";

interface SupplierSelectProps {
  value: string | null;
  onChange: (value: string | null) => void;
  placeholder?: string;
  isInvalid?: boolean;
  error?: string;
  includeInactive?: boolean;
}

const SupplierSelect: React.FC<SupplierSelectProps> = ({
  value,
  onChange,
  placeholder = "Tedarikçi seçin",
  isInvalid,
  error,
  includeInactive = false,
}) => {
  const { data, isLoading } = useSupplierLookups(includeInactive);

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

export default SupplierSelect;
