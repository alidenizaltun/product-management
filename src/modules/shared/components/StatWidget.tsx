import React from "react";
import { Link } from "react-router-dom";
import Icon from "@/components/icon/Icon";

type ThemeColor = "primary" | "success" | "warning" | "danger" | "info" | "secondary";

/* ------------------------------------------------------------------ */
/*  1. StatWidget – Dashboard statistics card                         */
/* ------------------------------------------------------------------ */

interface StatWidgetProps {
  title: string;
  value: React.ReactNode;
  icon: string;
  color: ThemeColor;
  to?: string;
  hint?: string;
  loading?: boolean;
  trend?: { value: number; direction: "up" | "down" };
  className?: string;
}

export const StatWidget: React.FC<StatWidgetProps> = ({
  title,
  value,
  icon,
  color,
  to,
  hint,
  loading,
  trend,
  className,
}) => {
  const inner = (
    <div className={`card card-bordered h-100${className ? ` ${className}` : ""}`}>
      <div className="card-inner">
        <div className="card-title-group align-start mb-2">
          <div className="card-title">
            <h6 className="title text-soft text-uppercase fs-12px mb-0">{title}</h6>
          </div>
          <div className="card-tools">
            <span
              className={`d-inline-flex align-items-center justify-content-center rounded-circle bg-${color}-soft text-${color}`}
              style={{ width: 36, height: 36 }}
            >
              <Icon name={icon} />
            </span>
          </div>
        </div>

        <div className="d-flex align-items-end justify-content-between">
          <div className="amount fs-2 fw-medium">
            {loading ? (
              <span className="placeholder col-3 placeholder-glow">
                <span className="placeholder col-12" />
              </span>
            ) : (
              value
            )}
          </div>

          <div className="d-flex flex-column align-items-end gap-1">
            {trend && (
              <span
                className={`d-inline-flex align-items-center fs-12px fw-medium text-${
                  trend.direction === "up" ? "success" : "danger"
                }`}
              >
                <Icon name={`arrow-long-${trend.direction}`} className="me-1" />
                {trend.value}%
              </span>
            )}
            {hint && <span className="text-soft fs-12px">{hint}</span>}
          </div>
        </div>
      </div>
    </div>
  );

  return to ? (
    <Link to={to} className="text-decoration-none text-reset">
      {inner}
    </Link>
  ) : (
    inner
  );
};

/* ------------------------------------------------------------------ */
/*  2. MiniStatCard – Compact inline stat                             */
/* ------------------------------------------------------------------ */

interface MiniStatCardProps {
  label: string;
  value: React.ReactNode;
  icon?: string;
  color?: ThemeColor;
}

export const MiniStatCard: React.FC<MiniStatCardProps> = ({
  label,
  value,
  icon,
  color = "primary",
}) => (
  <div className="card card-bordered">
    <div className="card-inner py-2 px-3">
      <div className="d-flex align-items-center gap-2">
        {icon && (
          <span
            className={`d-inline-flex align-items-center justify-content-center rounded-circle bg-${color}-soft text-${color}`}
            style={{ width: 28, height: 28, fontSize: 14 }}
          >
            <Icon name={icon} />
          </span>
        )}
        <div className="flex-grow-1">
          <div className="text-soft fs-12px text-uppercase">{label}</div>
          <div className="fw-medium">{value}</div>
        </div>
      </div>
    </div>
  </div>
);

/* ------------------------------------------------------------------ */
/*  3. ProgressCard – Progress tracking card                          */
/* ------------------------------------------------------------------ */

interface ProgressCardProps {
  title: string;
  value: number;
  label?: string;
  color?: ThemeColor;
  size?: "sm" | "md" | "lg";
  subtitle?: string;
}

const progressHeights: Record<string, number> = { sm: 4, md: 8, lg: 14 };

