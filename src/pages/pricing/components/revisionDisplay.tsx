import React from "react";
import {
  PRICE_ADJUSTMENT_TYPE,
  PRICE_REVISION_SCOPE_TYPE,
  PRICE_REVISION_STATUS,
  PRICE_REVISION_TARGET_TYPE,
} from "@/domain/types/productOperations.types";
import type { PriceRevisionDto } from "@/domain/types/productOperations.types";

/** Zam revizyonu ekranlarında paylaşılan etiket ve rozet yardımcıları. */

const STATUS_LABELS: Record<number, { label: string; className: string }> = {
  [PRICE_REVISION_STATUS.Draft]: { label: "Taslak", className: "bg-light text-dark" },
  [PRICE_REVISION_STATUS.Previewed]: { label: "Önizlendi", className: "bg-info-dim text-info" },
  [PRICE_REVISION_STATUS.PendingApproval]: { label: "Onay bekliyor", className: "bg-warning-dim text-warning" },
  [PRICE_REVISION_STATUS.Approved]: { label: "Onaylandı", className: "bg-primary-dim text-primary" },
  [PRICE_REVISION_STATUS.Applied]: { label: "Uygulandı", className: "bg-success-dim text-success" },
  [PRICE_REVISION_STATUS.RolledBack]: { label: "Geri alındı", className: "bg-secondary-dim text-secondary" },
  [PRICE_REVISION_STATUS.Rejected]: { label: "Reddedildi", className: "bg-danger-dim text-danger" },
  [PRICE_REVISION_STATUS.Cancelled]: { label: "İptal", className: "bg-light text-soft" },
};

export const RevisionStatusBadge: React.FC<{ status: number }> = ({ status }) => {
  const entry = STATUS_LABELS[status] ?? { label: "Bilinmiyor", className: "bg-light text-dark" };
  return <span className={`badge ${entry.className}`}>{entry.label}</span>;
};

export const describeStatus = (status: number) => STATUS_LABELS[status]?.label ?? "Bilinmiyor";

export const describeAdjustment = (revision: {
  adjustmentType: number;
  value: number;
  currencyCode?: string | null;
}) => {
  const currency = revision.currencyCode ?? "";
  switch (revision.adjustmentType) {
    case PRICE_ADJUSTMENT_TYPE.Percent:
      return `%${revision.value}`;
    case PRICE_ADJUSTMENT_TYPE.Amount:
      return `${revision.value >= 0 ? "+" : ""}${revision.value} ${currency}`.trim();
    case PRICE_ADJUSTMENT_TYPE.SetValue:
      return `= ${revision.value} ${currency}`.trim();
    case PRICE_ADJUSTMENT_TYPE.Multiplier:
      return `×${revision.value}`;
    default:
      return String(revision.value);
  }
};

export const ADJUSTMENT_TYPE_OPTIONS = [
  { value: PRICE_ADJUSTMENT_TYPE.Percent, label: "Yüzde zam (%)" },
  { value: PRICE_ADJUSTMENT_TYPE.Amount, label: "Sabit tutar ekle" },
  { value: PRICE_ADJUSTMENT_TYPE.SetValue, label: "Sabit değere çek" },
  { value: PRICE_ADJUSTMENT_TYPE.Multiplier, label: "Çarpan uygula" },
];

export const ROUNDING_MODE_OPTIONS = [
  { value: 1, label: "Yuvarlama yok" },
  { value: 2, label: "En yakına yuvarla" },
  { value: 3, label: "Yukarı yuvarla" },
  { value: 4, label: "Aşağı yuvarla" },
];

export const ROUNDING_STEP_OPTIONS = ["0.01", "0.1", "0.5", "1", "5", "10"];

/**
 * Kapsam türleri iki role ayrılır: ürün filtresi hangi ürünlerin, hedef filtresi
 * hangi fiyat alanlarının ele alınacağını belirler. Ayrım kullanıcıya da gösterilir,
 * çünkü "SMS şablonuna zam" ile "X ürününe zam" farklı şeylere dokunur.
 */
