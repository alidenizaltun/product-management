import React, { forwardRef, useId } from "react";
import FormField from "./FormField";

type ControlSize = "sm" | "md" | "lg";

const sizeClassMap: Record<ControlSize, string> = {
  sm: "form-control-sm",
  md: "",
  lg: "form-control-lg",
};

interface BaseFieldProps {
  label?: React.ReactNode;
  required?: boolean;
  error?: string;
  hint?: string;
  size?: ControlSize;
  containerClassName?: string;
}

// ─── TextInput ────────────────────────────────────────────────────────────────

interface TextInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size">,
    BaseFieldProps {}

const TextInput = forwardRef<HTMLInputElement, TextInputProps>(
  ({ label, required, error, hint, size = "md", containerClassName = "", className = "", id, ...rest }, ref) => {
    const autoId = useId();
    const inputId = id ?? autoId;

    return (
      <FormField label={label} htmlFor={inputId} required={required} error={error} hint={hint} className={containerClassName}>
        <input
          ref={ref}
          id={inputId}
          className={`form-control ${sizeClassMap[size]} ${error ? "is-invalid" : ""} ${className}`.trim()}
          aria-invalid={error ? true : undefined}
          aria-required={required || undefined}
          {...rest}
        />
      </FormField>
    );
  }
);
TextInput.displayName = "TextInput";

// ─── NumberInput ──────────────────────────────────────────────────────────────

interface NumberInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size" | "type">,
    BaseFieldProps {}

const NumberInput = forwardRef<HTMLInputElement, NumberInputProps>(
  ({ label, required, error, hint, size = "md", containerClassName = "", className = "", id, ...rest }, ref) => {
    const autoId = useId();
    const inputId = id ?? autoId;

    return (
      <FormField label={label} htmlFor={inputId} required={required} error={error} hint={hint} className={containerClassName}>
        <input
          ref={ref}
          id={inputId}
          type="number"
          inputMode="decimal"
          className={`form-control ${sizeClassMap[size]} ${error ? "is-invalid" : ""} ${className}`.trim()}
          aria-invalid={error ? true : undefined}
          aria-required={required || undefined}
          {...rest}
        />
      </FormField>
    );
  }
);
NumberInput.displayName = "NumberInput";

// ─── Textarea ─────────────────────────────────────────────────────────────────

interface TextareaProps
  extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, "size">,
    Omit<BaseFieldProps, "size"> {}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, required, error, hint, containerClassName = "", className = "", id, rows = 3, ...rest }, ref) => {
    const autoId = useId();
    const inputId = id ?? autoId;

    return (
      <FormField label={label} htmlFor={inputId} required={required} error={error} hint={hint} className={containerClassName}>
        <textarea
          ref={ref}
          id={inputId}
          rows={rows}
          className={`form-control ${error ? "is-invalid" : ""} ${className}`.trim()}
          aria-invalid={error ? true : undefined}
          aria-required={required || undefined}
          {...rest}
        />
      </FormField>
    );
  }
);
Textarea.displayName = "Textarea";

// ─── Checkbox ─────────────────────────────────────────────────────────────────

interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type" | "size"> {
  label: React.ReactNode;
  switchStyle?: boolean;
  error?: string;
  containerClassName?: string;
}

const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, switchStyle = false, error, containerClassName = "", className = "", id, ...rest }, ref) => {
    const autoId = useId();
    const inputId = id ?? autoId;

    return (
      <div className={`form-check ${switchStyle ? "form-switch" : ""} ${containerClassName}`.trim()}>
        <input
          ref={ref}
          type="checkbox"
          id={inputId}
          className={`form-check-input ${error ? "is-invalid" : ""} ${className}`.trim()}
          aria-invalid={error ? true : undefined}
          {...rest}
        />
        <label className="form-check-label" htmlFor={inputId}>
          {label}
        </label>
        {error ? (
          <div className="invalid-feedback d-block" role="alert">
            <em className="icon ni ni-alert-circle me-1" aria-hidden="true" />
            {error}
          </div>
        ) : null}
      </div>
    );
  }
);
Checkbox.displayName = "Checkbox";

export { TextInput, NumberInput, Textarea, Checkbox };
export type { TextInputProps, NumberInputProps, TextareaProps, CheckboxProps };
