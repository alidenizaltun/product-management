import React from "react";
import { Link } from "react-router-dom";
import Icon from "@/components/icon/Icon";

type CardColor = "primary" | "success" | "warning" | "danger" | "info" | "secondary";

// ─── InfoCard ─────────────────────────────────────────────────────────────────

interface InfoCardProps {
  title: string;
  children: React.ReactNode;
  icon?: string;
  color?: CardColor;
  variant?: "default" | "filled" | "outline";
  className?: string;
}

export const InfoCard: React.FC<InfoCardProps> = ({
  title,
  children,
  icon,
  color = "primary",
  variant = "default",
  className = "",
}) => {
  const cardCls =
    variant === "filled"
      ? `card bg-${color} text-white`
      : variant === "outline"
        ? `card card-bordered border-${color}`
        : "card card-bordered";

  return (
    <div className={`${cardCls} ${className}`}>
      <div className="card-inner">
        <div className="d-flex align-items-start gap-3">
          {icon && (
            <span
              className={`d-inline-flex align-items-center justify-content-center rounded-circle flex-shrink-0 ${
                variant === "filled"
                  ? "bg-white bg-opacity-25 text-white"
                  : `bg-${color}-soft text-${color}`
              }`}
              style={{ width: 44, height: 44 }}
            >
              <Icon name={icon} />
            </span>
          )}
          <div className="flex-grow-1">
            <h6
              className={`title mb-2 ${variant === "filled" ? "text-white" : ""}`}
            >
              {title}
            </h6>
            <div className={variant === "filled" ? "text-white" : "text-soft"}>
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── SummaryCard ──────────────────────────────────────────────────────────────

interface SummaryItem {
  label: string;
  value: React.ReactNode;
}

interface SummaryCardProps {
  title: string;
  icon?: string;
  items: SummaryItem[];
  footer?: React.ReactNode;
  className?: string;
}

export const SummaryCard: React.FC<SummaryCardProps> = ({
  title,
  icon,
  items,
  footer,
  className = "",
}) => (
  <div className={`card card-bordered h-100 ${className}`}>
    <div className="card-inner">
      <div className="d-flex align-items-center gap-2 mb-3">
        {icon && <Icon name={icon} className="fs-4 text-primary" />}
        <h6 className="title mb-0">{title}</h6>
      </div>
      <div className="d-flex flex-column gap-2">
        {items.map(({ label, value }) => (
          <div
            key={label}
            className="d-flex justify-content-between align-items-center border-bottom pb-2"
          >
            <span className="text-soft fs-12">{label}</span>
            <span className="fw-medium fs-13px">{value ?? <span className="text-muted">—</span>}</span>
          </div>
        ))}
      </div>
      {footer && <div className="pt-3 mt-1">{footer}</div>}
    </div>
  </div>
);

// ─── CountCard ────────────────────────────────────────────────────────────────

interface CountCardProps {
  label: string;
  count: number;
  icon?: string;
  color?: CardColor;
  to?: string;
  className?: string;
}

export const CountCard: React.FC<CountCardProps> = ({
  label,
  count,
  icon,
  color = "primary",
  to,
  className = "",
}) => {
  const inner = (
    <div className={`card card-bordered text-center h-100 ${className}`}>
      <div className="card-inner py-3">
        {icon && (
          <Icon name={icon} className={`fs-2 text-${color} d-block mb-1`} />
        )}
        <div className={`fs-2 fw-bold text-${color}`}>{count}</div>
        <div className="text-soft fs-12">{label}</div>
      </div>
    </div>
  );

  if (to) {
    return (
      <Link to={to} className="text-decoration-none text-reset">
        {inner}
      </Link>
    );
  }
  return inner;
};

// ─── EmptyCard ────────────────────────────────────────────────────────────────

interface EmptyCardProps {
  icon?: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export const EmptyCard: React.FC<EmptyCardProps> = ({
  icon = "inbox",
  title,
  description,
  action,
  className = "",
}) => (
  <div className={`card card-bordered ${className}`}>
    <div className="card-inner text-center py-5">
      <div className="mb-3">
        <span
          className="d-inline-flex align-items-center justify-content-center rounded-circle bg-light text-soft"
          style={{ width: 72, height: 72 }}
        >
          <Icon name={icon} className="fs-2" />
        </span>
      </div>
      <h6 className="title mb-1">{title}</h6>
      {description && <p className="text-soft mb-3">{description}</p>}
      {action}
    </div>
  </div>
);

// ─── ErrorCard ────────────────────────────────────────────────────────────────

interface ErrorCardProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  retryLabel?: string;
  onBack?: () => void;
  backLabel?: string;
  className?: string;
}

export const ErrorCard: React.FC<ErrorCardProps> = ({
  title = "Bir hata oluştu",
  message = "İşlem sırasında beklenmeyen bir hata meydana geldi. Lütfen tekrar deneyin.",
  onRetry,
  retryLabel = "Tekrar Dene",
  onBack,
  backLabel = "Geri Dön",
  className = "",
}) => (
  <div className={`card card-bordered ${className}`}>
    <div className="card-inner text-center py-5">
      <Icon name="cross-circle" className="fs-1 text-danger d-block mb-3" />
      <h6 className="title mb-1">{title}</h6>
      <p className="text-soft mb-3">{message}</p>
      <div className="d-flex gap-2 justify-content-center">
        {onBack && (
          <button className="btn btn-light btn-sm" onClick={onBack}>
            <Icon name="arrow-left" className="me-1" />
            {backLabel}
          </button>
        )}
        {onRetry && (
          <button className="btn btn-primary btn-sm" onClick={onRetry}>
            <Icon name="reload" className="me-1" />
            {retryLabel}
          </button>
        )}
      </div>
    </div>
  </div>
);

// ─── Divider ──────────────────────────────────────────────────────────────────

interface DividerProps {
  text?: string;
  className?: string;
}

export const Divider: React.FC<DividerProps> = ({ text, className = "" }) =>
  text ? (
    <div className={`d-flex align-items-center gap-3 my-3 ${className}`}>
      <hr className="flex-grow-1 m-0" />
      <span className="text-soft fs-12 text-nowrap">{text}</span>
      <hr className="flex-grow-1 m-0" />
    </div>
  ) : (
    <hr className={`my-3 ${className}`} />
  );

// ─── Section Header ───────────────────────────────────────────────────────────

interface SectionHeaderProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  className?: string;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  description,
  actions,
  className = "",
}) => (
  <div className={`d-flex align-items-start justify-content-between mb-3 ${className}`}>
    <div>
      <h6 className="overline-title text-primary">{title}</h6>
      {description && <p className="text-soft fs-13px mb-0">{description}</p>}
    </div>
    {actions}
  </div>
);

export default InfoCard;
