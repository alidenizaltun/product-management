import React from "react";
import Icon from "@/components/icon/Icon";
import StatusBadge from "@/components/shared/StatusBadge";
import EmptyState from "@/components/shared/EmptyState";
import { DetailCard, DetailRow } from "@/components/shared/DetailSection";

export const InfoRow: React.FC<{ label: string; value?: React.ReactNode }> = ({ label, value }) => (
  <div className="profile-ud-list">
    <div className="profile-ud-item w-100">
      <div className="profile-ud wider">
        <span className="profile-ud-label">{label}</span>
        <span className="profile-ud-value">{value ?? "—"}</span>
      </div>
    </div>
  </div>
);

export const StatTile: React.FC<{
  label: string;
  value: React.ReactNode;
  icon: string;
  color?: string;
}> = ({ label, value, icon, color = "primary" }) => (
  <div className="card card-bordered h-100 mb-0">
    <div className="card-inner py-3">
      <div className="d-flex align-items-center gap-3">
        <div
          className={`icon-circle icon-circle-lg bg-${color}-dim flex-shrink-0`}
          style={{ width: 48, height: 48 }}
        >
          <em className={`icon ni ni-${icon} text-${color}`} style={{ fontSize: "1.25rem" }} />
        </div>
        <div className="min-w-0">
          <div className={`fs-5 fw-bold text-${color} lh-1 mb-1`}>{value}</div>
          <div className="text-soft fs-12">{label}</div>
        </div>
      </div>
    </div>
  </div>
);

export const TabEmpty: React.FC<{ icon?: string; title: string; description?: string }> = ({
  icon = "inbox",
  title,
  description,
}) => <EmptyState icon={icon} title={title} description={description} className="py-4" />;

export const FlagPill: React.FC<{ label: string; active: boolean }> = ({ label, active }) => (
  <span className={`badge badge-dim ${active ? "bg-success" : "bg-light text-soft"}`}>
    <em className={`icon ni ni-${active ? "check" : "minus"} me-1`} />
    {label}
  </span>
);

export { DetailCard, DetailRow, StatusBadge };
