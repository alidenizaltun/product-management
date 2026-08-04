import React from "react";

interface FormFieldProps {
  label?: React.ReactNode;
  htmlFor?: string;
  required?: boolean;
  error?: string;
  hint?: string;
  className?: string;
  children: React.ReactNode;
}

/**
 * Label + kontrol + yardım/hata metni için ortak sarmalayıcı. Kendi
 * kontrolünü getiren alanlarda (react-select, tarih seçici vb.) doğrudan
 * kullanılabilir; TextInput/Textarea/NumberInput bunu içeride kullanır.
 */
const FormField: React.FC<FormFieldProps> = ({
  label,
  htmlFor,
  required = false,
  error,
  hint,
  className = "",
  children,
}) => (
  <div className={className}>
    {label ? (
      <label className="form-label" htmlFor={htmlFor}>
        {label}
        {required ? (
          <>
            <span className="text-danger ms-1" aria-hidden="true">
              *
            </span>
            <span className="visually-hidden"> (zorunlu)</span>
          </>
        ) : null}
      </label>
    ) : null}
    {children}
    {error ? (
      <div className="invalid-feedback d-block" role="alert">
        <em className="icon ni ni-alert-circle me-1" aria-hidden="true" />
        {error}
      </div>
    ) : hint ? (
      <div className="form-note">{hint}</div>
    ) : null}
  </div>
);

export default FormField;
export type { FormFieldProps };
