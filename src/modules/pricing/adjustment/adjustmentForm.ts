/**
 * Fiyat kuralı gövdesinin (priceAdjustment) form karşılığı ve dönüştürücüleri.
 *
 * Aynı gövde iki yerde düzenlenir: ürünün fiyatlandırma kuralları panelinde ve
 * ürün bağımsız fiyat şablonu formunda. İkisi de bu modülü kullanır, böylece
 * kural biçimi tek yerde tanımlı kalır.
 */
import type {
  ProductPricingRuleAdjustmentDto,
  ProductPricingRuleDto,
} from "@/shared/types/productOperations.types";

export interface TierFormState {
  from: string;
  to: string;
  type: string;
  value: string;
}

export interface ConditionFormState {
  field: string;
  operator: string;
  value: string;
}

export interface AdjustmentFormState {
  mode: string;
  type: string;
  value: string;
  operation: string;
  unitField: string;
  freeUnits: string;
  rounding: string;
  tiers: TierFormState[];
  /** Girdi olarak artık gösterilmiyor; var olan kurallardaki değeri kaybetmemek için okunup geri yazılıyor. */
  minAdjustment: string;
  maxAdjustment: string;
  minFinalPrice: string;
  maxFinalPrice: string;
  conditionsOperator: "all" | "any";
  conditions: ConditionFormState[];
}


/** Hesaplama bazı artık kullanıcıya sorulmuyor; tüm kurallar güncel fiyat üzerinden hesaplanır. */
export const APPLY_ON = "currentPrice";

export const defaultAdjustment: ProductPricingRuleAdjustmentDto = {
  mode: "",
  type: "",
  value: null,
  applyOn: APPLY_ON,
  unit: {
    field: "",
    freeUnits: null,
    rounding: "",
  },
  tiers: [],
  limits: {
    minAdjustment: null,
    maxAdjustment: null,
    minFinalPrice: null,
    maxFinalPrice: null,
  },
  conditions: {
    operator: "all",
    items: [],
  },
};

export const ADJUSTMENT_TYPES = [
  { value: "fixed", label: "Sabit tutar" },
  { value: "percentage", label: "Yüzde" },
  { value: "multiplier", label: "Çarpan" },
];

export const CONDITION_OPERATORS = [
  { value: "eq", label: "Eşittir" },
  { value: "neq", label: "Eşit değildir" },
  { value: "gt", label: "Büyüktür" },
  { value: "gte", label: "Büyük veya eşittir" },
  { value: "lt", label: "Küçüktür" },
  { value: "lte", label: "Küçük veya eşittir" },
  { value: "contains", label: "İçerir" },
  { value: "in", label: "Listeden biri" },
  { value: "exists", label: "Değer var" },
];

export const emptyTier = (): TierFormState => ({
  from: "",
  to: "",
  type: "",
  value: "",
});

export const emptyCondition = (): ConditionFormState => ({
  field: "",
  operator: "",
  value: "",
});

export const numberToInput = (value: unknown) =>
  typeof value === "number" && Number.isFinite(value) ? String(value) : "";

export const toNumberOrNull = (value: string) => {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const numberValue = Number(trimmed);
  return Number.isFinite(numberValue) ? numberValue : null;
};

export const toNumberOrUndefined = (value: string) => {
  const numberValue = toNumberOrNull(value);
  return numberValue == null ? undefined : numberValue;
};

export const parseConditionValue = (operator: string, value: string) => {
  if (operator === "exists") return undefined;
  if (operator === "in") {
    return value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean)
      .map((item) => {
        const numberValue = Number(item);
        return Number.isFinite(numberValue) && item !== "" ? numberValue : item;
      });
  }

  const trimmed = value.trim();
  if (trimmed === "true") return true;
  if (trimmed === "false") return false;
  const numberValue = Number(trimmed);
  return Number.isFinite(numberValue) && trimmed !== "" ? numberValue : trimmed;
};

export const valueToInput = (value: unknown) => {
  if (Array.isArray(value)) return value.join(", ");
  if (value == null) return "";
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
};

export const formatFieldLabel = (field: string) => {
  if (field.startsWith("feature.")) return `Özellik: ${field.replace("feature.", "")}`;
  return field;
};

