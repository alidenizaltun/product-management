import React from "react";
import { Spinner } from "reactstrap";
import { Link } from "react-router-dom";
import Icon from "@/components/icon/Icon";

// ─── Types ───────────────────────────────────────────────────────────────────

interface TimelineItem {
  id: string;
  title: string;
  description?: string;
  timestamp: string;
  icon?: string;
  color?: string;
  user?: { name: string; avatar?: string };
  type?: "create" | "update" | "delete" | "info" | "warning";
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const typeDefaults: Record<string, { icon: string; color: string }> = {
  create: { icon: "plus-circle", color: "success" },
  update: { icon: "edit", color: "primary" },
  delete: { icon: "trash", color: "danger" },
  info: { icon: "info", color: "info" },
  warning: { icon: "alert-circle", color: "warning" },
};

// ─── ActivityTimeline ────────────────────────────────────────────────────────

interface ActivityTimelineProps {
  items: TimelineItem[];
  maxItems?: number;
  className?: string;
}

const ActivityTimeline: React.FC<ActivityTimelineProps> = ({
  items,
  maxItems,
  className = "",
}) => {
  const visibleItems = maxItems ? items.slice(0, maxItems) : items;
  const hasMore = maxItems ? items.length > maxItems : false;

  return (
    <div className={`nk-timeline ${className}`}>
      {visibleItems.map((item) => {
        const defaults = item.type ? typeDefaults[item.type] : undefined;
        const icon = item.icon || defaults?.icon || "circle";
        const color = item.color || defaults?.color || "primary";

        return (
          <div className="nk-timeline-item" key={item.id}>
            <div className="nk-timeline-symbol">
              <div
                className={`rounded-circle d-flex align-items-center justify-content-center bg-${color}-soft text-${color}`}
                style={{ width: 32, height: 32 }}
              >
                <Icon name={icon} />
              </div>
            </div>
            <div className="nk-timeline-content ms-3 pb-4">
              <div className="d-flex align-items-center gap-2">
                <span className="fw-medium">{item.title}</span>
                <span className="sub-text ms-auto text-nowrap">{item.timestamp}</span>
              </div>
              {item.description && <p className="sub-text mt-1 mb-0">{item.description}</p>}
              {item.user && (
                <div className="d-flex align-items-center mt-1 gap-1">
                  {item.user.avatar ? (
                    <img
                      src={item.user.avatar}
                      alt={item.user.name}
                      className="rounded-circle"
                      style={{ width: 20, height: 20 }}
                    />
                  ) : (
                    <div
                      className="rounded-circle bg-light d-flex align-items-center justify-content-center"
                      style={{ width: 20, height: 20, fontSize: 10 }}
                    >
                      {item.user.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <small className="text-soft">{item.user.name}</small>
                </div>
              )}
            </div>
          </div>
        );
      })}
      {hasMore && (
        <div className="text-center pt-2">
          <a href="#more" className="link link-primary small" onClick={(e) => e.preventDefault()}>
            +{items.length - (maxItems || 0)} daha fazla
          </a>
        </div>
      )}
    </div>
  );
};

// ─── TimelineCard ────────────────────────────────────────────────────────────

interface TimelineCardProps {
  title: string;
  items: TimelineItem[];
  maxItems?: number;
  to?: string;
  loading?: boolean;
}

const TimelineCard: React.FC<TimelineCardProps> = ({
  title,
  items,
  maxItems,
  to,
  loading = false,
}) => (
  <div className="card card-bordered h-100">
    <div className="card-header border-bottom d-flex align-items-center justify-content-between">
      <h6 className="title mb-0">{title}</h6>
      {to && (
        <Link to={to} className="link link-primary small">
          Tümünü Gör
        </Link>
      )}
    </div>
    <div className="card-inner">
      {loading ? (
        <div className="text-center py-4">
          <Spinner size="sm" color="primary" />
        </div>
      ) : items.length === 0 ? (
        <p className="text-soft text-center py-3 mb-0">Henüz aktivite yok</p>
      ) : (
        <ActivityTimeline items={items} maxItems={maxItems} />
      )}
    </div>
  </div>
);

export { ActivityTimeline, TimelineCard };
export type { TimelineItem, ActivityTimelineProps, TimelineCardProps };
