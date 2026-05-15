import React from "react";
import { Badge } from "reactstrap";
import Icon from "@/components/icon/Icon";

type BadgeColor = "primary" | "success" | "warning" | "danger" | "info" | "secondary" | "light" | "dark";

// ─── StatusDot ────────────────────────────────────────────────────────────────

interface StatusDotProps {
  color?: BadgeColor;
  label?: string;
  size?: "sm" | "md" | "lg";
  pulse?: boolean;
  className?: string;
}

export const StatusDot: React.FC<StatusDotProps> = ({
  color = "success",
  label,
  size = "md",
  pulse,
  className = "",
}) => {
  const dotSize = size === "sm" ? 8 : size === "lg" ? 14 : 10;
  return (
    <span className={`d-inline-flex align-items-center gap-1 ${className}`}>
      <span
        className={`d-inline-block rounded-circle bg-${color} ${pulse ? "animate-pulse" : ""}`}
        style={{
          width: dotSize,
          height: dotSize,
          ...(pulse
            ? {
                animation: "pulse 2s infinite",
                boxShadow: `0 0 0 0 var(--bs-${color})`,
              }
            : {}),
        }}
      />
      {label && <span className="fs-12">{label}</span>}
    </span>
  );
};

// ─── ColorBadge ───────────────────────────────────────────────────────────────

interface ColorBadgeProps {
  label: string;
  color?: BadgeColor;
  variant?: "solid" | "dim" | "outline";
  icon?: string;
  size?: "sm" | "md";
  pill?: boolean;
  className?: string;
}

export const ColorBadge: React.FC<ColorBadgeProps> = ({
  label,
  color = "primary",
  variant = "dim",
  icon,
  size,
  pill,
  className = "",
}) => {
  const badgeCls =
    variant === "solid"
      ? `bg-${color}`
      : variant === "outline"
        ? `bg-outline-${color}`
        : `badge-dim bg-${color}`;

  return (
    <span
      className={`badge ${badgeCls} ${pill ? "rounded-pill" : ""} ${
        size === "sm" ? "fs-10" : ""
      } ${className}`}
    >
      {icon && <Icon name={icon} className="me-1" />}
      {label}
    </span>
  );
};

// ─── BadgeGroup ───────────────────────────────────────────────────────────────

interface BadgeGroupProps {
  items: { label: string; color?: BadgeColor; icon?: string }[];
  variant?: "solid" | "dim" | "outline";
  max?: number;
  className?: string;
}

export const BadgeGroup: React.FC<BadgeGroupProps> = ({
  items,
  variant = "dim",
  max,
  className = "",
}) => {
  const visible = max ? items.slice(0, max) : items;
  const remaining = max ? items.length - max : 0;

  return (
    <div className={`d-flex flex-wrap gap-1 ${className}`}>
      {visible.map((item) => (
        <ColorBadge
          key={item.label}
          label={item.label}
          color={item.color}
          icon={item.icon}
          variant={variant}
        />
      ))}
      {remaining > 0 && (
        <span className="badge badge-dim bg-light text-soft">+{remaining}</span>
      )}
    </div>
  );
};

// ─── TagList ──────────────────────────────────────────────────────────────────

interface TagListProps {
  tags: string[];
  color?: BadgeColor;
  onRemove?: (tag: string) => void;
  className?: string;
}

export const TagList: React.FC<TagListProps> = ({
  tags,
  color = "primary",
  onRemove,
  className = "",
}) => (
  <div className={`d-flex flex-wrap gap-1 ${className}`}>
    {tags.map((tag) => (
      <span
        key={tag}
        className={`badge bg-outline-${color} d-flex align-items-center gap-1`}
      >
        {tag}
        {onRemove && (
          <button
            type="button"
            className="btn btn-icon p-0 lh-1 border-0 bg-transparent"
            style={{ fontSize: 14, lineHeight: 1 }}
            onClick={() => onRemove(tag)}
            aria-label={`${tag} kaldır`}
          >
            <Icon name="cross-sm" />
          </button>
        )}
      </span>
    ))}
    {tags.length === 0 && (
      <span className="text-soft fs-12">Etiket yok</span>
    )}
  </div>
);

// ─── PriorityBadge ────────────────────────────────────────────────────────────

type Priority = "low" | "medium" | "high" | "critical";

interface PriorityBadgeProps {
  priority: Priority;
  className?: string;
}

const PRIORITY_CONFIG: Record<Priority, { label: string; color: BadgeColor; icon: string }> = {
  low: { label: "Düşük", color: "success", icon: "arrow-down" },
  medium: { label: "Orta", color: "warning", icon: "minus" },
  high: { label: "Yüksek", color: "danger", icon: "arrow-up" },
  critical: { label: "Kritik", color: "danger", icon: "alert-circle" },
};

export const PriorityBadge: React.FC<PriorityBadgeProps> = ({
  priority,
  className = "",
}) => {
  const config = PRIORITY_CONFIG[priority];
  return (
    <ColorBadge
      label={config.label}
      color={config.color}
      icon={config.icon}
      variant="dim"
      className={className}
    />
  );
};

// ─── TruncatedText ────────────────────────────────────────────────────────────

interface TruncatedTextProps {
  text: string;
  maxLength?: number;
  className?: string;
}

export const TruncatedText: React.FC<TruncatedTextProps> = ({
  text,
  maxLength = 60,
  className = "",
}) => {
  if (text.length <= maxLength) return <span className={className}>{text}</span>;
  return (
    <span className={className} title={text}>
      {text.slice(0, maxLength)}...
    </span>
  );
};

// ─── Currency ─────────────────────────────────────────────────────────────────

interface CurrencyProps {
  amount: number;
  currency?: string;
  locale?: string;
  className?: string;
  colored?: boolean;
}

export const Currency: React.FC<CurrencyProps> = ({
  amount,
  currency = "TRY",
  locale = "tr-TR",
  className = "",
  colored,
}) => {
  const formatted = amount.toLocaleString(locale, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  const colorCls = colored
    ? amount > 0
      ? "text-success"
      : amount < 0
        ? "text-danger"
        : ""
    : "";

  return (
    <span className={`${colorCls} ${className}`}>
      {formatted} {currency}
    </span>
  );
};

// ─── DateDisplay ──────────────────────────────────────────────────────────────

interface DateDisplayProps {
  date: string | Date | null | undefined;
  format?: "date" | "datetime" | "time" | "relative";
  className?: string;
  fallback?: string;
}

export const DateDisplay: React.FC<DateDisplayProps> = ({
  date,
  format = "date",
  className = "",
  fallback = "—",
}) => {
  if (!date) return <span className={`text-muted ${className}`}>{fallback}</span>;

  const d = typeof date === "string" ? new Date(date) : date;

  let formatted: string;
  switch (format) {
    case "datetime":
      formatted = d.toLocaleString("tr-TR");
      break;
    case "time":
      formatted = d.toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" });
      break;
    case "relative": {
      const diff = Date.now() - d.getTime();
      const mins = Math.floor(diff / 60000);
      if (mins < 1) formatted = "Az önce";
      else if (mins < 60) formatted = `${mins} dk önce`;
      else if (mins < 1440) formatted = `${Math.floor(mins / 60)} sa önce`;
      else formatted = `${Math.floor(mins / 1440)} gün önce`;
      break;
    }
    default:
      formatted = d.toLocaleDateString("tr-TR");
  }

  return <span className={className}>{formatted}</span>;
};
