import React from "react";
import { useRegionLookups } from "@/services/lookup/useLookups";
import LookupSelect from "./LookupSelect";

interface RegionSelectProps {
  value: string | null;
  onChange: (value: string | null) => void;
  placeholder?: string;
  isInvalid?: boolean;
  error?: string;
  includeInactive?: boolean;
}

const RegionSelect: React.FC<RegionSelectProps> = ({
  value,
  onChange,
  placeholder = "Bölge seçin",
  isInvalid,
  error,
  includeInactive = false,
}) => {
  const { data, isLoading } = useRegionLookups(includeInactive);

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

export default RegionSelect;
