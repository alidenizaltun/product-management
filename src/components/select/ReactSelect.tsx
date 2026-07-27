import React from "react";
import Select from "react-select";

const RSelect = ({
  className,
  isLoading,
  placeholder,
  loadingMessage,
  noOptionsMessage,
  ...props
}) => {
  return (
    <div className="form-control-select">
      <Select
        className={`react-select-container ${className ? className : ""}`}
        classNamePrefix="react-select"
        isLoading={isLoading}
        placeholder={isLoading ? "Yükleniyor..." : placeholder}
        loadingMessage={loadingMessage ?? (() => "Yükleniyor...")}
        noOptionsMessage={noOptionsMessage ?? (() => "Sonuç bulunamadı")}
        {...props}
      />
    </div>
  );
};

export default RSelect;
