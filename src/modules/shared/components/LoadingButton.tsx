import React, { forwardRef } from "react";
import { Button, type ButtonProps } from "reactstrap";

// ─── LoadingButton ────────────────────────────────────────────────────────────

interface LoadingButtonProps extends ButtonProps {
  loading?: boolean;
  loadingText?: string;
}

/**
 * Kaydet/Onayla gibi işlem butonları için ortak loading davranışı: spinner
 * gösterir, butonu disable eder ve loading sırasında çift tıklamayı engeller.
 */
const LoadingButton = forwardRef<HTMLButtonElement, LoadingButtonProps>(
  ({ loading = false, loadingText = "İşleniyor...", disabled, children, onClick, ...rest }, ref) => {
    const handleClick: React.MouseEventHandler<HTMLButtonElement> = (event) => {
      if (loading) {
        event.preventDefault();
        return;
      }
      onClick?.(event);
    };

    return (
      <Button innerRef={ref} disabled={disabled || loading} aria-busy={loading || undefined} onClick={handleClick} {...rest}>
        {loading ? (
          <>
            <span className="spinner-border spinner-border-sm me-2" aria-hidden="true" />
            {loadingText}
          </>
        ) : (
          children
        )}
      </Button>
    );
  }
);
LoadingButton.displayName = "LoadingButton";

// ─── IconButton ───────────────────────────────────────────────────────────────

interface IconButtonProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "title"> {
  icon: string;
  ariaLabel: string;
  size?: "sm" | "md";
  tooltip?: string;
  variant?: "trigger" | "outline-light" | "outline-danger" | "outline-primary" | "light";
}

/**
 * Yalnızca ikon içeren butonlar için erişilebilirlik zorunluluğu: aria-label
 * (ve varsayılan olarak tooltip metni) her zaman geçilmelidir.
 */
const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ icon, ariaLabel, size = "md", tooltip, variant = "trigger", className = "", type = "button", ...rest }, ref) => (
    <button
      ref={ref}
      type={type}
      className={`btn btn-icon btn-${variant} ${size === "sm" ? "btn-sm" : ""} ${className}`.trim()}
      aria-label={ariaLabel}
      title={tooltip ?? ariaLabel}
      {...rest}
    >
      <em className={`icon ni ni-${icon}`} aria-hidden="true" />
    </button>
  )
);
IconButton.displayName = "IconButton";

export { LoadingButton, IconButton };
export type { LoadingButtonProps, IconButtonProps };
