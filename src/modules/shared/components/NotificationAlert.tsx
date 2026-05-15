import React, { useState, useCallback, useEffect } from "react";
import { Alert, UncontrolledAlert, Button } from "reactstrap";
import Icon from "@/components/icon/Icon";
import { toast } from "react-toastify";

// ─── InlineAlert ──────────────────────────────────────────────────────────────

type AlertColor = "primary" | "success" | "warning" | "danger" | "info" | "secondary";

interface InlineAlertProps {
  color: AlertColor;
  title?: string;
  message: string | React.ReactNode;
  icon?: string;
  dismissible?: boolean;
  variant?: "default" | "fill" | "pro";
  className?: string;
  onDismiss?: () => void;
}

const DEFAULT_ICONS: Record<AlertColor, string> = {
  primary: "alert-circle",
  success: "check-circle",
  warning: "alert-circle",
  danger: "cross-circle",
  info: "info",
  secondary: "alert-circle",
};

export const InlineAlert: React.FC<InlineAlertProps> = ({
  color,
  title,
  message,
  icon,
  dismissible,
  variant = "default",
  className = "",
  onDismiss,
}) => {
  const [visible, setVisible] = useState(true);
  const iconName = icon ?? DEFAULT_ICONS[color];

  const alertCls =
    variant === "fill"
      ? "alert-fill alert-icon"
      : variant === "pro"
        ? "alert-pro"
        : "alert-icon";

  const handleDismiss = () => {
    setVisible(false);
    onDismiss?.();
  };

  if (!visible) return null;

  if (variant === "pro") {
    return (
      <Alert color={color} className={`alert-pro ${className}`}>
        <div className="alert-text">
          {title && <h6>{title}</h6>}
          {typeof message === "string" ? <p>{message}</p> : message}
        </div>
        {dismissible && (
          <button
            type="button"
            className="btn-close"
            aria-label="Kapat"
            onClick={handleDismiss}
          />
        )}
      </Alert>
    );
  }

  return (
    <Alert
      color={color}
      className={`${alertCls} ${dismissible ? "alert-dismissible" : ""} ${className}`}
    >
      <Icon name={iconName} />
      {title && <strong>{title} </strong>}
      {message}
      {dismissible && (
        <button
          type="button"
          className="btn-close"
          aria-label="Kapat"
          onClick={handleDismiss}
        />
      )}
    </Alert>
  );
};

// ─── NotificationBanner ───────────────────────────────────────────────────────

type BannerType = "info" | "success" | "warning" | "error";

interface NotificationBannerProps {
  visible: boolean;
  type: BannerType;
  message: string;
  action?: { label: string; onClick: () => void };
  onClose?: () => void;
  persistent?: boolean;
  className?: string;
}

const BANNER_CONFIG: Record<BannerType, { color: AlertColor; icon: string }> = {
  info: { color: "info", icon: "info" },
  success: { color: "success", icon: "check-circle" },
  warning: { color: "warning", icon: "alert-circle" },
  error: { color: "danger", icon: "cross-circle" },
};

export const NotificationBanner: React.FC<NotificationBannerProps> = ({
  visible,
  type,
  message,
  action,
  onClose,
  persistent,
  className = "",
}) => {
  const [show, setShow] = useState(visible);
  const config = BANNER_CONFIG[type];

  useEffect(() => {
    setShow(visible);
  }, [visible]);

  useEffect(() => {
    if (!persistent && show) {
      const timer = setTimeout(() => {
        setShow(false);
        onClose?.();
      }, 8000);
      return () => clearTimeout(timer);
    }
  }, [show, persistent, onClose]);

  if (!show) return null;

  return (
    <div
      className={`alert alert-${config.color} alert-icon d-flex align-items-center justify-content-between mb-3 ${className}`}
      role="alert"
    >
      <div className="d-flex align-items-center gap-2">
        <Icon name={config.icon} />
        <span>{message}</span>
      </div>
      <div className="d-flex align-items-center gap-2">
        {action && (
          <Button
            size="sm"
            color={config.color}
            outline
            onClick={action.onClick}
          >
            {action.label}
          </Button>
        )}
        {onClose && (
          <button
            type="button"
            className="btn-close"
            aria-label="Kapat"
            onClick={() => {
              setShow(false);
              onClose();
            }}
          />
        )}
      </div>
    </div>
  );
};

// ─── StatusAlert ──────────────────────────────────────────────────────────────

type StatusType = "empty" | "error" | "success" | "loading";

interface StatusAlertProps {
  status: StatusType;
  messages?: Partial<Record<StatusType, string>>;
  onRetry?: () => void;
  className?: string;
}

const DEFAULT_MESSAGES: Record<StatusType, string> = {
  empty: "Görüntülenecek veri bulunmuyor.",
  error: "Bir hata oluştu. Lütfen tekrar deneyin.",
  success: "İşlem başarıyla tamamlandı.",
  loading: "Yükleniyor, lütfen bekleyin...",
};

const STATUS_CONFIG: Record<StatusType, { color: AlertColor; icon: string }> = {
  empty: { color: "info", icon: "inbox" },
  error: { color: "danger", icon: "cross-circle" },
  success: { color: "success", icon: "check-circle" },
  loading: { color: "info", icon: "loader" },
};

export const StatusAlert: React.FC<StatusAlertProps> = ({
  status,
  messages,
  onRetry,
  className = "",
}) => {
  const config = STATUS_CONFIG[status];
  const msg = messages?.[status] ?? DEFAULT_MESSAGES[status];

  return (
    <div className={`text-center py-4 ${className}`}>
      {status === "loading" ? (
        <span className="spinner-border text-primary d-block mx-auto mb-3" />
      ) : (
        <Icon name={config.icon} className={`fs-1 text-${config.color} d-block mb-3`} />
      )}
      <p className="text-soft mb-2">{msg}</p>
      {status === "error" && onRetry && (
        <Button color="primary" size="sm" onClick={onRetry}>
          <Icon name="reload" className="me-1" />
          Tekrar Dene
        </Button>
      )}
    </div>
  );
};

// ─── Toast Helpers ────────────────────────────────────────────────────────────

export const showSuccess = (message: string) =>
  toast.success(message, {
    position: "top-right",
    autoClose: 3000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
  });

export const showError = (message: string) =>
  toast.error(message, {
    position: "top-right",
    autoClose: 5000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
  });

export const showWarning = (message: string) =>
  toast.warning(message, {
    position: "top-right",
    autoClose: 4000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
  });

export const showInfo = (message: string) =>
  toast.info(message, {
    position: "top-right",
    autoClose: 3000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
  });

export default InlineAlert;
