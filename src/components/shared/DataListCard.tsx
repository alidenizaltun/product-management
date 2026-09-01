import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Button, Badge } from "reactstrap";
import Icon from "@/components/icon/Icon";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ListColumnDef<T> {
  key: string;
  label: string;
  render: (item: T) => React.ReactNode;
  width?: string;
  align?: "start" | "center" | "end";
  hideOnMobile?: boolean;
}

// ─── DataListCard ─────────────────────────────────────────────────────────────

interface DataListCardProps<T> {
  title?: string;
  items: T[];
  columns: ListColumnDef<T>[];
  rowKey: (item: T) => React.Key;
  onRowClick?: (item: T) => void;
  actions?: (item: T) => React.ReactNode;
  emptyIcon?: string;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyAction?: React.ReactNode;
  loading?: boolean;
  toolbar?: React.ReactNode;
  headerActions?: React.ReactNode;
  striped?: boolean;
  hoverable?: boolean;
  compact?: boolean;
  className?: string;
}

function DataListCard<T>({
  title,
  items,
  columns,
  rowKey,
  onRowClick,
  actions,
  emptyIcon = "inbox",
  emptyTitle = "Kayıt bulunamadı",
  emptyDescription,
  emptyAction,
  loading,
  toolbar,
  headerActions,
  striped,
  hoverable = true,
  compact,
  className = "",
}: DataListCardProps<T>) {
  return (
    <div className={`card card-bordered ${className}`}>
      {(title || toolbar || headerActions) && (
        <div className="card-inner position-relative card-tools-toggle">
          <div className="card-title-group">
            <div className="card-title">
              {title && <h6 className="title mb-0">{title}</h6>}
            </div>
            <div className="card-tools d-flex gap-2 align-items-center">
              {toolbar}
              {headerActions}
            </div>
          </div>
        </div>
      )}

      <div className="card-inner p-0">
        <div
          className={`nk-tb-list nk-tb-ulist ${compact ? "is-compact" : ""}`}
        >
          <div className="nk-tb-item nk-tb-head">
            {columns.map((col) => (
              <div
                key={col.key}
                className={`nk-tb-col ${col.hideOnMobile ? "tb-col-md" : ""}`}
                style={col.width ? { width: col.width } : undefined}
              >
                <span className="sub-text">{col.label}</span>
              </div>
            ))}
            {actions && <div className="nk-tb-col nk-tb-col-tools" />}
          </div>

          {loading ? (
            <div className="nk-tb-item">
              <div className="d-flex align-items-center gap-2 py-3 px-3">
                <span className="spinner-border spinner-border-sm text-primary" />
                <span className="text-soft">Yükleniyor...</span>
              </div>
            </div>
          ) : (
            items.map((item) => (
              <div
                key={rowKey(item)}
                className={`nk-tb-item ${hoverable ? "nk-tb-item-hover" : ""} ${striped ? "nk-tb-item-striped" : ""}`}
                onClick={onRowClick ? () => onRowClick(item) : undefined}
                style={onRowClick ? { cursor: "pointer" } : undefined}
              >
                {columns.map((col) => (
                  <div
                    key={col.key}
                    className={`nk-tb-col ${col.hideOnMobile ? "tb-col-md" : ""} ${
                      col.align ? `text-${col.align}` : ""
                    }`}
                  >
                    {col.render(item)}
                  </div>
                ))}
                {actions && (
                  <div className="nk-tb-col nk-tb-col-tools">
                    {actions(item)}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {!loading && items.length === 0 && (
        <div className="card-inner text-center py-5">
          <div className="mb-3">
            <span
              className="d-inline-flex align-items-center justify-content-center rounded-circle bg-light text-soft"
              style={{ width: 72, height: 72 }}
            >
              <Icon name={emptyIcon} className="fs-2" />
            </span>
          </div>
          <h6 className="title mb-1">{emptyTitle}</h6>
          {emptyDescription && (
            <p className="text-soft mb-3">{emptyDescription}</p>
          )}
          {emptyAction}
        </div>
      )}
    </div>
  );
}

export default DataListCard;

// ─── CardGrid ─────────────────────────────────────────────────────────────────

interface CardGridItem {
  id: string | number;
  title: string;
  subtitle?: string;
  description?: string;
  image?: string;
  icon?: string;
  color?: string;
  badges?: { label: string; color: string }[];
  stats?: { label: string; value: React.ReactNode }[];
  actions?: React.ReactNode;
  to?: string;
}

interface CardGridProps {
  items: CardGridItem[];
  columns?: 2 | 3 | 4;
  emptyIcon?: string;
  emptyTitle?: string;
  emptyAction?: React.ReactNode;
  loading?: boolean;
  className?: string;
}

export const CardGrid: React.FC<CardGridProps> = ({
  items,
  columns = 3,
  emptyIcon = "grid-sq",
  emptyTitle = "Kayıt bulunamadı",
  emptyAction,
  loading,
  className = "",
}) => {
  const colClass =
    columns === 2
      ? "col-md-6"
      : columns === 4
        ? "col-sm-6 col-xl-3"
        : "col-md-6 col-lg-4";

  if (loading) {
    return (
      <div className={`row g-3 ${className}`}>
        {Array.from({ length: columns * 2 }).map((_, i) => (
          <div key={i} className={colClass}>
            <div className="card card-bordered">
              <div className="card-inner placeholder-glow">
                <span className="placeholder col-7 mb-2" />
                <span className="placeholder col-4 mb-3" />
                <span className="placeholder col-12" />
                <span className="placeholder col-10" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-5">
        <span
          className="d-inline-flex align-items-center justify-content-center rounded-circle bg-light text-soft mb-3"
          style={{ width: 72, height: 72 }}
        >
          <Icon name={emptyIcon} className="fs-2" />
        </span>
        <h6 className="title mb-1">{emptyTitle}</h6>
        {emptyAction}
      </div>
    );
  }

  return (
    <div className={`row g-3 ${className}`}>
      {items.map((item) => {
        const card = (
          <div className="card card-bordered h-100">
            {item.image && (
              <div className="card-img-top bg-light d-flex align-items-center justify-content-center" style={{ height: 160 }}>
                <img
                  src={item.image}
                  alt={item.title}
                  className="img-fluid"
                  style={{ maxHeight: 160, objectFit: "contain" }}
                />
              </div>
            )}
            <div className="card-inner">
              <div className="d-flex align-items-start justify-content-between mb-2">
                <div className="d-flex align-items-center gap-2">
                  {!item.image && item.icon && (
                    <span
                      className={`d-inline-flex align-items-center justify-content-center rounded-circle bg-${item.color ?? "primary"}-soft text-${item.color ?? "primary"}`}
                      style={{ width: 36, height: 36 }}
                    >
                      <Icon name={item.icon} />
                    </span>
                  )}
                  <div>
                    <h6 className="title mb-0 fs-14px">{item.title}</h6>
                    {item.subtitle && (
                      <span className="text-soft fs-12">{item.subtitle}</span>
                    )}
                  </div>
                </div>
                {item.actions}
              </div>

              {item.badges && item.badges.length > 0 && (
                <div className="d-flex gap-1 flex-wrap mb-2">
                  {item.badges.map((b) => (
                    <Badge key={b.label} color={b.color} className="badge-dim">
                      {b.label}
                    </Badge>
                  ))}
                </div>
              )}

              {item.description && (
                <p className="text-soft fs-13px mb-2">{item.description}</p>
              )}

              {item.stats && item.stats.length > 0 && (
                <div className="d-flex flex-column gap-1 border-top pt-2 mt-2">
                  {item.stats.map((s) => (
                    <div
                      key={s.label}
                      className="d-flex justify-content-between align-items-center fs-12"
                    >
                      <span className="text-soft">{s.label}</span>
                      <span className="fw-medium">{s.value}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        );

        return (
          <div key={item.id} className={colClass}>
            {item.to ? (
              <Link to={item.to} className="text-decoration-none text-reset h-100 d-block">
                {card}
              </Link>
            ) : (
              card
            )}
          </div>
        );
      })}
    </div>
  );
};

// ─── KanbanColumn ─────────────────────────────────────────────────────────────

interface KanbanCardItem {
  id: string;
  title: string;
  description?: string;
  badge?: { label: string; color: string };
  assignee?: { name: string; avatar?: string };
  priority?: "low" | "medium" | "high";
}

interface KanbanColumnProps {
  title: string;
  color?: string;
  count?: number;
  items: KanbanCardItem[];
  className?: string;
}

export const KanbanColumn: React.FC<KanbanColumnProps> = ({
  title,
  color = "primary",
  count,
  items,
  className = "",
}) => (
  <div className={`card card-bordered h-100 ${className}`}>
    <div className={`card-inner py-2 border-bottom border-${color} border-3`}>
      <div className="d-flex justify-content-between align-items-center">
        <h6 className="title mb-0 fs-13px">{title}</h6>
        {count != null && (
          <Badge color={color} className="badge-dim">
            {count}
          </Badge>
        )}
      </div>
    </div>
    <div className="card-inner d-flex flex-column gap-2" style={{ minHeight: 200 }}>
      {items.length === 0 ? (
        <div className="text-center py-4 text-soft fs-12">
          Bu sütunda kayıt yok.
        </div>
      ) : (
        items.map((item) => {
          const priorityColors = {
            low: "success",
            medium: "warning",
            high: "danger",
          };
          return (
            <div
              key={item.id}
              className="card card-bordered bg-light border-light"
            >
              <div className="card-inner p-2">
                <div className="d-flex justify-content-between align-items-start mb-1">
                  <span className="fw-medium fs-13px">{item.title}</span>
                  {item.priority && (
                    <span
                      className={`badge bg-${priorityColors[item.priority]}-soft text-${priorityColors[item.priority]}`}
                      style={{ fontSize: 10 }}
                    >
                      {item.priority === "high"
                        ? "Yüksek"
                        : item.priority === "medium"
                          ? "Orta"
                          : "Düşük"}
                    </span>
                  )}
                </div>
                {item.description && (
                  <p className="text-soft fs-11 mb-1">{item.description}</p>
                )}
                <div className="d-flex justify-content-between align-items-center">
                  {item.badge && (
                    <Badge color={item.badge.color} className="badge-dim fs-10">
                      {item.badge.label}
                    </Badge>
                  )}
                  {item.assignee && (
                    <span
                      className="d-inline-flex align-items-center justify-content-center rounded-circle bg-primary text-white fw-bold"
                      style={{ width: 24, height: 24, fontSize: 10 }}
                      title={item.assignee.name}
                    >
                      {item.assignee.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .slice(0, 2)
                        .toUpperCase()}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })
      )}
    </div>
  </div>
);