export const collectAdjustmentFields = (adjustment: ProductPricingRuleAdjustmentDto, target: Set<string>) => {
  if (adjustment.unit?.field) target.add(adjustment.unit.field);
  adjustment.conditions?.items?.forEach((item) => {
    if (item.field) target.add(item.field);
  });
};

export const adjustmentToForm = (adjustment: ProductPricingRuleAdjustmentDto): AdjustmentFormState => ({
  mode: adjustment.mode === "unit" ? "unit" : "",
  type: adjustment.type ?? (adjustment.amount != null ? "fixed" : ""),
  value: numberToInput(adjustment.value ?? adjustment.amount),
  operation: adjustment.operation ?? adjustment.direction ?? "",
  unitField: adjustment.unit?.field ?? "",
  freeUnits: numberToInput(adjustment.unit?.freeUnits),
  rounding: adjustment.unit?.rounding ?? "",
  tiers: adjustment.tiers?.length
    ? adjustment.tiers.map((tier) => ({
      from: numberToInput(tier.from),
      to: numberToInput(tier.to),
      type: tier.type ?? "fixed",
      value: numberToInput(tier.value),
    }))
    : [],
  minAdjustment: numberToInput(adjustment.limits?.minAdjustment),
  maxAdjustment: numberToInput(adjustment.limits?.maxAdjustment),
  minFinalPrice: numberToInput(adjustment.limits?.minFinalPrice),
  maxFinalPrice: numberToInput(adjustment.limits?.maxFinalPrice),
  conditionsOperator: adjustment.conditions?.operator === "any" ? "any" : "all",
  conditions: adjustment.conditions?.items?.length
    ? adjustment.conditions.items.map((item) => ({
      field: item.field,
      operator: item.operator,
      value: valueToInput(item.value),
    }))
    : [],
});

export const formToAdjustment = (adjustment: AdjustmentFormState): ProductPricingRuleAdjustmentDto => {
  const result: ProductPricingRuleAdjustmentDto = {};
  const isUnitMode = adjustment.mode === "unit";

  if (!isUnitMode && adjustment.type) result.type = adjustment.type;
  result.applyOn = APPLY_ON;

  if (!isUnitMode) {
    const value = toNumberOrUndefined(adjustment.value);
    if (value != null) result.value = value;
  }
  if (adjustment.operation) result.operation = adjustment.operation;

  if (isUnitMode) {
    const unitField = adjustment.unitField.trim();
    result.mode = "unit";
    result.unit = {
      freeUnits: toNumberOrNull(adjustment.freeUnits),
      rounding: adjustment.rounding,
    };
    if (unitField) result.unit.field = unitField;
    result.tiers = adjustment.tiers
      .filter((tier) => tier.from.trim() || tier.to.trim() || tier.value.trim())
      .map((tier) => ({
        from: toNumberOrNull(tier.from),
        to: toNumberOrNull(tier.to),
        type: tier.type || undefined,
        value: toNumberOrNull(tier.value),
      }));
  }

  result.limits = {
    minAdjustment: toNumberOrNull(adjustment.minAdjustment),
    maxAdjustment: toNumberOrNull(adjustment.maxAdjustment),
    minFinalPrice: toNumberOrNull(adjustment.minFinalPrice),
    maxFinalPrice: toNumberOrNull(adjustment.maxFinalPrice),
  };

  result.conditions = {
    operator: adjustment.conditionsOperator,
    items: adjustment.conditions
      .filter((item) => item.field.trim() && item.operator)
      .map((item) => ({
        field: item.field.trim(),
        operator: item.operator,
        value: parseConditionValue(item.operator, item.value),
      })),
  };

  return result;
};

export const getAdjustment = (rule: ProductPricingRuleDto): ProductPricingRuleAdjustmentDto => {
  if (rule.priceAdjustment) return rule.priceAdjustment;
  if (!rule.priceAdjustmentJson) return defaultAdjustment;

  try {
    return JSON.parse(rule.priceAdjustmentJson) as ProductPricingRuleAdjustmentDto;
  } catch {
    return defaultAdjustment;
  }
};
