import React from "react";
import { useAttributeDefinitions } from "@/modules/attributes/hooks/useAttributes";
import LookupSelect from "./LookupSelect";

interface AttributeDefinitionSelectProps {
  value: string | null;
  onChange: (value: string | null) => void;
  placeholder?: string;
  isInvalid?: boolean;
  error?: string;
}

const AttributeDefinitionSelect: React.FC<AttributeDefinitionSelectProps> = ({
  value,
  onChange,
  placeholder = "Özellik tanımı seçin",
  isInvalid,
  error,
}) => {
  const { data, isLoading } = useAttributeDefinitions();

  const items = (data ?? []).map((d) => ({ id: d.id, name: d.name }));

  return (
    <LookupSelect
      items={items}
      isLoading={isLoading}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      isInvalid={isInvalid}
      error={error}
    />
  );
};

export default AttributeDefinitionSelect;
