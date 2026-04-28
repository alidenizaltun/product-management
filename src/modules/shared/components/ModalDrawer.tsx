import React from "react";
import { Modal, ModalBody, ModalHeader, Offcanvas, OffcanvasBody, OffcanvasHeader } from "reactstrap";

interface ModalDrawerProps {
  open: boolean;
  onClose: () => void;
  title: string;
  mode?: "modal" | "drawer";
  children: React.ReactNode;
}

const ModalDrawer: React.FC<ModalDrawerProps> = ({ open, onClose, title, mode = "modal", children }) => {
  if (mode === "drawer") {
    return (
      <Offcanvas isOpen={open} toggle={onClose} direction="end">
        <OffcanvasHeader toggle={onClose}>{title}</OffcanvasHeader>
        <OffcanvasBody>{children}</OffcanvasBody>
      </Offcanvas>
    );
  }

  return (
    <Modal isOpen={open} toggle={onClose}>
      <ModalHeader toggle={onClose}>{title}</ModalHeader>
      <ModalBody>{children}</ModalBody>
    </Modal>
  );
};

export default ModalDrawer;
