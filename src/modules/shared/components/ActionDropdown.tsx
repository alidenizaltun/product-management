import React from "react";
import {
  UncontrolledDropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
} from "reactstrap";
import Icon from "@/components/icon/Icon";
import classnames from "classnames";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export interface ActionItem {
  label: string;
  icon?: string;
  onClick?: () => void;
  href?: string;
  color?: string;
  divider?: boolean;
  disabled?: boolean;
  hidden?: boolean;
}

/* ------------------------------------------------------------------ */
/*  ActionDropdown                                                     */
/* ------------------------------------------------------------------ */

interface ActionDropdownProps {
  items: ActionItem[];
  direction?: "start" | "end";
  size?: "sm" | "md";
  className?: string;
}

export const ActionDropdown: React.FC<ActionDropdownProps> = ({
  items,
  direction = "end",
  size,
  className,
}) => {
  const visibleItems = items.filter((item) => !item.hidden);

  return (
    <UncontrolledDropdown className={className}>
      <DropdownToggle
        tag="a"
        href="#toggle"
        onClick={(e) => e.preventDefault()}
        className={classnames("dropdown-toggle btn btn-icon btn-trigger", {
          "btn-sm": size === "sm",
        })}
      >
        <Icon name="more-v" />
      </DropdownToggle>
      <DropdownMenu end={direction === "end"}>
        <ul className="link-list-opt no-bdr">
          {visibleItems.map((item, idx) =>
            item.divider ? (
              <li key={idx} className="divider" />
            ) : (
              <li key={idx}>
                {item.href ? (
                  <a
                    href={item.href}
                    className={classnames("dropdown-item", {
                      [`text-${item.color}`]: item.color,
                      disabled: item.disabled,
                    })}
                  >
                    {item.icon && <Icon name={item.icon} />}
                    <span>{item.label}</span>
                  </a>
                ) : (
                  <DropdownItem
                    disabled={item.disabled}
                    className={item.color ? `text-${item.color}` : undefined}
                    onClick={item.onClick}
                  >
                    {item.icon && <Icon name={item.icon} />}
                    <span>{item.label}</span>
                  </DropdownItem>
                )}
              </li>
            )
          )}
        </ul>
      </DropdownMenu>
    </UncontrolledDropdown>
  );
};

/* ------------------------------------------------------------------ */
/*  ActionButtonGroup                                                  */
/* ------------------------------------------------------------------ */

interface ActionButtonGroupProps {
  items: ActionItem[];
  className?: string;
}

export const ActionButtonGroup: React.FC<ActionButtonGroupProps> = ({
  items,
  className,
}) => {
  const visibleItems = items.filter((item) => !item.hidden && !item.divider);

  return (
    <div className={classnames("nk-tb-actions gx-1", className)}>
      {visibleItems.map((item, idx) => (
        <div key={idx} className="nk-tb-action-hidden">
          <a
            href={item.href ?? "#action"}
            onClick={(e) => {
              e.preventDefault();
              if (!item.disabled) item.onClick?.();
            }}
            className={classnames("btn btn-trigger btn-icon", {
              [`text-${item.color}`]: item.color,
              disabled: item.disabled,
            })}
            title={item.label}
          >
            {item.icon && <Icon name={item.icon} />}
          </a>
        </div>
      ))}
    </div>
  );
};
