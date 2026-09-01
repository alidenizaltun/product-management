import React from "react";

interface StatusBadgeProps {
  active?: boolean;
  activeLabel?: string;
  inactiveLabel?: string;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({
  active,
  activeLabel = "Aktif",
  inactiveLabel = "Pasif",
}) => (
  <span className={`badge badge-dim bg-${active ? "success" : "secondary"}`}>
    <span className={`dot dot-${active ? "success" : "secondary"} me-1`} />
    {active ? activeLabel : inactiveLabel}
  </span>
);

export default StatusBadge;
