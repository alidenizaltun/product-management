import React, { useId, useMemo, useState } from "react";
import { Button, Modal, ModalBody, ModalHeader, UncontrolledTooltip } from "reactstrap";
import ConfirmDialog from "@/modules/shared/components/ConfirmDialog";
import { showApiError, showSuccess, showWarning } from "@/modules/shared/components/NotificationAlert";
import { useProductPricingRuleMutations, useProductPricingRules } from "@/modules/products/hooks/useProductPricingRules";
import type {
  ProductLicenseOfferingDto,
  ProductPricingRuleAdjustmentDto,
  ProductPricingRuleDto,
  ProductUnitDto,
  ProductVariantDto,
  UpsertProductPricingRuleRequestDto,
} from "@/shared/types/productOperations.types";

type ScopedLicenseOfferingOption = ProductLicenseOfferingDto & { _tempId?: string };
type ScopedProductUnitOption = ProductUnitDto & { _tempId?: string };
const UNIT_DRAG_MIME = "application/x-product-unit-ref";

interface ProductPricingRulesPanelProps {
  productId?: string;
  licenseOfferings?: ScopedLicenseOfferingOption[];
  productUnits?: ScopedProductUnitOption[];
  variants?: ProductVariantDto[];
  editable?: boolean;
  draftRules?: ProductPricingRuleDto[];
  onDraftRulesChange?: (rules: ProductPricingRuleDto[]) => void;
  /** Verilirse panel tek bir satış planına kilitlenir: liste filtrelenir, kapsam SELECT'i gizlenir. */
  lockedLicenseOfferingId?: string;
  lockedLicenseOfferingTempId?: string;
}

interface RuleFormState {
  id?: string;
  code: string;
  name: string;
  priority: string;
  isActive: boolean;
  validFrom: string;
  validTo: string;
  productLicenseOfferingId: string;
  licenseOfferingTempId: string;
  productUnitId: string;
  productUnitTempId: string;
  productUnitIds: string[];
  productUnitTempIds: string[];
  productVariantId: string;
  adjustment: AdjustmentFormState;
}

interface TierFormState {
  from: string;
  to: string;
  type: string;
  value: string;
}

interface ConditionFormState {
  field: string;
  operator: string;
  value: string;
}

interface AdjustmentFormState {
  mode: string;
  type: string;
  value: string;
  operation: string;
  applyOn: string;
  unitField: string;
  freeUnits: string;
  rounding: string;
  tiers: TierFormState[];
  minAdjustment: string;
  maxAdjustment: string;
  minFinalPrice: string;
  maxFinalPrice: string;
  conditionsOperator: "all" | "any";
  conditions: ConditionFormState[];
}

