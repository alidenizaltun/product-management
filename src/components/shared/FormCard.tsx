import React, { useState } from "react";
import { Row, Col, Button, Spinner } from "reactstrap";
import Icon from "@/components/icon/Icon";

// ─── FormCard ────────────────────────────────────────────────────────────────

interface FormCardProps {
  title: string;
  subtitle?: string;
  icon?: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
  collapsible?: boolean;
  defaultOpen?: boolean;
  className?: string;
  noPadding?: boolean;
}

const FormCard: React.FC<FormCardProps> = ({
  title,
  subtitle,
  icon,
  children,
  actions,
  collapsible = false,
  defaultOpen = true,
  className = "",
  noPadding = false,
}) => {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className={`card card-bordered ${className}`}>
      <div className="card-header border-bottom d-flex align-items-center justify-content-between">
        <div className="d-flex align-items-center">
          {icon ? (
            <span className="me-2 text-primary">
              <Icon name={icon} />
            </span>
          ) : null}
          <div>
            <h6 className="title mb-0">{title}</h6>
            {subtitle ? <span className="sub-text">{subtitle}</span> : null}
          </div>
        </div>
        <div className="d-flex align-items-center gap-2">
          {actions}
          {collapsible ? (
            <button
              type="button"
              className="btn btn-icon btn-sm btn-trigger"
              onClick={() => setOpen((prev) => !prev)}
            >
              <Icon name={open ? "chevron-up" : "chevron-down"} />
            </button>
          ) : null}
        </div>
      </div>
      {open ? (
        <div className={noPadding ? "" : "card-inner"}>{children}</div>
      ) : null}
    </div>
  );
};

// ─── FormRow ─────────────────────────────────────────────────────────────────

interface FormRowProps {
  label: string;
  hint?: string;
  required?: boolean;
  children: React.ReactNode;
  labelWidth?: number;
  error?: string;
}

const FormRow: React.FC<FormRowProps> = ({
  label,
  hint,
  required = false,
  children,
  labelWidth = 4,
  error,
}) => {
  const controlWidth = 12 - labelWidth;

  return (
    <Row className="g-3 align-items-center mb-3">
      <Col md={labelWidth}>
        <label className="form-label mb-0">
          {label}
          {required ? <span className="text-danger ms-1">*</span> : null}
        </label>
        {hint ? <span className="sub-text d-block">{hint}</span> : null}
      </Col>
      <Col md={controlWidth}>
        {children}
        {error ? <span className="invalid d-block mt-1">{error}</span> : null}
      </Col>
    </Row>
  );
};

// ─── FormSection ─────────────────────────────────────────────────────────────

interface FormSectionProps {
  title: string;
  description?: string;
}

const FormSection: React.FC<FormSectionProps> = ({ title, description }) => (
  <div className="my-4">
    <h6 className="overline-title text-primary-alt">{title}</h6>
    {description ? <p className="text-soft">{description}</p> : null}
    <hr className="mt-2 mb-0" />
  </div>
);

// ─── FormActions ─────────────────────────────────────────────────────────────

interface FormActionsProps {
  onCancel?: () => void;
  onSubmit?: () => void;
  submitLabel?: string;
  cancelLabel?: string;
  loading?: boolean;
  disabled?: boolean;
  children?: React.ReactNode;
}

const FormActions: React.FC<FormActionsProps> = ({
  onCancel,
  onSubmit,
  submitLabel = "Kaydet",
  cancelLabel = "İptal",
  loading = false,
  disabled = false,
  children,
}) => (
  <div className="mt-4 pt-3 border-top d-flex align-items-center justify-content-end gap-2">
    {children}
    {onCancel ? (
      <Button color="light" outline onClick={onCancel} disabled={loading}>
        {cancelLabel}
      </Button>
    ) : null}
    {onSubmit ? (
      <Button color="primary" onClick={onSubmit} disabled={disabled || loading}>
        {loading ? <Spinner size="sm" className="me-1" /> : null}
        {submitLabel}
      </Button>
    ) : null}
  </div>
);

export { FormCard, FormRow, FormSection, FormActions };
export type { FormCardProps, FormRowProps, FormSectionProps, FormActionsProps };
