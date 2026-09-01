import React, { useCallback, useState } from "react";
import { Collapse } from "reactstrap";
import Icon from "@/components/icon/Icon";
import classnames from "classnames";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export interface AccordionItem {
  id: string;
  title: string;
  content: React.ReactNode;
  icon?: string;
  badge?: string | number;
  disabled?: boolean;
}

interface AppAccordionProps {
  items: AccordionItem[];
  allowMultiple?: boolean;
  defaultOpen?: string[];
  className?: string;
}

/* ------------------------------------------------------------------ */
/*  AppAccordion                                                       */
/* ------------------------------------------------------------------ */

const AppAccordion: React.FC<AppAccordionProps> = ({
  items,
  allowMultiple = false,
  defaultOpen = [],
  className,
}) => {
  const [openIds, setOpenIds] = useState<string[]>(defaultOpen);

  const toggle = useCallback(
    (id: string) => {
      setOpenIds((prev) => {
        if (prev.includes(id)) return prev.filter((i) => i !== id);
        return allowMultiple ? [...prev, id] : [id];
      });
    },
    [allowMultiple]
  );

  return (
    <div className={classnames("accordion", className)}>
      {items.map((item) => {
        const isOpen = openIds.includes(item.id);

        return (
          <div key={item.id} className="accordion-item">
            <div
              className={classnames("accordion-head", {
                collapsed: !isOpen,
                disabled: item.disabled,
              })}
              role="button"
              tabIndex={item.disabled ? -1 : 0}
              onClick={() => !item.disabled && toggle(item.id)}
              onKeyDown={(e) => {
                if (!item.disabled && (e.key === "Enter" || e.key === " ")) {
                  e.preventDefault();
                  toggle(item.id);
                }
              }}
            >
              <div className="d-flex align-items-center gap-2 flex-grow-1">
                {item.icon && (
                  <Icon name={item.icon} className="text-primary" />
                )}
                <h6 className="title mb-0">{item.title}</h6>
                {item.badge != null && (
                  <span className="badge bg-primary-dim text-primary rounded-pill ms-auto">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className="accordion-icon">
                <Icon name={isOpen ? "minus" : "plus"} />
              </span>
            </div>
            <Collapse isOpen={isOpen}>
              <div className="accordion-body">
                <div className="accordion-inner">{item.content}</div>
              </div>
            </Collapse>
          </div>
        );
      })}
    </div>
  );
};

export default AppAccordion;
