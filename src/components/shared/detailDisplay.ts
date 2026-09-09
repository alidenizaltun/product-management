export const EMPTY_DETAIL_VALUE = "—";

export function formatDetailDate(iso?: string | null): string {
  if (!iso) return EMPTY_DETAIL_VALUE;
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? EMPTY_DETAIL_VALUE : date.toLocaleString("tr-TR");
}

export function formatDetailYesNo(value?: boolean | null): string {
  if (value == null) return EMPTY_DETAIL_VALUE;
  return value ? "Evet" : "Hayır";
}
