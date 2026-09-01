import type { ProductAttributeValueDto } from "@/domain/types/productOperations.types";

export const fmt = (n?: number | null, currency?: string) =>
  n != null
    ? n.toLocaleString("tr-TR", currency ? { minimumFractionDigits: 2, maximumFractionDigits: 2 } : undefined) +
      (currency ? ` ${currency}` : "")
    : "—";

export const fmtDate = (d?: string | null) => (d ? new Date(d).toLocaleDateString("tr-TR") : "—");

export const fmtDateTime = (d?: string | null) => (d ? new Date(d).toLocaleString("tr-TR") : "—");

export const parseJsonArray = (json?: string | null): string[] => {
  if (!json?.trim()) return [];
  try {
    const parsed = JSON.parse(json);
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return [];
  }
};

export const getAttributeDisplayValue = (attr: ProductAttributeValueDto): string => {
  if (attr.valueText != null && attr.valueText !== "") return attr.valueText;
  if (attr.valueNumber != null) return String(attr.valueNumber);
  if (attr.valueBool != null) return attr.valueBool ? "Evet" : "Hayır";
  if (attr.valueDate) return fmtDate(attr.valueDate);
  if (attr.valueJson) return attr.valueJson;
  return "—";
};
