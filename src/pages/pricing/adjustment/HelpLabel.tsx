import React, { useEffect, useId, useRef, useState } from "react";

interface HelpLabelProps {
  children: React.ReactNode;
  help: React.ReactNode;
}

const fieldLabelText = (children: React.ReactNode) =>
  typeof children === "string" || typeof children === "number" ? String(children).replace(/\s+/g, " ").trim() : "Alan";

const HELP_OPEN_EVENT = "pricing-help-open";

const HelpLabel: React.FC<HelpLabelProps> = ({ children, help }) => {
  const wrapRef = useRef<HTMLSpanElement>(null);
  const instanceId = useId();
  const [open, setOpen] = useState(false);
  const label = fieldLabelText(children);

  useEffect(() => {
    const closeOthers = (event: Event) => {
      if ((event as CustomEvent<string>).detail === instanceId) return;
      setOpen(false);
    };
    window.addEventListener(HELP_OPEN_EVENT, closeOthers);
    return () => window.removeEventListener(HELP_OPEN_EVENT, closeOthers);
  }, [instanceId]);

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: PointerEvent) => {
      if (wrapRef.current?.contains(event.target as Node)) return;
      setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const toggle = () => {
    if (open) {
      setOpen(false);
      return;
    }
    window.dispatchEvent(new CustomEvent(HELP_OPEN_EVENT, { detail: instanceId }));
    setOpen(true);
  };

  return (
    <span className="pricing-help-label" ref={wrapRef}>
      <span>{children}</span>
      <button
        type="button"
        className="btn btn-xs btn-trigger btn-icon text-soft p-0"
        aria-expanded={open}
        aria-label={`${label} hakkında bilgi`}
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          toggle();
        }}
      >
        <em className="icon ni ni-info" />
      </button>
      {open && (
        <span className="pricing-help-bubble" role="tooltip">
          {help}
        </span>
      )}
    </span>
  );
};

export default HelpLabel;
export type { HelpLabelProps };