export const ProgressCard: React.FC<ProgressCardProps> = ({
  title,
  value,
  label,
  color = "primary",
  size = "md",
  subtitle,
}) => {
  const clamped = Math.max(0, Math.min(100, value));

  return (
    <div className="card card-bordered h-100">
      <div className="card-inner">
        <div className="d-flex align-items-center justify-content-between mb-2">
          <h6 className="title fs-14px mb-0">{title}</h6>
          <span className={`fw-medium text-${color}`}>{clamped}%</span>
        </div>

        {subtitle && <p className="text-soft fs-12px mb-2">{subtitle}</p>}

        <div
          className="progress bg-light rounded-pill"
          style={{ height: progressHeights[size] }}
        >
          <div
            className={`progress-bar bg-${color} rounded-pill`}
            role="progressbar"
            style={{ width: `${clamped}%` }}
            aria-valuenow={clamped}
            aria-valuemin={0}
            aria-valuemax={100}
          />
        </div>

        {label && <span className="text-soft fs-12px mt-2 d-inline-block">{label}</span>}
      </div>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/*  4. PercentageCircle – SVG circular progress                       */
/* ------------------------------------------------------------------ */

interface PercentageCircleProps {
  value: number;
  size?: number;
  strokeWidth?: number;
  color?: ThemeColor;
}

export const PercentageCircle: React.FC<PercentageCircleProps> = ({
  value,
  size = 80,
  strokeWidth = 8,
  color = "primary",
}) => {
  const clamped = Math.max(0, Math.min(100, value));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (clamped / 100) * circumference;

  const colorMap: Record<ThemeColor, string> = {
    primary: "var(--bs-primary)",
    success: "var(--bs-success)",
    warning: "var(--bs-warning)",
    danger: "var(--bs-danger)",
    info: "var(--bs-info)",
    secondary: "var(--bs-secondary)",
  };

  return (
    <div className="d-inline-flex align-items-center justify-content-center position-relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-light"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={colorMap[color] ?? colorMap.primary}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={{ transition: "stroke-dashoffset 0.4s ease" }}
        />
      </svg>
      <span className="position-absolute fw-medium fs-12px">{clamped}%</span>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/*  5. QuickActionCard – Quick action link card                       */
/* ------------------------------------------------------------------ */

interface QuickActionCardProps {
  to: string;
  icon: string;
  label: string;
  description?: string;
  color: ThemeColor;
}

export const QuickActionCard: React.FC<QuickActionCardProps> = ({
  to,
  icon,
  label,
  description,
  color,
}) => (
  <Link to={to} className="card card-bordered text-decoration-none text-reset h-100 quick-action-card">
    <div className="card-inner d-flex align-items-center gap-3">
      <span
        className={`d-inline-flex align-items-center justify-content-center rounded-circle bg-${color}-soft text-${color}`}
        style={{ width: 44, height: 44 }}
      >
        <Icon name={icon} />
      </span>
      <div>
        <div className="fw-medium">{label}</div>
        {description && <div className="text-soft fs-12px">{description}</div>}
      </div>
    </div>
  </Link>
);

/* ------------------------------------------------------------------ */
/*  6. ComparisonCard – Comparing two values side-by-side             */
/* ------------------------------------------------------------------ */

interface ComparisonCardProps {
  title: string;
  leftLabel: string;
  leftValue: React.ReactNode;
  rightLabel: string;
  rightValue: React.ReactNode;
  icon?: string;
}

export const ComparisonCard: React.FC<ComparisonCardProps> = ({
  title,
  leftLabel,
  leftValue,
  rightLabel,
  rightValue,
  icon,
}) => (
  <div className="card card-bordered h-100">
    <div className="card-inner">
      <div className="d-flex align-items-center gap-2 mb-3">
        {icon && (
          <span className="d-inline-flex align-items-center justify-content-center text-primary" style={{ fontSize: 20 }}>
            <Icon name={icon} />
          </span>
        )}
        <h6 className="title fs-14px mb-0">{title}</h6>
      </div>

      <div className="row g-3 text-center">
        <div className="col-6">
          <div className="text-soft fs-12px text-uppercase mb-1">{leftLabel}</div>
          <div className="fs-3 fw-medium">{leftValue}</div>
        </div>
        <div className="col-6 border-start">
          <div className="text-soft fs-12px text-uppercase mb-1">{rightLabel}</div>
          <div className="fs-3 fw-medium">{rightValue}</div>
        </div>
      </div>
    </div>
  </div>
);

/* ------------------------------------------------------------------ */
/*  7. InfoCard – Simple informational card                           */
/* ------------------------------------------------------------------ */

interface InfoCardProps {
  title: string;
  children: React.ReactNode;
  icon?: string;
  color?: ThemeColor;
  variant?: "default" | "filled" | "outline";
}

const infoCardVariantClasses = (color: ThemeColor, variant: InfoCardProps["variant"]): string => {
  switch (variant) {
    case "filled":
      return `bg-${color}-soft border-${color}`;
    case "outline":
      return `border-${color}`;
    default:
      return "";
  }
};

export const InfoCard: React.FC<InfoCardProps> = ({
  title,
  children,
  icon,
  color = "primary",
  variant = "default",
}) => (
  <div className={`card card-bordered h-100 ${infoCardVariantClasses(color, variant)}`}>
    <div className="card-inner">
      <div className="d-flex align-items-center gap-2 mb-2">
        {icon && (
          <span
            className={`d-inline-flex align-items-center justify-content-center rounded-circle bg-${color}-soft text-${color}`}
            style={{ width: 32, height: 32 }}
          >
            <Icon name={icon} />
          </span>
        )}
        <h6 className="title fs-14px mb-0">{title}</h6>
      </div>
      <div className="text-soft fs-13px">{children}</div>
    </div>
  </div>
);
