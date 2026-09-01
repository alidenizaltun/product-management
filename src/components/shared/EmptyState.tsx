import React from "react";
import Icon from "@/components/icon/Icon";

interface EmptyStateProps {
  icon?: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  icon = "inbox",
  title,
  description,
  action,
  className = "",
}) => (
  <div className={`text-center py-5 ${className}`}>
    <div className="mb-3">
      <span className="d-inline-flex align-items-center justify-content-center rounded-circle bg-light text-soft" style={{ width: 72, height: 72 }}>
        <Icon name={icon} className="fs-2" />
      </span>
    </div>
    <h6 className="title mb-1">{title}</h6>
    {description ? <p className="text-soft mb-3">{description}</p> : null}
    {action}
  </div>
);

export default EmptyState;
