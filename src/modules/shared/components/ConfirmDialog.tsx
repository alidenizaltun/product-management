import React from "react";
import { Modal, ModalBody, ModalFooter, Button } from "reactstrap";
import Icon from "@/components/icon/Icon";

interface ConfirmDialogProps {
  open: boolean;
  title?: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "primary" | "danger" | "warning";
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

const variantIconMap: Record<NonNullable<ConfirmDialogProps["variant"]>, string> = {
  primary: "info",
  danger: "alert-circle",
  warning: "alert",
};

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  open,
  title = "Onayla",
  message,
  confirmLabel = "Onayla",
  cancelLabel = "İptal",
  variant = "primary",
  loading,
  onConfirm,
  onCancel,
}) => (
  <Modal isOpen={open} toggle={onCancel} centered>
    <div className="modal-body modal-body-md text-center">
      <div className="nk-modal text-center">
        <Icon
          name={variantIconMap[variant]}
          className={`nk-modal-icon icon-circle icon-circle-xxl ni-${
            variantIconMap[variant]
          } bg-${variant === "primary" ? "info" : variant} text-white`}
        />
        <h4 className="nk-modal-title mt-3">{title}</h4>
        <div className="nk-modal-text">
          <p className="lead">{message}</p>
        </div>
      </div>
    </div>
    <ModalFooter className="bg-light justify-content-center">
      <Button color="light" onClick={onCancel} disabled={loading}>
        {cancelLabel}
      </Button>
      <Button color={variant === "danger" ? "danger" : "primary"} onClick={onConfirm} disabled={loading}>
        {loading ? (
          <>
            <span className="spinner-border spinner-border-sm me-2" />
            İşleniyor...
          </>
        ) : (
          confirmLabel
        )}
      </Button>
    </ModalFooter>
    <ModalBody className="d-none" />
  </Modal>
);

export default ConfirmDialog;
