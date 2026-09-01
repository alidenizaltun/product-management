import React from "react";
import { useProductLookups } from "@/application/hooks/useLookups";
import LookupSelect from "./LookupSelect";

interface ProductSelectProps {
  value: string | null;
  onChange: (value: string | null) => void;
  placeholder?: string;
  isInvalid?: boolean;
  error?: string;
  includeInactive?: boolean;
}

const ProductSelect: React.FC<ProductSelectProps> = ({
  value,
  onChange,
  placeholder = "Ürün seçin",
  isInvalid,
  error,
  includeInactive = false,
}) => {
  const { data, isLoading } = useProductLookups(includeInactive);

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

export default ProductSelect;