export const SCOPE_TYPE_OPTIONS = [
  { value: PRICE_REVISION_SCOPE_TYPE.Product, label: "Ürün", role: "product" as const },
  { value: PRICE_REVISION_SCOPE_TYPE.Category, label: "Kategori", role: "product" as const },
  { value: PRICE_REVISION_SCOPE_TYPE.ProductKind, label: "Ürün tipi", role: "product" as const },
  { value: PRICE_REVISION_SCOPE_TYPE.Region, label: "Bölge", role: "product" as const },
  { value: PRICE_REVISION_SCOPE_TYPE.PricingTemplate, label: "Fiyat şablonu", role: "target" as const },
  { value: PRICE_REVISION_SCOPE_TYPE.UnitDefinition, label: "Birim", role: "target" as const },
  { value: PRICE_REVISION_SCOPE_TYPE.PriceList, label: "Fiyat listesi", role: "target" as const },
];

export const describeScopeType = (scopeType: number) =>
  SCOPE_TYPE_OPTIONS.find((option) => option.value === scopeType)?.label ?? "Bilinmiyor";

export const PRODUCT_KIND_OPTIONS = [
  { value: "1", label: "Fiziksel" },
  { value: "2", label: "Yazılım" },
  { value: "3", label: "Hizmet" },
  { value: "4", label: "Abonelik" },
  { value: "5", label: "Paket" },
  { value: "6", label: "Dijital Varlık" },
];

const TARGET_TYPE_LABELS: Record<number, string> = {
  [PRICE_REVISION_TARGET_TYPE.LicenseOfferingBasePrice]: "Paket taban fiyatı",
  [PRICE_REVISION_TARGET_TYPE.ModuleOfferingPrice]: "Modül fiyatı",
  [PRICE_REVISION_TARGET_TYPE.PricingRuleValue]: "Kural değeri",
  [PRICE_REVISION_TARGET_TYPE.PricingRuleTier]: "Kural kademesi",
  [PRICE_REVISION_TARGET_TYPE.ProductPrice]: "Ürün fiyatı",
  [PRICE_REVISION_TARGET_TYPE.PriceListItem]: "Fiyat listesi satırı",
};

export const describeTargetType = (targetType: number) =>
  TARGET_TYPE_LABELS[targetType] ?? "Diğer";

export const TARGET_TYPE_OPTIONS = Object.entries(TARGET_TYPE_LABELS).map(([value, label]) => ({
  value: Number(value),
  label,
}));

export const formatMoney = (value: number, currencyCode?: string) =>
  `${new Intl.NumberFormat("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 4 }).format(
    value
  )}${currencyCode ? ` ${currencyCode}` : ""}`;

/** Revizyonun hangi durumda hangi aksiyonu kabul ettiği tek yerde tanımlı. */
export const revisionCan = (revision: PriceRevisionDto | undefined) => {
  const status = revision?.status;
  return {
    edit: status === PRICE_REVISION_STATUS.Draft
      || status === PRICE_REVISION_STATUS.Previewed
      || status === PRICE_REVISION_STATUS.Rejected,
    preview: status === PRICE_REVISION_STATUS.Draft
      || status === PRICE_REVISION_STATUS.Previewed
      || status === PRICE_REVISION_STATUS.Rejected,
    editLines: status === PRICE_REVISION_STATUS.Previewed
      || status === PRICE_REVISION_STATUS.PendingApproval
      || status === PRICE_REVISION_STATUS.Rejected,
    submit: status === PRICE_REVISION_STATUS.Previewed || status === PRICE_REVISION_STATUS.Rejected,
    decide: status === PRICE_REVISION_STATUS.PendingApproval,
    apply: status === PRICE_REVISION_STATUS.Approved,
    rollback: status === PRICE_REVISION_STATUS.Applied,
    cancel: status === PRICE_REVISION_STATUS.Draft
      || status === PRICE_REVISION_STATUS.Previewed
      || status === PRICE_REVISION_STATUS.PendingApproval
      || status === PRICE_REVISION_STATUS.Rejected,
  };
};
