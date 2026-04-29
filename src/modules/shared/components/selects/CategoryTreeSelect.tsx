import React from "react";
import { useCategoryLookups } from "@/services/lookup/useLookups";
import LookupSelect from "./LookupSelect";

interface CategoryTreeSelectProps {
  value: string | null;
  onChange: (value: string | null) => void;
  placeholder?: string;
  isInvalid?: boolean;
  error?: string;
}

const CategoryTreeSelect: React.FC<CategoryTreeSelectProps> = ({
  value,
  onChange,
  placeholder = "Kategori seçin",
  isInvalid,
  error,
}) => {
  const { data, isLoading } = useCategoryLookups();

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

export default CategoryTreeSelect;