const defaultAdjustment: ProductPricingRuleAdjustmentDto = {
  mode: "",
  type: "",
  value: null,
  applyOn: "",
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

const ADJUSTMENT_TYPES = [
  { value: "fixed", label: "Sabit tutar" },
  { value: "percentage", label: "Yüzde" },
  { value: "percent", label: "Yüzde (percent)" },
  { value: "multiplier", label: "Çarpan" },
  { value: "custom", label: "Özel" },
];

const APPLY_ON_OPTIONS = [
  { value: "currentPrice", label: "Güncel fiyat" },
  { value: "basePrice", label: "Taban fiyat" },
  { value: "previousResult", label: "Önceki sonuç" },
];

const ADJUSTMENT_FORMULA_HINTS = [
  { label: "Sabit tutar", formula: "Baz +/- değer" },
  { label: "Yüzde", formula: "Baz +/- (baz x değer / 100)" },
  { label: "Çarpan", formula: "Baz +/- (baz x (değer - 1))" },
];

const CONDITION_OPERATORS = [
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

const COMMON_CONDITION_FIELDS = [
  { value: "quantity", label: "Miktar" },
  { value: "seats", label: "Kullanıcı / koltuk sayısı" },
  { value: "feature.seats", label: "Özellik: kullanıcı sayısı" },
];

interface HelpLabelProps {
  children: React.ReactNode;
  help: string;
}

const HelpLabel: React.FC<HelpLabelProps> = ({ children, help }) => {
  const reactId = useId();
  const id = `pricing-help-${reactId.replace(/[^a-zA-Z0-9_-]/g, "")}`;

  return (
    <span className="d-inline-flex align-items-center gap-1">
      <span>{children}</span>
      <button
        type="button"
        id={id}
        className="btn btn-xs btn-trigger btn-icon text-soft p-0"
        aria-label={`${children} hakkında bilgi`}
        onClick={(event) => event.preventDefault()}
      >
        <em className="icon ni ni-info" />
      </button>
      <UncontrolledTooltip autohide={false} placement="top" target={id}>
        {help}
      </UncontrolledTooltip>
    </span>
  );
};

const emptyTier = (): TierFormState => ({
  from: "",
  to: "",
  type: "",
  value: "",
});

const emptyCondition = (): ConditionFormState => ({
  field: "",
  operator: "",
  value: "",
});

const numberToInput = (value: unknown) =>
  typeof value === "number" && Number.isFinite(value) ? String(value) : "";

const toNumberOrNull = (value: string) => {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const numberValue = Number(trimmed);
  return Number.isFinite(numberValue) ? numberValue : null;
};

const toNumberOrUndefined = (value: string) => {
  const numberValue = toNumberOrNull(value);
  return numberValue == null ? undefined : numberValue;
};

const parseConditionValue = (operator: string, value: string) => {
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

const valueToInput = (value: unknown) => {
  if (Array.isArray(value)) return value.join(", ");
  if (value == null) return "";
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
};

const formatFieldLabel = (field: string) => {
  if (field.startsWith("feature.")) return `Özellik: ${field.replace("feature.", "")}`;
  return field;
};

const getProductUnitScopeValue = (unit: ScopedProductUnitOption) =>
  unit.id ? `id:${unit.id}` : unit._tempId ? `temp:${unit._tempId}` : "";

const getProductUnitLabel = (unit: ScopedProductUnitOption) =>
  unit.name?.trim() || unit.code?.trim() || unit.unitDefinitionName?.trim() || "Adsız birim";

const collectAdjustmentFields = (adjustment: ProductPricingRuleAdjustmentDto, target: Set<string>) => {
  if (adjustment.unit?.field) target.add(adjustment.unit.field);
  adjustment.conditions?.items?.forEach((item) => {
    if (item.field) target.add(item.field);
  });
};

const adjustmentToForm = (adjustment: ProductPricingRuleAdjustmentDto): AdjustmentFormState => ({
  mode: adjustment.mode === "unit" ? "unit" : "",
  type: adjustment.type ?? (adjustment.amount != null ? "fixed" : ""),
  value: numberToInput(adjustment.value ?? adjustment.amount),
  operation: adjustment.operation ?? adjustment.direction ?? "",
  applyOn: adjustment.applyOn ?? "",
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

const formToAdjustment = (adjustment: AdjustmentFormState): ProductPricingRuleAdjustmentDto => {
  const result: ProductPricingRuleAdjustmentDto = {};
  const isUnitMode = adjustment.mode === "unit";

  if (!isUnitMode && adjustment.type) result.type = adjustment.type;
  if (adjustment.applyOn) result.applyOn = adjustment.applyOn;

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

const getAdjustment = (rule: ProductPricingRuleDto): ProductPricingRuleAdjustmentDto => {
  if (rule.priceAdjustment) return rule.priceAdjustment;
  if (!rule.priceAdjustmentJson) return defaultAdjustment;

  try {
    return JSON.parse(rule.priceAdjustmentJson) as ProductPricingRuleAdjustmentDto;
  } catch {
    return defaultAdjustment;
  }
};

const emptyForm = (lockedOfferingId?: string, lockedOfferingTempId?: string): RuleFormState => ({
  code: "",
  name: "",
  priority: "",
  isActive: true,
  validFrom: "",
  validTo: "",
  productLicenseOfferingId: lockedOfferingId ?? "",
  licenseOfferingTempId: lockedOfferingTempId ?? "",
  productUnitId: "",
  productUnitTempId: "",
  productUnitIds: [],
  productUnitTempIds: [],
  productVariantId: "",
  adjustment: adjustmentToForm(defaultAdjustment),
});

const slugifyRuleCode = (value: string) => {
  const slug = value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ı/g, "i")
    .replace(/ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/ş/g, "s")
    .replace(/ö/g, "o")
    .replace(/ç/g, "c")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 32);

  return slug ? `rule-${slug}` : "";
};

const createAutoRuleName = (form: RuleFormState) => {
  if (form.adjustment.mode === "unit") return "Kademeli fiyat kuralı";

  const isDecrease = form.adjustment.operation === "subtract";
  const adjustmentType = form.adjustment.type || "percentage";

  if (adjustmentType === "percentage" || adjustmentType === "percent") {
    return isDecrease ? "Yüzde indirim" : "Yüzde artırım";
  }

  if (adjustmentType === "fixed") {
    return isDecrease ? "Sabit indirim" : "Sabit fiyat artışı";
  }

  if (adjustmentType === "multiplier") return "Çarpan kuralı";

  return "Dinamik fiyat kuralı";
};

const QUICK_RULE_TEMPLATES = [
  {
    title: "Genel indirim",
    description: "Seçili kapsam için yüzde indirim uygula.",
    icon: "percent",
    color: "primary",
    form: {
      name: "Genel indirim",
      adjustment: {
        type: "percentage",
        value: "10",
        operation: "subtract",
        applyOn: "currentPrice",
      },
    },
  },
  {
    title: "Kampanya indirimi",
    description: "Belirli dönemde fiyatı düşür.",
    icon: "percent",
    color: "success",
    form: {
      name: "Kampanya indirimi",
      adjustment: {
        type: "percentage",
        value: "20",
        operation: "subtract",
        applyOn: "currentPrice",
      },
    },
  },
  {
    title: "Miktar / kullanıcı kademesi",
    description: "Kullanıcı sayısı gibi birime göre hesapla.",
    icon: "layers",
    color: "info",
    form: {
      name: "Miktar kademesi",
      adjustment: {
        mode: "unit",
        unitField: "",
        rounding: "ceil",
        tiers: [{ from: "1", to: "", type: "fixed", value: "0" }],
      },
    },
  },
];

const toDateTimeInput = (value?: string | null) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value.slice(0, 16);
  const offsetMs = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offsetMs).toISOString().slice(0, 16);
};

const fromDateTimeInput = (value: string) => {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toISOString();
};

const mapProductUnitIds = (rule: {
  productUnitIds?: string[];
  productUnitId?: string | null;
}) => rule.productUnitIds?.length ? rule.productUnitIds : rule.productUnitId ? [rule.productUnitId] : [];

const toUnitScopeValues = (ids?: Array<string | null | undefined>, tempIds?: Array<string | null | undefined>) => [
  ...(ids ?? []).filter(Boolean).map((id) => `id:${id}`),
  ...(tempIds ?? []).filter(Boolean).map((id) => `temp:${id}`),
];

const splitUnitScopeValues = (values: string[]) => {
  const productUnitIds = values
    .filter((value) => value.startsWith("id:"))
    .map((value) => value.replace("id:", ""))
    .filter(Boolean);

  const productUnitTempIds = values
    .filter((value) => value.startsWith("temp:"))
    .map((value) => value.replace("temp:", ""))
    .filter(Boolean);

  return {
    productUnitIds,
    productUnitTempIds,
    productUnitId: productUnitIds[0] ?? "",
    productUnitTempId: productUnitIds.length === 0 ? productUnitTempIds[0] ?? "" : "",
  };
};

const ruleToForm = (rule: ProductPricingRuleDto): RuleFormState => ({
  id: rule.id,
  code: rule.code ?? "",
  name: rule.name ?? "",
  priority: rule.priority != null ? String(rule.priority) : "",
  isActive: Boolean(rule.isActive),
  validFrom: toDateTimeInput(rule.validFrom),
  validTo: toDateTimeInput(rule.validTo),
  productLicenseOfferingId: rule.productLicenseOfferingId ?? rule.licenseOfferingId ?? "",
  licenseOfferingTempId: rule.licenseOfferingTempId ?? "",
  productUnitId: rule.productUnitId ?? rule.productUnitIds?.[0] ?? "",
  productUnitTempId: rule.productUnitTempId ?? "",
  productUnitIds: mapProductUnitIds(rule),
  productUnitTempIds: rule.productUnitTempIds ?? (rule.productUnitTempId ? [rule.productUnitTempId] : []),
  productVariantId: rule.productVariantId ?? "",
  adjustment: adjustmentToForm(getAdjustment(rule)),
});

const shortJsonSummary = (rule: ProductPricingRuleDto) => {
  const adjustment = rule.priceAdjustment;
  if (adjustment?.mode === "unit") {
    const field = adjustment.unit?.field ?? "unit";
    const tierCount = adjustment.tiers?.length ?? 0;
    return `${field}${tierCount ? `, ${tierCount} kademe` : ""}`;
  }

  if (adjustment?.type || adjustment?.value != null || adjustment?.amount != null) {
    return `${adjustment.type ?? "adjustment"} ${adjustment.value ?? adjustment.amount ?? ""}`.trim();
  }

  return rule.priceAdjustmentJson ? "JSON tanımlı" : "Kural detayı yok";
};

const ProductPricingRulesPanel: React.FC<ProductPricingRulesPanelProps> = ({
  productId,
  licenseOfferings = [],
  productUnits = [],
  variants = [],
  editable = false,
  draftRules,
  onDraftRulesChange,
  lockedLicenseOfferingId,
  lockedLicenseOfferingTempId,
}) => {
  const { data, isLoading, isError, refetch } = useProductPricingRules(productId);
  const { createMutation, updateMutation, deleteMutation } = useProductPricingRuleMutations(productId);
  const isLocked = Boolean(lockedLicenseOfferingId || lockedLicenseOfferingTempId);
  const [form, setForm] = useState<RuleFormState>(() => emptyForm(lockedLicenseOfferingId, lockedLicenseOfferingTempId));
  const [deleteTarget, setDeleteTarget] = useState<ProductPricingRuleDto | null>(null);
  const [engineOpen, setEngineOpen] = useState(false);
  const [formOpen, setFormOpen] = useState(false);

  const allRules = useMemo(
    () => [...(productId ? data ?? [] : draftRules ?? [])].sort((a, b) => (a.priority ?? 0) - (b.priority ?? 0)),
    [data, draftRules, productId]
  );
  const rules = useMemo(() => {
    if (!isLocked) return allRules;
    return allRules.filter((rule) => {
      const offeringId = rule.productLicenseOfferingId ?? rule.licenseOfferingId ?? "";
      return (
        (lockedLicenseOfferingId && offeringId === lockedLicenseOfferingId) ||
        (lockedLicenseOfferingTempId && rule.licenseOfferingTempId === lockedLicenseOfferingTempId)
      );
    });
  }, [allRules, isLocked, lockedLicenseOfferingId, lockedLicenseOfferingTempId]);
  const offeringById = useMemo(
    () => new Map(licenseOfferings.map((offering) => [offering.id, offering])),
    [licenseOfferings]
  );
  const productUnitById = useMemo(
    () => new Map(productUnits.map((unit) => [unit.id, unit])),
    [productUnits]
  );
  const variantById = useMemo(
    () => new Map(variants.map((variant) => [variant.id, variant])),
    [variants]
  );
  const conditionFieldOptions = useMemo(() => {
    const fields = new Set<string>();

    collectAdjustmentFields(defaultAdjustment, fields);
    allRules.forEach((rule) => collectAdjustmentFields(getAdjustment(rule), fields));
    if (form.adjustment.unitField.trim()) fields.add(form.adjustment.unitField.trim());
    form.adjustment.conditions.forEach((condition) => {
      if (condition.field.trim()) fields.add(condition.field.trim());
    });

    const dynamicFields = [...fields].map((field) => ({
      value: field,
      label: formatFieldLabel(field),
    }));

    const merged = new Map<string, { value: string; label: string }>();
    [...COMMON_CONDITION_FIELDS, ...dynamicFields].forEach((field) => merged.set(field.value, field));
    return [...merged.values()];
  }, [allRules, form.adjustment.unitField, form.adjustment.conditions]);

  const ensureUniqueRuleName = (baseName: string) => {
    const usedNames = new Set(
      allRules
        .filter((rule) => rule.id !== form.id)
        .map((rule) => rule.name?.trim().toLocaleLowerCase("tr-TR"))
        .filter(Boolean)
    );
    const trimmedBaseName = baseName.trim() || "Dinamik fiyat kuralı";

    if (!usedNames.has(trimmedBaseName.toLocaleLowerCase("tr-TR"))) return trimmedBaseName;

    let index = 2;
    let candidate = `${trimmedBaseName} ${index}`;
    while (usedNames.has(candidate.toLocaleLowerCase("tr-TR"))) {
      index += 1;
      candidate = `${trimmedBaseName} ${index}`;
    }

    return candidate;
  };

  const ensureUniqueRuleCode = (baseCode: string) => {
    const usedCodes = new Set(
      allRules
        .filter((rule) => rule.id !== form.id)
        .map((rule) => rule.code?.trim().toLocaleLowerCase("tr-TR"))
        .filter(Boolean)
    );
    const trimmedBaseCode = baseCode.trim() || "rule-dinamik-fiyat-kurali";

    if (!usedCodes.has(trimmedBaseCode.toLocaleLowerCase("tr-TR"))) return trimmedBaseCode;

    let index = 2;
    let candidate = `${trimmedBaseCode}-${index}`;
    while (usedCodes.has(candidate.toLocaleLowerCase("tr-TR"))) {
      index += 1;
      candidate = `${trimmedBaseCode}-${index}`;
    }

    return candidate;
  };

  const resetForm = () => {
    setForm(emptyForm(lockedLicenseOfferingId, lockedLicenseOfferingTempId));
    setEngineOpen(false);
    setFormOpen(false);
  };

  const updateForm = <K extends keyof RuleFormState>(key: K, value: RuleFormState[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const updateRuleName = (value: string) => {
    setForm((current) => ({
      ...current,
      name: value,
      code: current.code && !current.code.startsWith("rule-") ? current.code : slugifyRuleCode(value),
    }));
  };

  const applyQuickTemplate = (template: typeof QUICK_RULE_TEMPLATES[number]) => {
    const isUnitTemplate = template.form.adjustment.mode === "unit";

    setForm((current) => ({
      ...current,
      name: template.form.name,
      code: slugifyRuleCode(template.form.name),
      priority: current.priority || String((rules.length + 1) * 10),
      adjustment: {
        ...current.adjustment,
        ...template.form.adjustment,
        conditions: [],
      },
    }));
    setEngineOpen(isUnitTemplate);
  };

  const updateAdjustment = <K extends keyof AdjustmentFormState>(key: K, value: AdjustmentFormState[K]) => {
    setForm((current) => ({
      ...current,
      adjustment: {
        ...current.adjustment,
        [key]: value,
      },
    }));
  };

  const updateTier = <K extends keyof TierFormState>(index: number, key: K, value: TierFormState[K]) => {
    setForm((current) => {
      const tiers = [...current.adjustment.tiers];
      tiers[index] = { ...tiers[index], [key]: value };
      return { ...current, adjustment: { ...current.adjustment, tiers } };
    });
  };

  const addTier = () => updateAdjustment("tiers", [...form.adjustment.tiers, emptyTier()]);

  const removeTier = (index: number) => {
    updateAdjustment("tiers", form.adjustment.tiers.filter((_, itemIndex) => itemIndex !== index));
  };

  const updateCondition = <K extends keyof ConditionFormState>(
    index: number,
    key: K,
    value: ConditionFormState[K]
  ) => {
    setForm((current) => {
      const conditions = [...current.adjustment.conditions];
      conditions[index] = { ...conditions[index], [key]: value };
      return { ...current, adjustment: { ...current.adjustment, conditions } };
    });
  };

  const addCondition = () => updateAdjustment("conditions", [...form.adjustment.conditions, emptyCondition()]);

  const removeCondition = (index: number) => {
    updateAdjustment("conditions", form.adjustment.conditions.filter((_, itemIndex) => itemIndex !== index));
  };

  const buildPayload = (): UpsertProductPricingRuleRequestDto => {
    const priceAdjustment = formToAdjustment(form.adjustment);
    const typedName = form.name.trim();
    const typedCode = form.code.trim();
    const name = typedName || ensureUniqueRuleName(createAutoRuleName(form));
    const code = typedCode
      ? typedCode.startsWith("rule-")
        ? ensureUniqueRuleCode(typedCode)
        : typedCode
      : ensureUniqueRuleCode(slugifyRuleCode(name));
    const productUnitIds = (form.productUnitIds.length ? form.productUnitIds : form.productUnitId ? [form.productUnitId] : [])
      .filter(Boolean);
    const productUnitTempIds = (form.productUnitTempIds.length
      ? form.productUnitTempIds
      : form.productUnitTempId
        ? [form.productUnitTempId]
        : [])
      .filter(Boolean);

    return {
      code,
      name,
      priority: Number(form.priority || 0),
      isActive: Boolean(form.isActive),
      validFrom: fromDateTimeInput(form.validFrom),
      validTo: fromDateTimeInput(form.validTo),
      salesChannel: null,
      customerGroupCode: null,
      productVariantId: form.productVariantId || null,
      productUnitId: productUnitIds[0] || null,
      productUnitTempId: productUnitIds.length === 0 ? productUnitTempIds[0] || null : null,
      productUnitIds: productUnitIds.length ? productUnitIds : undefined,
      productUnitTempIds: productUnitTempIds.length ? productUnitTempIds : undefined,
      productLicenseOfferingId: lockedLicenseOfferingId ?? (form.productLicenseOfferingId || null),
      licenseOfferingTempId: lockedLicenseOfferingTempId ?? (form.licenseOfferingTempId || null),
      priceAdjustment,
      priceAdjustmentJson: JSON.stringify(priceAdjustment),
    };
  };

  const handleSubmit = async () => {
    if (productId && (form.productUnitTempIds.length || form.productUnitTempId)) {
      showWarning("Önce ürün birimini kaydedin, sonra kuralı kaydedebilirsiniz.");
      return;
    }

    const payload = buildPayload();

    if (!productId && onDraftRulesChange) {
      const draftRule: ProductPricingRuleDto = {
        id: form.id || `draft-rule-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        productId: "",
        productLicenseOfferingId: payload.productLicenseOfferingId ?? null,
        licenseOfferingTempId: payload.licenseOfferingTempId ?? null,
        productUnitId: payload.productUnitId ?? null,
        productUnitTempId: payload.productUnitTempId ?? null,
        productUnitIds: payload.productUnitIds ?? [],
        productUnitTempIds: payload.productUnitTempIds ?? [],
        productVariantId: payload.productVariantId ?? null,
        salesChannel: payload.salesChannel ?? null,
        customerGroupCode: payload.customerGroupCode ?? null,
        code: payload.code,
        name: payload.name,
        priority: payload.priority,
        isActive: payload.isActive,
        validFrom: payload.validFrom,
        validTo: payload.validTo,
        priceAdjustment: payload.priceAdjustment,
        priceAdjustmentJson: payload.priceAdjustmentJson,
      };

      onDraftRulesChange(
        form.id
          ? rules.map((rule) => (rule.id === form.id ? draftRule : rule))
          : [...rules, draftRule]
      );
      showSuccess(form.id ? "Taslak kural güncellendi." : "Taslak kural eklendi.");
      resetForm();
      return;
    }

    if (!productId) return;

    try {
      if (form.id) {
        await updateMutation.mutateAsync({ id: form.id, payload });
        showSuccess("Fiyatlandırma kuralı güncellendi.");
      } else {
        await createMutation.mutateAsync(payload);
        showSuccess("Fiyatlandırma kuralı eklendi.");
      }
      resetForm();
    } catch (error) {
      showApiError(error);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;

    if (!productId && onDraftRulesChange) {
      onDraftRulesChange(rules.filter((rule) => rule.id !== deleteTarget.id));
      showSuccess("Taslak kural silindi.");
      setDeleteTarget(null);
      return;
    }

    try {
      await deleteMutation.mutateAsync(deleteTarget.id);
      showSuccess("Fiyatlandırma kuralı silindi.");
      setDeleteTarget(null);
    } catch (error) {
      showApiError(error);
    }
  };

  const selectedOfferingValue = form.productLicenseOfferingId
    ? `id:${form.productLicenseOfferingId}`
    : form.licenseOfferingTempId
      ? `temp:${form.licenseOfferingTempId}`
      : "";
  const selectedProductUnitValues = toUnitScopeValues(
    form.productUnitIds.length ? form.productUnitIds : form.productUnitId ? [form.productUnitId] : [],
    form.productUnitTempIds.length ? form.productUnitTempIds : form.productUnitTempId ? [form.productUnitTempId] : []
  );
  const selectedOffering = selectedOfferingValue
    ? licenseOfferings.find((offering) => {
      const value = offering.id ? `id:${offering.id}` : `temp:${offering._tempId}`;
      return value === selectedOfferingValue;
    })
    : undefined;
  const selectedOfferingUnitValues = selectedOffering
    ? toUnitScopeValues(
      selectedOffering.productUnitIds?.length
        ? selectedOffering.productUnitIds
        : selectedOffering.productUnitId
          ? [selectedOffering.productUnitId]
          : [],
      selectedOffering.productUnitTempIds?.length
        ? selectedOffering.productUnitTempIds
        : selectedOffering.productUnitTempId
          ? [selectedOffering.productUnitTempId]
          : []
    )
    : [];
  const selectableProductUnits = selectedOffering
    ? productUnits.filter((unit) => {
      const value = getProductUnitScopeValue(unit);
      return selectedOfferingUnitValues.includes(value);
    })
    : productUnits;
  const activeSelectableProductUnits = selectableProductUnits.filter((unit) => unit.isActive && (unit.id || unit._tempId));
  const singleSelectableProductUnit =
    selectedOffering && activeSelectableProductUnits.length === 1 ? activeSelectableProductUnits[0] : undefined;
  const shouldHideProductUnitScope = Boolean(singleSelectableProductUnit);
  const selectedProductUnitObjects = selectedProductUnitValues.length
    ? selectedProductUnitValues
      .map((value) => activeSelectableProductUnits.find((unit) => getProductUnitScopeValue(unit) === value))
      .filter((unit): unit is ScopedProductUnitOption => Boolean(unit))
    : singleSelectableProductUnit
      ? [singleSelectableProductUnit]
      : [];
  const selectedUnitNames = selectedProductUnitObjects.map(getProductUnitLabel);
  const pending = createMutation.isPending || updateMutation.isPending;
  const isUnitMode = form.adjustment.mode === "unit";

  if (!productId && !onDraftRulesChange) {
    return (
      <div className="card card-bordered">
        <div className="card-inner text-center py-5">
          <em className="icon ni ni-coins fs-1 text-soft d-block mb-3" />
          <p className="text-soft mb-0">Dinamik fiyatlandırma kuralları ürünü kaydettikten sonra yönetilebilir.</p>
        </div>
      </div>
    );
  }

  const updateOfferingScope = (value: string) => {
    const nextScope = {
      productLicenseOfferingId: "",
      licenseOfferingTempId: "",
    };

    if (value.startsWith("id:")) {
      nextScope.productLicenseOfferingId = value.replace("id:", "");
    } else if (value.startsWith("temp:")) {
      nextScope.licenseOfferingTempId = value.replace("temp:", "");
    }

    const nextOffering = value
      ? licenseOfferings.find((offering) => {
        const offeringValue = offering.id ? `id:${offering.id}` : `temp:${offering._tempId}`;
        return offeringValue === value;
      })
      : undefined;
    const nextOfferingUnitValues = nextOffering
      ? toUnitScopeValues(
        nextOffering.productUnitIds?.length
          ? nextOffering.productUnitIds
          : nextOffering.productUnitId
            ? [nextOffering.productUnitId]
            : [],
        nextOffering.productUnitTempIds?.length
          ? nextOffering.productUnitTempIds
          : nextOffering.productUnitTempId
            ? [nextOffering.productUnitTempId]
            : []
      )
      : [];
    const nextSelectableUnits = nextOffering
      ? productUnits.filter((unit) => nextOfferingUnitValues.includes(getProductUnitScopeValue(unit)))
      : [];
    const nextSingleUnit = nextSelectableUnits.filter((unit) => unit.isActive && (unit.id || unit._tempId))[0];
    const nextScopeForUnit =
      nextOffering && nextSelectableUnits.filter((unit) => unit.isActive && (unit.id || unit._tempId)).length === 1 && nextSingleUnit
        ? splitUnitScopeValues([getProductUnitScopeValue(nextSingleUnit)])
        : splitUnitScopeValues([]);

    setForm((current) => ({
      ...current,
      ...nextScope,
      productUnitId: nextScopeForUnit.productUnitId,
      productUnitTempId: nextScopeForUnit.productUnitTempId,
      productUnitIds: nextScopeForUnit.productUnitIds,
      productUnitTempIds: nextScopeForUnit.productUnitTempIds,
    }));
  };

  const updateAdjustmentMode = (value: string) => {
    setForm((current) => ({
      ...current,
      adjustment: {
        ...current.adjustment,
        mode: value,
      },
    }));

    if (value === "unit") {
      setEngineOpen(true);
    }
  };

  const updateProductUnitScope = (value: string, checked: boolean) => {
    const values = checked
      ? [...selectedProductUnitValues, value]
      : selectedProductUnitValues.filter((item) => item !== value);
    const scope = splitUnitScopeValues([...new Set(values)]);

    setForm((current) => ({
      ...current,
      productUnitId: scope.productUnitId,
      productUnitTempId: scope.productUnitTempId,
      productUnitIds: scope.productUnitIds,
      productUnitTempIds: scope.productUnitTempIds,
    }));
  };

  const handleProductUnitDrop = (event: React.DragEvent<HTMLDivElement>) => {
    const value = event.dataTransfer.getData(UNIT_DRAG_MIME);
    if (!value) return;

    event.preventDefault();
    const allowed = selectableProductUnits.some((unit) => (unit.id ? `id:${unit.id}` : `temp:${unit._tempId}`) === value);
    if (!allowed) {
      showWarning("Bu birim seçili satış planına bağlı değil.");
      return;
    }

    updateProductUnitScope(value, true);
  };

  return (
    <div className="row g-4">
      {editable && (
        <Modal isOpen={formOpen} toggle={resetForm} size="xl" centered scrollable>
          <ModalHeader toggle={resetForm}>
            {form.id ? "Kuralı Güncelle" : "Dinamik Kural Ekle"}
          </ModalHeader>
          <ModalBody className="pricing-manager-modal-body">
            <div className="pricing-manager-modal-intro">
              <span className="overline-title text-primary">Kural oluşturucu</span>
              <p className="text-soft fs-13px mb-0">
                Şablon seçin veya cümleyi doldurun: Eğer bir durum oluşursa fiyatı değiştir.
              </p>
            </div>
                {!form.id && (
                  <div className="row g-3 mb-4">
                    {QUICK_RULE_TEMPLATES.map((template) => (
                      <div className="col-sm-6 col-xl-4" key={template.title}>
                        <button
                          type="button"
                          className="card card-bordered h-100 w-100 bg-white text-start"
                          onClick={() => applyQuickTemplate(template)}
                        >
                          <div className="card-inner">
                            <span className={`btn btn-icon btn-${template.color} rounded-circle mb-3`}>
                              <em className={`icon ni ni-${template.icon}`} />
                            </span>
                            <h6 className="title mb-1">{template.title}</h6>
                            <p className="text-soft fs-12px mb-0">{template.description}</p>
                          </div>
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="row g-3">
                  <div className="col-12">
                    <div className="pricing-rule-scope-panel">
                      <div className="pricing-rule-scope-copy">
                        <span className="overline-title text-primary">Önce kapsam</span>
                        <p className="mb-0 text-soft">
                          Kuralın hangi satış planına uygulanacağını seçin. Tüm planlar seçiliyse tüm ürün birimleri, tek plan seçiliyse yalnızca o plana bağlı birimler seçilebilir.
                        </p>
                      </div>
                      <div className="row g-3 align-items-end">
                        {!isLocked && (
                          <div className="col-md-6">
                            <label className="form-label">
                              <HelpLabel help="Satış planı müşterinin satın aldığı pakettir. Tüm planlar seçilirse bu kural ürünün bütün paketlerinde çalışır; tek plan seçerseniz kural sadece o pakete uygulanır.">
                                Hangi satış planı?
                              </HelpLabel>
                            </label>
                            <select
                              className="form-select"
                              value={selectedOfferingValue}
                              onChange={(event) => updateOfferingScope(event.target.value)}
                            >
                              <option value="">Tüm planlar</option>
                              {licenseOfferings.map((offering) => {
                                const value = offering.id ? `id:${offering.id}` : `temp:${offering._tempId}`;
                                return (
                                  <option key={value} value={value}>
                                    {offering.name}
                                    {!offering.id ? " (kaydedilecek)" : ""}
                                  </option>
                                );
                              })}
                            </select>
                          </div>
                        )}
                        <div className={isLocked ? "col-md-12" : "col-md-6"}>
                          <label className="form-label">
                            <HelpLabel help="Kural birimlerinin tek bir değerle mi yoksa kademeli mi hesaplanacağını seçer. Kademeli modda fiyat etkisi kademelerden gelir.">
                              Hesaplama modu
                            </HelpLabel>
                          </label>
                          <select
                            className="form-select"
                            value={form.adjustment.mode}
                            onChange={(event) => updateAdjustmentMode(event.target.value)}
                          >
                            <option value="">Sabit</option>
                            <option value="unit">Kademeli</option>
                          </select>
                        </div>
                        {singleSelectableProductUnit && (
                          <div className="form-note mt-1">
                            Kural birimi otomatik: {getProductUnitLabel(singleSelectableProductUnit)}
                          </div>
                        )}
                        {!shouldHideProductUnitScope && (
                          <div className="col-md-12">
                            <label className="form-label">
                              <HelpLabel help="Kuralın hangi ürün birimlerinde çalışacağını belirler. Plan seçtiyseniz yalnızca o plana bağlı birimler görünür; tüm planlar seçiliyse tüm ürün birimleri seçilebilir.">
                                Kuralın uygulanacağı birimler
                              </HelpLabel>
                            </label>
                            <div
                              className="pricing-unit-dropzone"
                              onDragOver={(event) => {
                                if (event.dataTransfer.types.includes(UNIT_DRAG_MIME)) {
                                  event.preventDefault();
                                  event.dataTransfer.dropEffect = "copy";
                                }
                              }}
                              onDrop={handleProductUnitDrop}
                            >
                              <div className="pricing-unit-dropzone-hint">
                                <em className="icon ni ni-drag" />
                                Birimi buraya bırak
                              </div>
                              <div className="form-check">
                                <input
                                  type="checkbox"
                                  className="form-check-input"
                                  id="pricing-rule-unit-all"
                                  checked={selectedProductUnitValues.length === 0}
                                  onChange={() => {
                                    const scope = splitUnitScopeValues([]);
                                    setForm((current) => ({
                                      ...current,
                                      productUnitId: scope.productUnitId,
                                      productUnitTempId: scope.productUnitTempId,
                                      productUnitIds: scope.productUnitIds,
                                      productUnitTempIds: scope.productUnitTempIds,
                                    }));
                                  }}
                                />
                                <label className="form-check-label" htmlFor="pricing-rule-unit-all">
                                  {selectedOffering ? "Paketin tüm birimleri" : "Tüm ürün birimleri"}
                                </label>
                              </div>
                              {activeSelectableProductUnits.map((unit) => {
                                const value = getProductUnitScopeValue(unit);
                                return (
                                  <div className="form-check" key={value}>
                                    <input
                                      type="checkbox"
                                      className="form-check-input"
                                      id={`pricing-rule-unit-${value}`}
                                      checked={selectedProductUnitValues.includes(value)}
                                      onChange={(event) => updateProductUnitScope(value, event.target.checked)}
                                    />
                                    <label className="form-check-label" htmlFor={`pricing-rule-unit-${value}`}>
                                      {getProductUnitLabel(unit)} ({unit.code}){!unit.id ? " (kaydedilecek)" : ""}
                                    </label>
                                  </div>
                                );
                              })}
                              {activeSelectableProductUnits.length === 0 && (
                                <span className="text-soft fs-12px">
                                  {selectedOffering ? "Seçili plana bağlı birim yok." : "Tanımlı ürün birimi yok."}
                                </span>
                              )}
                            </div>
                          </div>
                        )}
                        {/* <div className="col-md-4">
                        <label className="form-label">Hangi varyant?</label>
                        <select
                          className="form-select"
                          value={form.productVariantId}
                          onChange={(event) => updateForm("productVariantId", event.target.value)}
                        >
                          <option value="">Tüm varyantlar</option>
                          {variants.map((variant) => (
                            <option key={variant.id} value={variant.id}>
                              {variant.name || variant.sku}
                            </option>
                          ))}
                        </select>
                      </div> */}
                      </div>
                    </div>
                  </div>

                  <div className="col-lg-12">
                    <label className="form-label">
                      <HelpLabel help="Bu kuralı listede tanıyacağınız isimdir. Boş bırakırsanız sistem seçilen fiyat aksiyonuna göre otomatik bir ad üretir.">
                        Kural adı
                      </HelpLabel>
                    </label>
                    <input
                      className="form-control form-control-lg"
                      placeholder="Boş bırakılırsa otomatik üretilir"
                      value={form.name}
                      onChange={(event) => updateRuleName(event.target.value)}
                    />
                  </div>

                  <div className="col-12">
                    <div className="card card-bordered bg-lighter mb-0">
                      <div className="card-inner">
                        <div className="row g-3 align-items-end">
                          <div className="col-12">
                            <span className="overline-title text-primary">
                              <HelpLabel help="Bu bölüm, kural çalıştığında ürün fiyatında ne yapılacağını tanımlar. Önce fiyat artırılsın mı düşürülsün mü seçilir, sonra bu değişimin yüzde, sabit tutar veya çarpan olarak nasıl hesaplanacağı belirlenir.">
                                Fiyat aksiyonu
                              </HelpLabel>
                            </span>
                          </div>
                          <div className="col-12">
                            <div className="alert alert-info py-2 px-3 mb-0 d-flex flex-wrap align-items-center gap-3 h-100 fs-12px">
                              <span className="d-inline-flex align-items-center gap-1 text-info fw-medium">
                                <em className="icon ni ni-info" />
                                Formül
                              </span>
                              {ADJUSTMENT_FORMULA_HINTS.map((item) => (
                                <span key={item.label} className="text-soft text-nowrap">
                                  <strong>{item.label}:</strong> {item.formula}
                                </span>
                              ))}
                            </div>
                          </div>
                          <div className="col-md-3">
                            <label className="form-label">
                              <HelpLabel help="Kural tetiklendiğinde fiyatın hangi yöne değişeceğini seçer. Düşür seçeneği indirim uygular; artır seçeneği fiyatın üzerine ekleme yapar.">
                                Fiyat yönü
                              </HelpLabel>
                            </label>
                            <select
                              className="form-select"
                              value={form.adjustment.operation === "subtract" ? "subtract" : "add"}
                              onChange={(event) =>
                                updateAdjustment("operation", event.target.value === "subtract" ? "subtract" : "")
                              }
                            >
                              <option value="subtract">Düşür</option>
                              <option value="add">Artır</option>
                            </select>
                          </div>
                          <div className="col-md-3">
                            <label className="form-label">
                              <HelpLabel help="Fiyat değişiminin hangi yöntemle hesaplanacağını belirtir. Yüzdeyle seçerseniz değer alanı yüzde oranıdır; sabit tutarda doğrudan para tutarıdır; çarpanda fiyat belirlenen katsayıyla çarpılır.">
                                Değişim türü
                              </HelpLabel>
                            </label>
                            <select
                              className="form-select"
                              value={form.adjustment.type || "percentage"}
                              disabled={isUnitMode}
                              onChange={(event) => updateAdjustment("type", event.target.value)}
                            >
                              <option value="percentage">Yüzdeyle</option>
                              <option value="fixed">Sabit tutarla</option>
                              <option value="multiplier">Çarpanla</option>
                            </select>
                          </div>
                          <div className="col-md-3">
                            <label className="form-label">
                              <HelpLabel help="Seçilen değişim türünün sayısal karşılığıdır. Yüzde indirimi için 10 yazmak yüzde 10 anlamına gelir; sabit tutar için para tutarı, çarpan için katsayı olarak yorumlanır.">
                                Değişim değeri
                              </HelpLabel>
                            </label>
                            <input
                              className="form-control"
                              type="number"
                              step="0.0001"
                              placeholder={isUnitMode ? "Kademeden gelir" : "10"}
                              value={form.adjustment.value}
                              disabled={isUnitMode}
                              onChange={(event) => updateAdjustment("value", event.target.value)}
                            />
                          </div>
                          <div className="col-md-3">
                            <label className="form-label">
                              <HelpLabel help="Bu değişimin hangi fiyat üzerinden hesaplanacağını seçer. Güncel fiyat mevcut fiyatı baz alır; taban fiyat ürünün temel fiyatından başlar; önceki sonuç ise daha önce çalışan bir kuralın sonucunu kullanır.">
                                Hesaplama bazı
                              </HelpLabel>
                            </label>
                            <select
                              className="form-select"
                              value={form.adjustment.applyOn || "currentPrice"}
                              onChange={(event) => updateAdjustment("applyOn", event.target.value)}
                            >
                              {APPLY_ON_OPTIONS.map((item) => (
                                <option key={item.value} value={item.value}>
                                  {item.label}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="col-md-3">
                    <label className="form-label">
                      <HelpLabel help="Kuralın çalışmaya başlayacağı tarih ve saattir. Boş bırakılırsa kural, aktif olduğu sürece başlangıç kısıtı olmadan değerlendirilebilir.">
                        Geçerlilik başlangıcı
                      </HelpLabel>
                    </label>
                    <input
                      className="form-control"
                      type="datetime-local"
                      value={form.validFrom}
                      onChange={(event) => updateForm("validFrom", event.target.value)}
                    />
                  </div>
                  <div className="col-md-3">
                    <label className="form-label">
                      <HelpLabel help="Kuralın çalışmayı bırakacağı tarih ve saattir. Kampanya veya dönemsel fiyat kuralı oluştururken son geçerlilik zamanını buradan belirleyin.">
                        Geçerlilik bitişi
                      </HelpLabel>
                    </label>
                    <input
                      className="form-control"
                      type="datetime-local"
                      value={form.validTo}
                      onChange={(event) => updateForm("validTo", event.target.value)}
                    />
                  </div>
                  <div className="col-md-3 d-flex align-items-end">
                    <div className="custom-control custom-switch">
                      <input
                        type="checkbox"
                        className="custom-control-input"
                        id="pricing-rule-active"
                        checked={form.isActive}
                        onChange={(event) => updateForm("isActive", event.target.checked)}
                      />
                      <label className="custom-control-label" htmlFor="pricing-rule-active">
                        <HelpLabel help="Aktif değilse kural kayıtlı kalır ancak fiyat hesaplamasında kullanılmaz. Taslak olarak saklamak istediğiniz kuralları pasif bırakabilirsiniz.">
                          Kural aktif
                        </HelpLabel>
                      </label>
                    </div>
                  </div>
                  <div className="col-md-3 d-flex align-items-end">
                    <Button
                      color="light"
                      outline
                      type="button"
                      className="w-100"
                      onClick={() => setEngineOpen((current) => !current)}
                    >
                      <em className={`icon ni ni-chevron-${engineOpen ? "up" : "down"} me-1`} />
                      Gelişmiş ayarlar
                    </Button>
                  </div>

                  {engineOpen && (
                    <div className="col-12">
                      <div className="card card-bordered mb-0">
                        <div className="card-inner">
                          <h6 className="overline-title text-primary mb-3">
                            <HelpLabel help="Bu alanlar kuralın teknik çalışma biçimini belirler. Çoğu standart indirim veya artırım için kapalı kalabilir; öncelik, ek koşul, birim bazlı kademe veya fiyat limitleri gerektiğinde kullanılır.">
                              Gelişmiş motor ayarları
                            </HelpLabel>
                          </h6>

                          <div className="row g-3">
                            <div className="col-md-6">
                              <label className="form-label">
                                <HelpLabel help="Backend ve entegrasyon tarafında kuralı teknik olarak tanımlayan kısa koddur. Ad değişse bile bu kod sabit kalabilir; boş bırakılırsa kural adından otomatik üretilebilir.">
                                  Kural kodu
                                </HelpLabel>
                              </label>
                              <input
                                className="form-control"
                                value={form.code}
                                onChange={(event) => updateForm("code", event.target.value)}
                              />
                            </div>
                            <div className="col-md-6">
                              <label className="form-label">
                                <HelpLabel help="Birden fazla kural aynı fiyat üzerinde çalışıyorsa hangi sırayla uygulanacağını belirler. Küçük sayı daha önce çalışır; örneğin 10, 20'den önce değerlendirilir.">
                                  Çalışma önceliği
                                </HelpLabel>
                              </label>
                              <input
                                className="form-control"
                                type="number"
                                value={form.priority}
                                onChange={(event) => updateForm("priority", event.target.value)}
                              />
                            </div>

                            {isUnitMode && (
                              <>
                                {/* <div className="col-md-4">
                                <label className="form-label">
                                  <HelpLabel help="Opsiyoneldir. Normalde birim bazlı hesaplama seçili Product Unit kapsamından miktarı çözer. Sadece backend'e farklı bir feature anahtarı göndermeniz gerekiyorsa doldurun.">
                                    Özel miktar alanı
                                  </HelpLabel>
                                </label>
                                <input
                                  className="form-control"
                                  placeholder="Boş bırakılabilir"
                                  value={form.adjustment.unitField}
                                  onChange={(event) => updateAdjustment("unitField", event.target.value)}
                                />
                                <div className="form-note mt-1">
                                  {selectedUnitNames.length
                                    ? `${selectedUnitNames.join(", ")} kapsamı Product Unit üzerinden uygulanır.`
                                    : "Kapsam tüm birimlerse aynı kademe mantığı uygun birimlere uygulanır."}
                                </div>
                              </div> */}
                                <div className="col-md-4">
                                  <label className="form-label">
                                    <HelpLabel help="Fiyat hesaplamasına dahil edilmeyecek başlangıç miktarıdır. Örneğin 5 ücretsiz kullanıcı varsa ilk 5 kullanıcı ücretlendirilmez, hesaplama kalan miktardan başlar.">
                                      Ücretsiz miktar
                                    </HelpLabel>
                                  </label>
                                  <input
                                    className="form-control"
                                    type="number"
                                    value={form.adjustment.freeUnits}
                                    onChange={(event) => updateAdjustment("freeUnits", event.target.value)}
                                  />
                                </div>
                                <div className="col-md-4">
                                  <label className="form-label">
                                    <HelpLabel help="Birim miktarı tam sayı değilse nasıl yuvarlanacağını belirler. Yukarı seçeneği eksik kalan parçayı bir üst birime tamamlar; aşağı, alt tam sayıya indirir; en yakın, matematiksel yuvarlama yapar.">
                                      Miktar yuvarlama
                                    </HelpLabel>
                                  </label>
                                  <select
                                    className="form-select"
                                    value={form.adjustment.rounding}
                                    onChange={(event) => updateAdjustment("rounding", event.target.value)}
                                  >
                                    <option value="">Seçiniz</option>
                                    <option value="ceil">Yukarı</option>
                                    <option value="floor">Aşağı</option>
                                    <option value="round">En yakın</option>
                                    <option value="none">Yok</option>
                                  </select>
                                </div>
                                <div className="col-md-4">
                                  <label className="form-label">
                                    <HelpLabel help="Ek koşullardan kaç tanesinin sağlanması gerektiğini belirler. Tüm koşullar seçilirse her koşul doğru olmalıdır; herhangi biri seçilirse koşullardan birinin doğru olması yeterlidir.">
                                      Koşul mantığı
                                    </HelpLabel>
                                  </label>
                                  <select
                                    className="form-select"
                                    value={form.adjustment.conditionsOperator}
                                    onChange={(event) =>
                                      updateAdjustment("conditionsOperator", event.target.value as "all" | "any")
                                    }
                                  >
                                    <option value="all">Tüm koşullar sağlansın</option>
                                    <option value="any">Herhangi biri sağlansın</option>
                                  </select>
                                </div>
                              </>
                            )}

                            <div className="col-12 pricing-rule-section">
                              <div className="d-flex justify-content-between align-items-center mb-2">
                                <h6 className="title mb-0">
                                  <HelpLabel help="Kuralın sadece belirli veriler sağlandığında çalışmasını istiyorsanız ek koşul ekleyin. Örneğin miktar belirli bir sayının üzerindeyse veya belirli bir özellik değeri varsa kural çalışabilir.">
                                    Ek koşullar
                                  </HelpLabel>
                                </h6>
                                <Button color="light" size="sm" type="button" onClick={addCondition}>
                                  <em className="icon ni ni-plus me-1" />
                                  Koşul ekle
                                </Button>
                              </div>
                              <div className="d-flex flex-column gap-2 h-100">
                                {form.adjustment.conditions.map((condition, index) => (
                                  <div className="row g-2 align-items-end" key={index}>
                                    <div className="col-md-5">
                                      <label className="form-label">
                                        <HelpLabel help="Koşulun hangi veri alanına bakacağını seçer. Miktar, kullanıcı sayısı veya fiyat hesaplamasında kullanılan özel bir alan olabilir.">
                                          Koşul alanı
                                        </HelpLabel>
                                      </label>
                                      <select
                                        className="form-select"
                                        value={condition.field}
                                        onChange={(event) => updateCondition(index, "field", event.target.value)}
                                      >
                                        <option value="">Alan seçiniz</option>
                                        {conditionFieldOptions.map((field) => (
                                          <option key={field.value} value={field.value}>
                                            {field.label}
                                          </option>
                                        ))}
                                      </select>
                                    </div>
                                    <div className="col-md-3">
                                      <label className="form-label">
                                        <HelpLabel help="Seçilen alanın beklenen değerle nasıl karşılaştırılacağını belirtir. Eşittir, büyüktür, küçüktür veya içerir gibi operatörler kuralın ne zaman geçerli olacağını belirler.">
                                          Koşul işleci
                                        </HelpLabel>
                                      </label>
                                      <select
                                        className="form-select"
                                        value={condition.operator}
                                        onChange={(event) => updateCondition(index, "operator", event.target.value)}
                                      >
                                        <option value="">Seçiniz</option>
                                        {CONDITION_OPERATORS.map((operator) => (
                                          <option key={operator.value} value={operator.value}>
                                            {operator.label}
                                          </option>
                                        ))}
                                      </select>
                                    </div>
                                    <div className="col-md-3">
                                      <label className="form-label">
                                        <HelpLabel help="Koşul alanının karşılaştırılacağı beklenen değerdir. Örneğin miktar alanı için 10 yazarsanız seçilen karşılaştırma işlemine göre 10 eşiği kullanılır.">
                                          Koşul değeri
                                        </HelpLabel>
                                      </label>
                                      <input
                                        className="form-control"
                                        value={condition.value}
                                        onChange={(event) => updateCondition(index, "value", event.target.value)}
                                        disabled={condition.operator === "exists"}
                                      />
                                    </div>
                                    <div className="col-md-1 text-end">
                                      <Button color="danger" outline size="sm" type="button" onClick={() => removeCondition(index)}>
                                        Sil
                                      </Button>
                                    </div>
                                  </div>
                                ))}
                                {!form.adjustment.conditions.length && (
                                  <p className="text-soft fs-13px mb-0">Ek koşul yok. Üstte seçilen satış planı ve ürün birimi kapsamı kullanılacak.</p>
                                )}
                              </div>
                            </div>

                            {isUnitMode && (
                              <div className="col-12 pricing-rule-section pricing-rule-section--divided">
                                <div className="d-flex justify-content-between align-items-center mb-2">
                                  <h6 className="title mb-0">
                                    <HelpLabel help="Birim bazlı fiyatlandırmada farklı miktar aralıklarına farklı fiyat etkisi tanımlamak için kullanılır. Örneğin 1-10 kullanıcı için bir tutar, 11-50 kullanıcı için farklı bir tutar belirleyebilirsiniz.">
                                      Fiyat kademeleri
                                    </HelpLabel>
                                  </h6>
                                  <Button color="light" size="sm" type="button" onClick={addTier}>
                                    <em className="icon ni ni-plus me-1" />
                                    Kademe ekle
                                  </Button>
                                </div>
                                <div className="table-responsive">
                                  <table className="table table-middle mb-0">
                                    <thead className="table-light">
                                      <tr>
                                        <th>
                                          <HelpLabel help="Bu kademenin hangi miktardan itibaren geçerli olacağını belirtir. Örneğin 1 yazarsanız kademe 1 birimden başlar.">
                                            Aralık başlangıcı
                                          </HelpLabel>
                                        </th>
                                        <th>
                                          <HelpLabel help="Bu kademenin hangi miktara kadar geçerli olacağını belirtir. Boş bırakılırsa üst sınır olmadan devam eden son kademe olarak yorumlanabilir.">
                                            Aralık bitişi
                                          </HelpLabel>
                                        </th>
                                        <th>
                                          <HelpLabel help="Bu kademede fiyat etkisinin yüzde, sabit tutar veya çarpan olarak mı uygulanacağını seçer.">
                                            Kademe türü
                                          </HelpLabel>
                                        </th>
                                        <th>
                                          <HelpLabel help="Kademe türünün sayısal değeridir. Yüzde türünde oran, sabit tutarda para tutarı, çarpanda katsayı olarak kullanılır.">
                                            Kademe değeri
                                          </HelpLabel>
                                        </th>
                                        <th className="text-end">İşlem</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {form.adjustment.tiers.map((tier, index) => (
                                        <tr key={index}>
                                          <td>
                                            <input
                                              className="form-control"
                                              type="number"
                                              value={tier.from}
                                              onChange={(event) => updateTier(index, "from", event.target.value)}
                                            />
                                          </td>
                                          <td>
                                            <input
                                              className="form-control"
                                              type="number"
                                              value={tier.to}
                                              onChange={(event) => updateTier(index, "to", event.target.value)}
                                            />
                                          </td>
                                          <td>
                                            <select
                                              className="form-select"
                                              value={tier.type}
                                              onChange={(event) => updateTier(index, "type", event.target.value)}
                                            >
                                              <option value="">Seçiniz</option>
                                              {ADJUSTMENT_TYPES.map((item) => (
                                                <option key={item.value} value={item.value}>
                                                  {item.label}
                                                </option>
                                              ))}
                                            </select>
                                          </td>
                                          <td>
                                            <input
                                              className="form-control"
                                              type="number"
                                              step="0.0001"
                                              value={tier.value}
                                              onChange={(event) => updateTier(index, "value", event.target.value)}
                                            />
                                          </td>
                                          <td className="text-end">
                                            <Button color="danger" outline size="sm" type="button" onClick={() => removeTier(index)}>
                                              Sil
                                            </Button>
                                          </td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              </div>
                            )}

                            <div className="col-12 pricing-rule-section pricing-rule-section--divided">
                              <h6 className="title mb-2">
                                <HelpLabel help="Limitler, hesaplanan fiyat değişiminin veya son satış fiyatının belirli sınırları aşmasını engeller. Bu alanlar opsiyoneldir; boş bırakılırsa ilgili yönde sınır uygulanmaz.">
                                  Fiyat limitleri
                                </HelpLabel>
                              </h6>
                            </div>
                            <div className="col-md-3">
                              <label className="form-label">
                                <HelpLabel help="Kuralın fiyat üzerinde oluşturabileceği en düşük değişim tutarıdır. Hesaplanan indirim veya artırım bu değerin altına düşerse sistem bu minimum etki sınırını dikkate alır.">
                                  Minimum değişim
                                </HelpLabel>
                              </label>
                              <input
                                className="form-control"
                                type="number"
                                value={form.adjustment.minAdjustment}
                                onChange={(event) => updateAdjustment("minAdjustment", event.target.value)}
                              />
                            </div>
                            <div className="col-md-3">
                              <label className="form-label">
                                <HelpLabel help="Kuralın fiyat üzerinde oluşturabileceği en yüksek değişim tutarıdır. Örneğin yüzde indirim çok büyük bir tutara ulaşıyorsa bu alan indirimin veya artırımın üst sınırını belirler.">
                                  Maksimum değişim
                                </HelpLabel>
                              </label>
                              <input
                                className="form-control"
                                type="number"
                                value={form.adjustment.maxAdjustment}
                                onChange={(event) => updateAdjustment("maxAdjustment", event.target.value)}
                              />
                            </div>
                            <div className="col-md-3">
                              <label className="form-label">
                                <HelpLabel help="Kural uygulandıktan sonra oluşacak son satış fiyatının inebileceği en düşük değerdir. Özellikle indirimlerde fiyatın belirli bir tabanın altına düşmesini engellemek için kullanılır.">
                                  Minimum son fiyat
                                </HelpLabel>
                              </label>
                              <input
                                className="form-control"
                                type="number"
                                value={form.adjustment.minFinalPrice}
                                onChange={(event) => updateAdjustment("minFinalPrice", event.target.value)}
                              />
                            </div>
                            <div className="col-md-3">
                              <label className="form-label">
                                <HelpLabel help="Kural uygulandıktan sonra oluşacak son satış fiyatının çıkabileceği en yüksek değerdir. Artırım veya çarpan kullanılan kurallarda son fiyatı tavan değerle sınırlamak için kullanılır.">
                                  Maksimum son fiyat
                                </HelpLabel>
                              </label>
                              <input
                                className="form-control"
                                type="number"
                                value={form.adjustment.maxFinalPrice}
                                onChange={(event) => updateAdjustment("maxFinalPrice", event.target.value)}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="col-12 d-flex justify-content-end gap-2 h-100">
                    <Button color="light" type="button" onClick={resetForm} disabled={pending}>
                      Kapat
                    </Button>
                    <Button
                      color="primary"
                      type="button"
                      onClick={handleSubmit}
                      disabled={pending}
                    >
                      {pending ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" />
                          Kaydediliyor...
                        </>
                      ) : form.id ? (
                        <>
                          <em className="icon ni ni-save me-1" />
                          Kuralı Güncelle
                        </>
                      ) : (
                        <>
                          <em className="icon ni ni-plus me-1" />
                          Kural Ekle
                        </>
                      )}
                    </Button>
                  </div>
                </div>
          </ModalBody>
        </Modal>
      )}

      <div className="col-12">
        <div className="card card-bordered">
          <div className="card-inner border-bottom py-3 d-flex justify-content-between align-items-center">
            <h6 className="title mb-0">Dinamik Fiyatlandırma Kuralları</h6>
            <div className="d-flex align-items-center gap-2">
              {editable && (
                <Button
                  color="primary"
                  size="sm"
                  type="button"
                  onClick={() => {
                    setForm(emptyForm(lockedLicenseOfferingId, lockedLicenseOfferingTempId));
                    setEngineOpen(false);
                    setFormOpen(true);
                  }}
                >
                  <em className="icon ni ni-plus me-1" />
                  Yeni Kural
                </Button>
              )}
              {isError && (
                <Button color="light" size="sm" type="button" onClick={() => refetch()}>
                  Tekrar Dene
                </Button>
              )}
            </div>
          </div>

          {isLoading ? (
            <div className="card-inner d-flex align-items-center gap-3 py-5">
              <span className="spinner-border spinner-border-sm text-primary" />
              <span>Kurallar yükleniyor...</span>
            </div>
          ) : isError ? (
            <div className="card-inner text-center py-5">
              <em className="icon ni ni-alert-circle fs-1 text-danger d-block mb-3" />
              <p className="text-soft mb-0">Fiyatlandırma kuralları yüklenemedi.</p>
            </div>
          ) : !rules.length ? (
            <div className="card-inner text-center py-5">
              <em className="icon ni ni-coins fs-1 text-soft d-block mb-3" />
              <p className="text-soft mb-0">Bu ürün için dinamik fiyatlandırma kuralı bulunmuyor.</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Kural adı</th>
                    <th>Çalışma sırası</th>
                    <th>Fiyat etkisi</th>
                    <th>Kapsam filtreleri</th>
                    <th>Geçerlilik dönemi</th>
                    <th>Kural durumu</th>
                    {editable && <th className="text-end">İşlem</th>}
                  </tr>
                </thead>
                <tbody>
                  {rules.map((rule) => {
                    const offeringId = rule.productLicenseOfferingId ?? rule.licenseOfferingId ?? "";
                    const variant = rule.productVariantId ? variantById.get(rule.productVariantId) : undefined;
                    const tempOffering = rule.licenseOfferingTempId
                      ? licenseOfferings.find((offering) => offering._tempId === rule.licenseOfferingTempId)
                      : undefined;
                    const offeringLabel = rule.licenseOfferingName
                      ?? tempOffering?.name
                      ?? (offeringId ? offeringById.get(offeringId)?.name ?? offeringId.slice(0, 8) : "");
                    const savedUnitIds = rule.productUnitIds?.length
                      ? rule.productUnitIds
                      : rule.productUnitId
                        ? [rule.productUnitId]
                        : [];
                    const tempUnitIds = rule.productUnitTempIds?.length
                      ? rule.productUnitTempIds
                      : rule.productUnitTempId
                        ? [rule.productUnitTempId]
                        : [];
                    const productUnitLabels = rule.productUnits?.length
                      ? rule.productUnits.map((unit) => unit.name || unit.code).filter(Boolean)
                      : [
                        ...savedUnitIds.map((unitId) => productUnitById.get(unitId)?.name ?? productUnitById.get(unitId)?.code ?? unitId.slice(0, 8)),
                        ...tempUnitIds.map((tempId) => {
                          const unit = productUnits.find((item) => item._tempId === tempId);
                          return unit?.name ?? unit?.code ?? tempId.slice(0, 8);
                        }),
                      ];
                    const productUnitLabel = productUnitLabels.length
                      ? productUnitLabels.join(", ")
                      : rule.productUnitName ?? rule.productUnitCode ?? rule.unitDefinitionName ?? "";
                    const variantLabel = rule.variantName
                      ?? variant?.name
                      ?? variant?.sku
                      ?? (rule.productVariantId ? rule.productVariantId.slice(0, 8) : "");
                    const showOfferingBadge = Boolean(offeringLabel) && !isLocked;
                    const hasFilters = Boolean(showOfferingBadge || productUnitLabel || variantLabel);

                    return (
                      <tr key={rule.id}>
                        <td>
                          <div className="fw-medium">{rule.name}</div>
                          <code className="fs-12">{rule.code}</code>
                        </td>
                        <td>{rule.priority}</td>
                        <td className="fs-13px">{shortJsonSummary(rule)}</td>
                        <td className="fs-12">
                          {showOfferingBadge && <span className="badge bg-outline-primary me-1">{offeringLabel}</span>}
                          {productUnitLabel && <span className="badge bg-outline-success me-1">{productUnitLabel}</span>}
                          {variantLabel && <span className="badge bg-outline-info me-1">{variantLabel}</span>}
                          {!hasFilters && "Tümü"}
                        </td>
                        <td className="fs-12">
                          {rule.validFrom ? new Date(rule.validFrom).toLocaleDateString("tr-TR") : "Başlangıç yok"}
                          {" - "}
                          {rule.validTo ? new Date(rule.validTo).toLocaleDateString("tr-TR") : "Bitiş yok"}
                        </td>
                        <td>
                          <span className={`badge bg-${rule.isActive ? "success" : "secondary"}`}>
                            {rule.isActive ? "Aktif" : "Pasif"}
                          </span>
                        </td>
                        {editable && (
                          <td className="text-end">
                            <div className="d-inline-flex flex-wrap justify-content-end gap-1">
                              <Button
                                color="light"
                                size="sm"
                                type="button"
                                onClick={() => {
                                  const nextForm = ruleToForm(rule);
                                  setForm(nextForm);
                                  setEngineOpen(nextForm.adjustment.mode === "unit");
                                  setFormOpen(true);
                                }}
                              >
                                <em className="icon ni ni-edit me-1" />
                                Düzenle
                              </Button>
                              <Button
                                color="danger"
                                outline
                                size="sm"
                                type="button"
                                onClick={() => setDeleteTarget(rule)}
                              >
                                <em className="icon ni ni-trash" />
                              </Button>
                            </div>
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Kural Silinsin mi?"
        message={`"${deleteTarget?.name ?? ""}" kuralı silinecek.`}
        variant="danger"
        loading={deleteMutation.isPending}
        confirmLabel="Sil"
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
      />
    </div>
  );
};

export default ProductPricingRulesPanel;
