import React from "react";
import { Modal, ModalHeader, ModalBody, ModalFooter, Button } from "reactstrap";
import Icon from "@/components/icon/Icon";

// ─── FormModal ────────────────────────────────────────────────────────────────

interface FormModalProps {
  open: boolean;
  toggle: () => void;
  title: string;
  size?: "sm" | "md" | "lg" | "xl";
  children: React.ReactNode;
  onSubmit?: () => void | Promise<void>;
  submitLabel?: string;
  cancelLabel?: string;
  loading?: boolean;
  disabled?: boolean;
  hideFooter?: boolean;
  centered?: boolean;
  className?: string;
  footerContent?: React.ReactNode;
}

export const FormModal: React.FC<FormModalProps> = ({
  open,
  toggle,
  title,
  size,
  children,
  onSubmit,
  submitLabel = "Kaydet",
  cancelLabel = "İptal",
  loading,
  disabled,
  hideFooter,
  centered,
  className,
  footerContent,
}) => {
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (onSubmit) await onSubmit();
  };

  return (
    <Modal isOpen={open} toggle={toggle} size={size} centered={centered} className={className}>
      <ModalHeader
        toggle={toggle}
        close={
          <button className="close" onClick={toggle}>
            <Icon name="cross" />
          </button>
        }
      >
        {title}
      </ModalHeader>
      <form onSubmit={handleSubmit}>
        <ModalBody>{children}</ModalBody>
        {!hideFooter && (
          <ModalFooter className="bg-light">
            {footerContent ?? (
              <>
                <Button
                  color="light"
                  type="button"
                  onClick={toggle}
                  disabled={loading}
                >
                  {cancelLabel}
                </Button>
                <Button
                  color="primary"
                  type="submit"
                  disabled={loading || disabled}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" />
                      İşleniyor...
                    </>
                  ) : (
                    submitLabel
                  )}
                </Button>
              </>
            )}
          </ModalFooter>
        )}
      </form>
    </Modal>
  );
};

// ─── DetailModal ──────────────────────────────────────────────────────────────

interface DetailModalProps {
  open: boolean;
  toggle: () => void;
  title: string;
  size?: "sm" | "md" | "lg" | "xl";
  children: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}

export const DetailModal: React.FC<DetailModalProps> = ({
  open,
  toggle,
  title,
  size,
  children,
  actions,
  className,
}) => (
  <Modal isOpen={open} toggle={toggle} size={size} className={className}>
    <ModalHeader
      toggle={toggle}
      close={
        <button className="close" onClick={toggle}>
          <Icon name="cross" />
        </button>
      }
    >
      {title}
    </ModalHeader>
    <ModalBody>{children}</ModalBody>
    {actions && (
      <ModalFooter className="bg-light">{actions}</ModalFooter>
    )}
  </Modal>
);

// ─── ConfirmationModal ────────────────────────────────────────────────────────

type ConfirmVariant = "success" | "danger" | "warning" | "info";

interface ConfirmationModalProps {
  open: boolean;
  toggle: () => void;
  title: string;
  message: string | React.ReactNode;
  variant?: ConfirmVariant;
  icon?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  loading?: boolean;
  onConfirm: () => void | Promise<void>;
}

const VARIANT_ICONS: Record<ConfirmVariant, string> = {
  success: "check",
  danger: "alert-circle",
  warning: "alert",
  info: "info",
};

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  open,
  toggle,
  title,
  message,
  variant = "danger",
  icon,
  confirmLabel = "Onayla",
  cancelLabel = "İptal",
  loading,
  onConfirm,
}) => {
  const iconName = icon ?? VARIANT_ICONS[variant];
  const btnColor = variant === "danger" ? "danger" : variant === "warning" ? "warning" : "primary";

  return (
    <Modal isOpen={open} toggle={toggle} centered>
      <ModalBody className="modal-body-lg text-center">
        <div className="nk-modal">
          <Icon
            className={`nk-modal-icon icon-circle icon-circle-xxl ni ni-${iconName} bg-${variant} text-white`}
            name=""
          />
          <h4 className="nk-modal-title mt-3">{title}</h4>
          <div className="nk-modal-text">
            {typeof message === "string" ? (
              <p className="lead">{message}</p>
            ) : (
              message
            )}
          </div>
          <div className="nk-modal-action mt-4">
            <Button color="light" className="btn-mw me-2" onClick={toggle} disabled={loading}>
              {cancelLabel}
            </Button>
            <Button
              color={btnColor}
              className="btn-mw"
              onClick={onConfirm}
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" />
                  İşleniyor...
                </>
              ) : (
                confirmLabel
              )}
            </Button>
          </div>
        </div>
      </ModalBody>
    </Modal>
  );
};

// ─── ImagePreviewModal ────────────────────────────────────────────────────────

interface ImagePreviewModalProps {
  open: boolean;
  toggle: () => void;
  imageUrl: string;
  alt?: string;
  title?: string;
}

export const ImagePreviewModal: React.FC<ImagePreviewModalProps> = ({
  open,
  toggle,
  imageUrl,
  alt,
  title,
}) => (
  <Modal isOpen={open} toggle={toggle} size="lg" centered>
    {title && (
      <ModalHeader
        toggle={toggle}
        close={
          <button className="close" onClick={toggle}>
            <Icon name="cross" />
          </button>
        }
      >
        {title}
      </ModalHeader>
    )}
    <ModalBody className="text-center p-0">
      <img
        src={imageUrl}
        alt={alt ?? "Önizleme"}
        className="img-fluid"
        style={{ maxHeight: "80vh", objectFit: "contain" }}
      />
    </ModalBody>
  </Modal>
);

export default FormModal;
