import React from "react";
import { LoadingButton } from "./LoadingButton";

interface StickyActionBarProps {
  /** Kaydedilmemiş değişiklik var mı; verilirse sol tarafta durum rozeti gösterilir. */
  dirty?: boolean;
  dirtyText?: string;
  cleanText?: string;
  onCancel?: () => void;
  cancelLabel?: string;
  onDelete?: () => void;
  deleteLabel?: string;
  onSubmit?: () => void;
  submitLabel?: string;
  /** Buton, sayfadaki başka bir <form id="..."> öğesini submit etsin istenirse. */
  formId?: string;
  loading?: boolean;
  disabled?: boolean;
  /** Varsayılan aksiyon düzeni yerine tamamen özel içerik. */
  children?: React.ReactNode;
  className?: string;
}

/**
 * Uzun/dinamik listeli sayfalarda kullanıcının kaydetmek için sayfanın en
 * üstüne dönmesini engellemek amacıyla eklenen, ekranın altında normal akışa
 * dahil (position: sticky) aksiyon çubuğu. Fixed/overlay değil, bu yüzden
 * içeriğin üzerini örtmez — yalnızca viewport'un altına ulaştığında yapışır.
 */
const StickyActionBar: React.FC<StickyActionBarProps> = ({
  dirty,
  dirtyText = "Kaydedilmemiş değişiklik",
  cleanText = "Güncel",
  onCancel,
  cancelLabel = "İptal",
  onDelete,
  deleteLabel = "Sil",
  onSubmit,
  submitLabel = "Kaydet",
  formId,
  loading = false,
  disabled = false,
  children,
  className = "",
}) => (
  <div
    className={`sticky-bottom bg-white border-top shadow-sm mt-4 py-3 px-3 px-md-4 d-flex align-items-center justify-content-between flex-wrap gap-2 ${className}`.trim()}
    style={{ zIndex: 1020 }}
  >
    {children ?? (
      <>
        <div>
          {dirty != null ? (
            <span className={`badge badge-dim bg-${dirty ? "warning" : "success"}`}>
              {dirty ? dirtyText : cleanText}
            </span>
          ) : null}
        </div>
        <div className="d-flex align-items-center gap-2">
          {onDelete ? (
            <button type="button" className="btn btn-outline-danger" onClick={onDelete} disabled={loading}>
              {deleteLabel}
            </button>
          ) : null}
          {onCancel ? (
            <button type="button" className="btn btn-light" onClick={onCancel} disabled={loading}>
              {cancelLabel}
            </button>
          ) : null}
          <LoadingButton
            color="primary"
            type={onSubmit && !formId ? "button" : "submit"}
            form={formId}
            onClick={onSubmit}
            loading={loading}
            disabled={disabled}
          >
            <em className="icon ni ni-save me-1" aria-hidden="true" />
            {submitLabel}
          </LoadingButton>
        </div>
      </>
    )}
  </div>
);

export default StickyActionBar;
export type { StickyActionBarProps };
