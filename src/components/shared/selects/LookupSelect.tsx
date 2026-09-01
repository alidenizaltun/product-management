import React from "react";
import Select, { type StylesConfig } from "react-select";
import type { LookupItem } from "@/domain/types/lookup.types";

export interface LookupSelectProps {
  items: LookupItem[] | undefined;
  isLoading?: boolean;
  value: string | null;
  onChange: (value: string | null) => void;
  placeholder?: string;
  isMulti?: false;
  isInvalid?: boolean;
  error?: string;
  isClearable?: boolean;
  isDisabled?: boolean;
}

const errorStyles: StylesConfig<{ value: string; label: string }> = {
  control: (base, state) => ({
    ...base,
    borderColor: state.isFocused ? "#e85347" : "#e85347",
    boxShadow: state.isFocused ? "0 0 0 0.2rem rgba(232,83,71,.25)" : "none",
    "&:hover": { borderColor: "#e85347" },
  }),
};

const LookupSelect: React.FC<LookupSelectProps> = ({
  items,
  isLoading,
  value,
  onChange,
  placeholder = "Seçin...",
  isInvalid = false,
  error,
  isClearable = true,
  isDisabled = false,
}) => {
  const options = (items ?? []).map((item) => ({
    value: item.id,
    label: item.name,
  }));

  const selected = options.find((o) => o.value === value) ?? null;

  return (
    <div>
      <Select
        options={options}
        value={selected}
        onChange={(opt) => onChange(opt?.value ?? null)}
        placeholder={isLoading ? "Yükleniyor..." : placeholder}
        isLoading={isLoading}
        isDisabled={isDisabled || isLoading}
        isClearable={isClearable}
        styles={isInvalid ? errorStyles : undefined}
        noOptionsMessage={() => "Sonuç bulunamadı"}
        loadingMessage={() => "Yükleniyor..."}
      />
      {isInvalid && error && (
        <div className="invalid-feedback d-block">{error}</div>
      )}
    </div>
  );
};

export default LookupSelect;
