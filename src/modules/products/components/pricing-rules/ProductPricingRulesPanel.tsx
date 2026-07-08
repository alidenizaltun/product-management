import React, { useId, useMemo, useState } from "react";
import { Button, UncontrolledTooltip } from "reactstrap";
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
}

interface RuleFormState {
  id?: string;
  code: string;
  name: string;
  priority: string;
  isActive: boolean;
  validFrom: string;
  validTo: string;
  salesChannel: string;
  customerGroupCode: string;
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
  { value: "customerGroupCode", label: "Müşteri grubu" },
  { value: "salesChannel", label: "Satış kanalı" },
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
    result.mode = "unit";
    result.unit = {
      field: adjustment.unitField.trim(),
      freeUnits: toNumberOrNull(adjustment.freeUnits),
      rounding: adjustment.rounding,
    };
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

const emptyForm = (): RuleFormState => ({
  code: "",
  name: "",
  priority: "",
  isActive: true,
  validFrom: "",
  validTo: "",
  salesChannel: "",
  customerGroupCode: "",
  productLicenseOfferingId: "",
  licenseOfferingTempId: "",
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

const QUICK_RULE_TEMPLATES = [
  {
    title: "Bayi indirimi",
    description: "Bayi grubuna yüzde indirim uygula.",
    icon: "users",
    color: "primary",
    form: {
      name: "Bayi indirimi",
      customerGroupCode: "dealer",
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
        unitField: "seats",
        rounding: "ceil",
        tiers: [{ from: "1", to: "", type: "fixed", value: "0" }],
      },
    },
  },
  {
    title: "Kanal özel fiyatı",
    description: "Sadece web, mobil veya POS kanalında çalıştır.",
    icon: "globe",
    color: "warning",
    form: {
      name: "Kanal özel fiyatı",
      salesChannel: "web",
      adjustment: {
        type: "fixed",
        value: "0",
        operation: "",
        applyOn: "currentPrice",
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
  salesChannel: rule.salesChannel ?? "",
  customerGroupCode: rule.customerGroupCode ?? "",
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
}) => {
  const { data, isLoading, isError, refetch } = useProductPricingRules(productId);
  const { createMutation, updateMutation, deleteMutation } = useProductPricingRuleMutations(productId);
  const [form, setForm] = useState<RuleFormState>(() => emptyForm());
  const [deleteTarget, setDeleteTarget] = useState<ProductPricingRuleDto | null>(null);
  const [engineOpen, setEngineOpen] = useState(false);

  const rules = useMemo(
    () => [...(productId ? data ?? [] : draftRules ?? [])].sort((a, b) => (a.priority ?? 0) - (b.priority ?? 0)),
    [data, draftRules, productId]
  );
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
    rules.forEach((rule) => collectAdjustmentFields(getAdjustment(rule), fields));
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
  }, [rules, form.adjustment.unitField, form.adjustment.conditions]);

  const resetForm = () => {
    setForm(emptyForm());
    setEngineOpen(false);
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
    setForm((current) => ({
      ...current,
      name: template.form.name,
      code: slugifyRuleCode(template.form.name),
      salesChannel: template.form.salesChannel ?? "",
      customerGroupCode: template.form.customerGroupCode ?? "",
      priority: current.priority || String((rules.length + 1) * 10),
      adjustment: {
        ...current.adjustment,
        ...template.form.adjustment,
        conditions: [],
      },
    }));
    setEngineOpen(false);
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
    const productUnitIds = (form.productUnitIds.length ? form.productUnitIds : form.productUnitId ? [form.productUnitId] : [])
      .filter(Boolean);
    const productUnitTempIds = (form.productUnitTempIds.length
      ? form.productUnitTempIds
      : form.productUnitTempId
        ? [form.productUnitTempId]
        : [])
      .filter(Boolean);

    return {
      code: form.code.trim(),
      name: form.name.trim(),
      priority: Number(form.priority || 0),
      isActive: Boolean(form.isActive),
      validFrom: fromDateTimeInput(form.validFrom),
      validTo: fromDateTimeInput(form.validTo),
      salesChannel: form.salesChannel.trim() || null,
      customerGroupCode: form.customerGroupCode.trim() || null,
      productVariantId: form.productVariantId || null,
      productUnitId: productUnitIds[0] || null,
      productUnitTempId: productUnitIds.length === 0 ? productUnitTempIds[0] || null : null,
      productUnitIds: productUnitIds.length ? productUnitIds : undefined,
      productUnitTempIds: productUnitTempIds.length ? productUnitTempIds : undefined,
      productLicenseOfferingId: form.productLicenseOfferingId || null,
      licenseOfferingTempId: form.licenseOfferingTempId || null,
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

  const pending = createMutation.isPending || updateMutation.isPending;
  const isUnitMode = form.adjustment.mode === "unit";
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
      const value = unit.id ? `id:${unit.id}` : `temp:${unit._tempId}`;
      return selectedOfferingUnitValues.includes(value);
    })
    : productUnits;

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

    setForm((current) => ({
      ...current,
      ...nextScope,
      productUnitId: "",
      productUnitTempId: "",
      productUnitIds: [],
      productUnitTempIds: [],
    }));
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
        <div className="col-12">
          <div className="card card-bordered">
            <div className="card-inner">
              <div className="d-flex flex-wrap justify-content-between align-items-start gap-3 mb-3 h-100">
                <div>
                  <span className="overline-title text-primary">Kural oluşturucu</span>
                  <h6 className="title mb-1">{form.id ? "Kuralı Düzenle" : "Yeni Dinamik Kural"}</h6>
                  <p className="text-soft fs-13px mb-0">
                    Şablon seçin veya cümleyi doldurun: Eğer bir durum oluşursa fiyatı değiştir.
                  </p>
                </div>
                {form.id && (
                  <Button color="light" size="sm" type="button" onClick={resetForm}>
                    Vazgeç
                  </Button>
                )}
              </div>

              {!form.id && (
                <div className="row g-3 mb-4">
                  {QUICK_RULE_TEMPLATES.map((template) => (
                    <div className="col-sm-6 col-xl-3" key={template.title}>
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
                      <div className="col-md-4">
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
                      <div className="col-md-4">
                        <label className="form-label">
                          <HelpLabel help="Birim seçimi, kuralın hangi fiyatlandırma parametrelerine uygulanacağını belirler. Plan seçtiyseniz yalnızca o plana bağlı birimler görünür; tüm planlar seçiliyse tüm birimler seçilebilir.">
                            Ürün birimi
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
                          {selectableProductUnits.filter((unit) => unit.isActive && (unit.id || unit._tempId)).map((unit) => {
                            const value = unit.id ? `id:${unit.id}` : `temp:${unit._tempId}`;
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
                                  {unit.name} ({unit.code}){!unit.id ? " (kaydedilecek)" : ""}
                                </label>
                              </div>
                            );
                          })}
                          {selectableProductUnits.filter((unit) => unit.isActive && (unit.id || unit._tempId)).length === 0 && (
                            <span className="text-soft fs-12px">
                              {selectedOffering ? "Seçili plana bağlı birim yok." : "Tanımlı ürün birimi yok."}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="col-md-4">
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
                      </div>
                    </div>
                  </div>
                </div>

                <div className="col-lg-6">
                  <label className="form-label">
                    Kural adı <span className="text-danger">*</span>
                  </label>
                  <input
                    className="form-control form-control-lg"
                    placeholder="Örn. Bayi indirimi"
                    value={form.name}
                    onChange={(event) => updateRuleName(event.target.value)}
                  />
                </div>
                <div className="col-lg-3 col-md-6">
                  <label className="form-label">Nerede çalışsın?</label>
                  <input
                    className="form-control form-control-lg"
                    placeholder="Tüm kanallar"
                    value={form.salesChannel}
                    onChange={(event) => updateForm("salesChannel", event.target.value)}
                  />
                </div>
                <div className="col-lg-3 col-md-6">
                  <label className="form-label">Kimlere çalışsın?</label>
                  <input
                    className="form-control form-control-lg"
                    placeholder="Tüm müşteriler"
                    value={form.customerGroupCode}
                    onChange={(event) => updateForm("customerGroupCode", event.target.value)}
                  />
                </div>

                <div className="col-12">
                  <div className="card card-bordered bg-lighter mb-0">
                    <div className="card-inner">
                      <div className="row g-3 align-items-end">
                        <div className="col-12">
                          <span className="overline-title text-primary">O halde</span>
                        </div>
                        <div className="col-md-3">
                          <label className="form-label">Fiyatı</label>
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
                          <label className="form-label">Nasıl?</label>
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
                          <label className="form-label">Değer</label>
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
                          <label className="form-label">Hesapla</label>
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
                  <label className="form-label">Başlangıç</label>
                  <input
                    className="form-control"
                    type="datetime-local"
                    value={form.validFrom}
                    onChange={(event) => updateForm("validFrom", event.target.value)}
                  />
                </div>
                <div className="col-md-3">
                  <label className="form-label">Bitiş</label>
                  <input
                    className="form-control"
                    type="datetime-local"
                    value={form.validTo}
                    onChange={(event) => updateForm("validTo", event.target.value)}
                  />
                </div>
                <div className="col-md-2 d-flex align-items-end">
                  <div className="custom-control custom-switch">
                    <input
                      type="checkbox"
                      className="custom-control-input"
                      id="pricing-rule-active"
                      checked={form.isActive}
                      onChange={(event) => updateForm("isActive", event.target.checked)}
                    />
                    <label className="custom-control-label" htmlFor="pricing-rule-active">
                      Aktif
                    </label>
                  </div>
                </div>
                <div className="col-md-4 d-flex align-items-end">
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
                        <h6 className="overline-title text-primary mb-3">Gelişmiş motor ayarları</h6>

                        <div className="row g-3">
                          <div className="col-md-4">
                            <label className="form-label">Kural kodu</label>
                            <input
                              className="form-control"
                              value={form.code}
                              onChange={(event) => updateForm("code", event.target.value)}
                            />
                          </div>
                          <div className="col-md-2">
                            <label className="form-label">Öncelik</label>
                            <input
                              className="form-control"
                              type="number"
                              value={form.priority}
                              onChange={(event) => updateForm("priority", event.target.value)}
                            />
                          </div>
                          <div className="col-md-3">
                            <label className="form-label">Hesaplama</label>
                            <select
                              className="form-select"
                              value={form.adjustment.mode}
                              onChange={(event) => updateAdjustment("mode", event.target.value)}
                            >
                              <option value="">Sabit / tekil</option>
                              <option value="unit">Birim bazlı</option>
                            </select>
                          </div>
                          <div className="col-md-3">
                            <label className="form-label">Koşul mantığı</label>
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

                          {isUnitMode && (
                            <>
                              <div className="col-md-4">
                                <label className="form-label">Birim alanı</label>
                                <input
                                  className="form-control"
                                  value={form.adjustment.unitField}
                                  onChange={(event) => updateAdjustment("unitField", event.target.value)}
                                />
                              </div>
                              <div className="col-md-4">
                                <label className="form-label">Ücretsiz birim</label>
                                <input
                                  className="form-control"
                                  type="number"
                                  value={form.adjustment.freeUnits}
                                  onChange={(event) => updateAdjustment("freeUnits", event.target.value)}
                                />
                              </div>
                              <div className="col-md-4">
                                <label className="form-label">Yuvarlama</label>
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
                            </>
                          )}

                          <div className="col-12">
                            <div className="d-flex justify-content-between align-items-center mb-2">
                              <h6 className="title mb-0">Ek koşullar</h6>
                              <Button color="light" size="sm" type="button" onClick={addCondition}>
                                <em className="icon ni ni-plus me-1" />
                                Koşul ekle
                              </Button>
                            </div>
                            <div className="d-flex flex-column gap-2 h-100">
                              {form.adjustment.conditions.map((condition, index) => (
                                <div className="row g-2 align-items-end" key={index}>
                                  <div className="col-md-5">
                                    <label className="form-label">Alan</label>
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
                                    <label className="form-label">Karşılaştırma</label>
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
                                    <label className="form-label">Değer</label>
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
                                <p className="text-soft fs-13px mb-0">Ek koşul yok. Üstte seçilen kanal, müşteri grubu, plan ve varyant filtreleri kullanılacak.</p>
                              )}
                            </div>
                          </div>

                          {isUnitMode && (
                            <div className="col-12">
                              <div className="d-flex justify-content-between align-items-center mb-2">
                                <h6 className="title mb-0">Kademeler</h6>
                                <Button color="light" size="sm" type="button" onClick={addTier}>
                                  <em className="icon ni ni-plus me-1" />
                                  Kademe ekle
                                </Button>
                              </div>
                              <div className="table-responsive">
                                <table className="table table-middle mb-0">
                                  <thead className="table-light">
                                    <tr>
                                      <th>Başlangıç</th>
                                      <th>Bitiş</th>
                                      <th>Tip</th>
                                      <th>Değer</th>
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

                          <div className="col-12">
                            <h6 className="title mb-2">Limitler</h6>
                          </div>
                          <div className="col-md-3">
                            <label className="form-label">Min. etki</label>
                            <input
                              className="form-control"
                              type="number"
                              value={form.adjustment.minAdjustment}
                              onChange={(event) => updateAdjustment("minAdjustment", event.target.value)}
                            />
                          </div>
                          <div className="col-md-3">
                            <label className="form-label">Maks. etki</label>
                            <input
                              className="form-control"
                              type="number"
                              value={form.adjustment.maxAdjustment}
                              onChange={(event) => updateAdjustment("maxAdjustment", event.target.value)}
                            />
                          </div>
                          <div className="col-md-3">
                            <label className="form-label">Min. final</label>
                            <input
                              className="form-control"
                              type="number"
                              value={form.adjustment.minFinalPrice}
                              onChange={(event) => updateAdjustment("minFinalPrice", event.target.value)}
                            />
                          </div>
                          <div className="col-md-3">
                            <label className="form-label">Maks. final</label>
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
                    Temizle
                  </Button>
                  <Button
                    color="primary"
                    type="button"
                    onClick={handleSubmit}
                    disabled={pending || !form.code.trim() || !form.name.trim()}
                  >
                    {pending ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" />
                        Kaydediliyor...
                      </>
                    ) : form.id ? (
                      "Güncelle"
                    ) : (
                      "Kural Ekle"
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="col-12">
        <div className="card card-bordered">
          <div className="card-inner border-bottom py-3 d-flex justify-content-between align-items-center">
            <h6 className="title mb-0">Dinamik Fiyatlandırma Kuralları</h6>
            {isError && (
              <Button color="light" size="sm" type="button" onClick={() => refetch()}>
                Tekrar Dene
              </Button>
            )}
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
                    <th>Kural</th>
                    <th>Öncelik</th>
                    <th>Adjustment</th>
                    <th>Filtreler</th>
                    <th>Geçerlilik</th>
                    <th>Durum</th>
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
                    const hasFilters = Boolean(
                      offeringLabel || productUnitLabel || variantLabel || rule.salesChannel || rule.customerGroupCode
                    );

                    return (
                      <tr key={rule.id}>
                        <td>
                          <div className="fw-medium">{rule.name}</div>
                          <code className="fs-12">{rule.code}</code>
                        </td>
                        <td>{rule.priority}</td>
                        <td className="fs-13px">{shortJsonSummary(rule)}</td>
                        <td className="fs-12">
                          {offeringLabel && <span className="badge bg-outline-primary me-1">{offeringLabel}</span>}
                          {productUnitLabel && <span className="badge bg-outline-success me-1">{productUnitLabel}</span>}
                          {variantLabel && <span className="badge bg-outline-info me-1">{variantLabel}</span>}
                          {rule.salesChannel && <span className="badge bg-outline-secondary me-1">{rule.salesChannel}</span>}
                          {rule.customerGroupCode && <span className="badge bg-outline-warning me-1">{rule.customerGroupCode}</span>}
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
                            <Button
                              color="light"
                              size="sm"
                              type="button"
                              className="me-1"
                              onClick={() => {
                                setForm(ruleToForm(rule));
                              }}
                            >
                              Düzenle
                            </Button>
                            <Button
                              color="danger"
                              outline
                              size="sm"
                              type="button"
                              onClick={() => setDeleteTarget(rule)}
                            >
                              Sil
                            </Button>
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
