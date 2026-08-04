import React from "react";
import type { NavigationBlocker } from "@/modules/shared/hooks/useUnsavedChangesGuard";
import ConfirmDialog from "./ConfirmDialog";

interface UnsavedChangesDialogProps {
  blocker: NavigationBlocker;
}

/**
 * useUnsavedChangesGuard ile birlikte kullanılır. Router bir geçişi
 * bloklandığında (blocker.state === "blocked") onay modalı gösterir.
 */
const UnsavedChangesDialog: React.FC<UnsavedChangesDialogProps> = ({ blocker }) => (
  <ConfirmDialog
    open={blocker.state === "blocked"}
    title="Kaydedilmemiş değişiklikler var"
    message="Bu sayfadan ayrılırsanız yaptığınız değişiklikler kaybolur. Yine de ayrılmak istiyor musunuz?"
    confirmLabel="Sayfadan Ayrıl"
    cancelLabel="Kalmaya Devam Et"
    variant="warning"
    onConfirm={() => blocker.state === "blocked" && blocker.proceed()}
    onCancel={() => blocker.state === "blocked" && blocker.reset()}
  />
);

export default UnsavedChangesDialog;
