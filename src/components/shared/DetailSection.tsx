import React from "react";
import { Row, Col } from "reactstrap";
import Icon from "@/components/icon/Icon";

// ─── Types ───────────────────────────────────────────────────────────────────

interface DetailItem {
  label: string;
  value: React.ReactNode;
  fullWidth?: boolean;
  hidden?: boolean;
}

// ─── DetailSection ───────────────────────────────────────────────────────────

interface DetailSectionProps {
  title?: string;
  icon?: string;
  items: DetailItem[];
  columns?: 1 | 2 | 3;
  className?: string;
}

const colSizeMap: Record<number, number> = { 1: 12, 2: 6, 3: 4 };

const DetailSection: React.FC<DetailSectionProps> = ({
  title,
  icon,
  items,
  columns = 1,
  className = "",
}) => {
  const visibleItems = items.filter((item) => !item.hidden);

  return (
    <div className={className}>
      {title ? (
        <div className="d-flex align-items-center mb-3">
          {icon ? (
            <span className="me-2 text-primary">
              <Icon name={icon} />
            </span>
          ) : null}
          <h6 className="overline-title">{title}</h6>
        </div>
      ) : null}

      <Row className="g-0">
        {visibleItems.map((item, idx) => (
          <Col
            md={item.fullWidth ? 12 : colSizeMap[columns]}
            key={idx}
            className="border-bottom py-2"
          >
            <Row className="g-2 align-items-center">
              <Col xs={5}>
                <span className="text-soft">{item.label}</span>
              </Col>
              <Col xs={7}>
                <span className="fw-medium">{item.value ?? "—"}</span>
              </Col>
            </Row>
          </Col>
        ))}
      </Row>
    </div>
  );
};

// ─── DetailCard ──────────────────────────────────────────────────────────────

interface DetailCardProps {
  title: string;
  subtitle?: string;
  icon?: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
  fullHeight?: boolean;
  className?: string;
}

const DetailCard: React.FC<DetailCardProps> = ({
  title,
  subtitle,
  icon,
  children,
  actions,
  fullHeight = true,
  className = "",
}) => (
  <div className={`card card-bordered${fullHeight ? " h-100" : ""} ${className}`}>
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
      {actions ? <div>{actions}</div> : null}
    </div>
    <div className="card-inner">{children}</div>
  </div>
);

// ─── DetailRow ───────────────────────────────────────────────────────────────

interface DetailRowProps {
  label: string;
  value: React.ReactNode;
  className?: string;
}

const DetailRow: React.FC<DetailRowProps> = ({ label, value, className = "" }) => (
  <div className={`border-bottom py-2 ${className}`}>
    <Row className="g-2 align-items-center">
      <Col xs={5}>
        <span className="text-soft">{label}</span>
      </Col>
      <Col xs={7}>
        <span className="fw-medium">{value ?? "—"}</span>
      </Col>
    </Row>
  </div>
);

// ─── DetailBadge ─────────────────────────────────────────────────────────────

interface DetailBadgeProps {
  label: string;
  color: "primary" | "success" | "warning" | "danger" | "info" | "secondary";
}

const DetailBadge: React.FC<DetailBadgeProps> = ({ label, color }) => (
  <span className={`badge badge-dim bg-${color}`}>
    <span className={`dot dot-${color} me-1`} />
    {label}
  </span>
);

export { DetailSection, DetailCard, DetailRow, DetailBadge };
export type {
  DetailItem,
  DetailSectionProps,
  DetailCardProps,
  DetailRowProps,
  DetailBadgeProps,
};
