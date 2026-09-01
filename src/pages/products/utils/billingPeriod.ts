export const BILLING_UNITS = [
  { value: 1, label: "Gün" },
  { value: 2, label: "Hafta" },
  { value: 3, label: "Ay" },
  { value: 4, label: "Yıl" },
] as const;

const BILLING_PERIOD_VALUE_BY_UNIT: Record<number, number> = {
  1: 1,
  2: 7,
  3: 30,
  4: 365,
};

export const getBillingPeriodValueForUnit = (unit?: number | string | null) => {
  const normalizedUnit = Number(unit);
  return Number.isFinite(normalizedUnit) ? BILLING_PERIOD_VALUE_BY_UNIT[normalizedUnit] : undefined;
};
