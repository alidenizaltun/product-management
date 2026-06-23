import React, { useId, useMemo, useState } from "react";
import { Button, UncontrolledTooltip } from "reactstrap";
import ConfirmDialog from "@/modules/shared/components/ConfirmDialog";
import { showApiError, showSuccess } from "@/modules/shared/components/NotificationAlert";
import { useProductPricingRuleMutations, useProductPricingRules } from "@/modules/products/hooks/useProductPricingRules";
import type {
  ProductLicenseOfferingDto,
  ProductPricingRuleAdjustmentDto,
  ProductPricingRuleDto,
  ProductVariantDto,
  UpsertProductPricingRuleRequestDto,
} from "@/shared/types/productOperations.types";

interface ProductPricingRulesPanelProps {
  productId?: string;
  licenseOfferings?: ProductLicenseOfferingDto[];
  variants?: ProductVariantDto[];
  editable?: boolean;
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

  if (adjustment.type) result.type = adjustment.type;
  if (adjustment.applyOn) result.applyOn = adjustment.applyOn;

  const value = toNumberOrUndefined(adjustment.value);
  if (value != null) result.value = value;
  if (adjustment.operation) result.operation = adjustment.operation;

  if (adjustment.mode === "unit") {
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
  productVariantId: "",
  adjustment: adjustmentToForm(defaultAdjustment),
});

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
  variants = [],
  editable = false,
}) => {
  const { data, isLoading, isError, refetch } = useProductPricingRules(productId);
  const { createMutation, updateMutation, deleteMutation } = useProductPricingRuleMutations(productId);
  const [form, setForm] = useState<RuleFormState>(() => emptyForm());
  const [deleteTarget, setDeleteTarget] = useState<ProductPricingRuleDto | null>(null);

  const rules = useMemo(
    () => [...(data ?? [])].sort((a, b) => (a.priority ?? 0) - (b.priority ?? 0)),
    [data]
  );
  const offeringById = useMemo(
    () => new Map(licenseOfferings.map((offering) => [offering.id, offering])),
    [licenseOfferings]
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

    return [...fields].map((field) => ({
      value: field,
      label: formatFieldLabel(field),
    }));
  }, [rules, form.adjustment.unitField, form.adjustment.conditions]);

  const resetForm = () => {
    setForm(emptyForm());
  };

  const updateForm = <K extends keyof RuleFormState>(key: K, value: RuleFormState[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
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
      productLicenseOfferingId: form.productLicenseOfferingId || null,
      priceAdjustment,
      priceAdjustmentJson: JSON.stringify(priceAdjustment),
    };
  };

  const handleSubmit = async () => {
    if (!productId) return;

    const payload = buildPayload();

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

    try {
      await deleteMutation.mutateAsync(deleteTarget.id);
      showSuccess("Fiyatlandırma kuralı silindi.");
      setDeleteTarget(null);
    } catch (error) {
      showApiError(error);
    }
  };

  if (!productId) {
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

  return (
    <div className="row g-4">
      {editable && (
        <div className="col-12">
          <div className="card card-bordered">
            <div className="card-inner">
              <div className="d-flex justify-content-between align-items-start gap-3 mb-3">
                <div>
                  <h6 className="title mb-1">{form.id ? "Kuralı Düzenle" : "Yeni Dinamik Kural"}</h6>
                </div>
                {form.id && (
                  <Button color="light" size="sm" type="button" onClick={resetForm}>
                    Vazgeç
                  </Button>
                )}
              </div>

              <div>
                <div className="row g-3">
                  <div className="col-md-4">
                    <label className="form-label">
                      <HelpLabel help="Kuralı sistem içinde ayırt etmek için kullanılan benzersiz kısa koddur.">
                        Kod
                      </HelpLabel>
                    </label>
                    <input
                      className="form-control"
                      value={form.code}
                      onChange={(event) => updateForm("code", event.target.value)}
                    />
                  </div>
                  <div className="col-md-5">
                    <label className="form-label">
                      <HelpLabel help="Kuralın ekranda görünen açıklayıcı adıdır. Kullanıcıların neyi değiştirdiğini anlamasını sağlar.">
                        Ad
                      </HelpLabel>
                    </label>
                    <input
                      className="form-control"
                      value={form.name}
                      onChange={(event) => updateForm("name", event.target.value)}
                    />
                  </div>
                  <div className="col-md-3">
                    <label className="form-label">
                      <HelpLabel help="Birden fazla kural eşleşirse küçük öncelik numarasına sahip kural daha önce uygulanır.">
                        Öncelik
                      </HelpLabel>
                    </label>
                    <input
                      className="form-control"
                      type="number"
                      value={form.priority}
                      onChange={(event) => updateForm("priority", event.target.value)}
                    />
                  </div>

                  <div className="col-md-3">
                    <label className="form-label">
                      <HelpLabel help="Kuralın çalışmaya başlayacağı tarih ve saattir. Boş bırakılırsa başlangıç sınırı uygulanmaz.">
                        Geçerli Başlangıç
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
                      <HelpLabel help="Kuralın geçerliliğinin biteceği tarih ve saattir. Boş bırakılırsa kural süresiz kabul edilir.">
                        Geçerli Bitiş
                      </HelpLabel>
                    </label>
                    <input
                      className="form-control"
                      type="datetime-local"
                      value={form.validTo}
                      onChange={(event) => updateForm("validTo", event.target.value)}
                    />
                  </div>
                  <div className="col-md-3">
                    <label className="form-label">
                      <HelpLabel help="Kuralın sadece belirli bir satış kanalında çalışmasını sağlar.">
                        Satış Kanalı
                      </HelpLabel>
                    </label>
                    <input
                      className="form-control"
                      value={form.salesChannel}
                      onChange={(event) => updateForm("salesChannel", event.target.value)}
                    />
                  </div>
                  <div className="col-md-3">
                    <label className="form-label">
                      <HelpLabel help="Kuralın sadece belirli müşteri grubunda çalışmasını sağlar.">
                        Müşteri Grubu
                      </HelpLabel>
                    </label>
                    <input
                      className="form-control"
                      value={form.customerGroupCode}
                      onChange={(event) => updateForm("customerGroupCode", event.target.value)}
                    />
                  </div>

                  <div className="col-md-4">
                    <label className="form-label">
                      <HelpLabel help="Kuralı belirli bir lisans teklifine bağlar. Tümü seçilirse bu ürünün tüm tekliflerinde geçerli olabilir.">
                        Lisans Fiyatlandırması
                      </HelpLabel>
                    </label>
                    <select
                      className="form-select"
                      value={form.productLicenseOfferingId}
                      onChange={(event) => updateForm("productLicenseOfferingId", event.target.value)}
                    >
                      <option value="">Tümü</option>
                      {licenseOfferings.map((offering) => (
                        <option key={offering.id} value={offering.id}>
                          {offering.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="col-md-4">
                    <label className="form-label">
                      <HelpLabel help="Kuralı belirli bir ürün varyantına bağlar. Tümü seçilirse varyant ayrımı yapılmaz.">
                        Varyant
                      </HelpLabel>
                    </label>
                    <select
                      className="form-select"
                      value={form.productVariantId}
                      onChange={(event) => updateForm("productVariantId", event.target.value)}
                    >
                      <option value="">Tümü</option>
                      {variants.map((variant) => (
                        <option key={variant.id} value={variant.id}>
                          {variant.name || variant.sku}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="col-md-4 d-flex align-items-end">
                    <div className="custom-control custom-switch">
                      <input
                        type="checkbox"
                        className="custom-control-input"
                        id="pricing-rule-active"
                        checked={form.isActive}
                        onChange={(event) => updateForm("isActive", event.target.checked)}
                      />
                      <label className="custom-control-label" htmlFor="pricing-rule-active">
                        <HelpLabel help="Kapalı olduğunda kural kayıtlı kalır ancak fiyat hesaplamasında dikkate alınmaz.">
                          Aktif
                        </HelpLabel>
                      </label>
                    </div>
                  </div>

                  <div className="col-12">
                    <div className="border-top pt-3 mt-1">
                      <h6 className="overline-title text-primary mb-3">
                        <HelpLabel help="Kural eşleştiğinde fiyatın ne kadar ve hangi yöntemle değişeceğini belirleyen ana bölümdür.">
                          Fiyat Etkisi
                        </HelpLabel>
                      </h6>
                      <div className="row g-3">
                        <div className="col-md-3">
                          <label className="form-label">
                            <HelpLabel help="Tekil mod tek seferlik indirim/artış uygular. Birim bazlı mod, kullanıcı sayısı gibi bir değere göre hesaplar.">
                              Hesaplama Modu
                            </HelpLabel>
                          </label>
                          <select
                            className="form-select"
                            value={form.adjustment.mode}
                            onChange={(event) => updateAdjustment("mode", event.target.value)}
                          >
                            <option value="">Seçiniz</option>
                            <option value="unit">Birim Bazlı</option>
                          </select>
                        </div>
                        <div className="col-md-3">
                          <label className="form-label">
                            <HelpLabel help="Fiyat etkisinin nasıl hesaplanacağını belirler: sabit tutar, yüzde, çarpan veya özel hesaplama.">
                              Tip
                            </HelpLabel>
                          </label>
                          <select
                            className="form-select"
                            value={form.adjustment.type}
                            onChange={(event) => updateAdjustment("type", event.target.value)}
                          >
                            <option value="">Seçiniz</option>
                            {ADJUSTMENT_TYPES.map((item) => (
                              <option key={item.value} value={item.value}>
                                {item.label}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="col-md-2">
                          <label className="form-label">
                            <HelpLabel help="Seçilen tipe göre uygulanacak tutar, yüzde veya çarpan değeridir.">
                              Değer
                            </HelpLabel>
                          </label>
                          <input
                            className="form-control"
                            type="number"
                            step="0.0001"
                            value={form.adjustment.value}
                            onChange={(event) => updateAdjustment("value", event.target.value)}
                          />
                        </div>
                        <div className="col-md-2">
                          <label className="form-label">
                            <HelpLabel help="Ekle fiyatı artırır. Çıkar seçilirse hesaplanan etki fiyattan düşülür.">
                              Yön
                            </HelpLabel>
                          </label>
                          <select
                            className="form-select"
                            value={form.adjustment.operation}
                            onChange={(event) => updateAdjustment("operation", event.target.value)}
                          >
                            <option value="">Seçiniz</option>
                            <option value="subtract">Çıkar</option>
                          </select>
                        </div>
                        <div className="col-md-2">
                          <label className="form-label">
                            <HelpLabel help="Kuralın hangi fiyat üzerinden hesaplanacağını seçer: taban fiyat, güncel fiyat veya önceki kural sonucu.">
                              Uygula
                            </HelpLabel>
                          </label>
                          <select
                            className="form-select"
                            value={form.adjustment.applyOn}
                            onChange={(event) => updateAdjustment("applyOn", event.target.value)}
                          >
                            <option value="">Seçiniz</option>
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

                  {form.adjustment.mode === "unit" && (
                    <div className="col-12">
                      <div className="border-top pt-3">
                        <h6 className="overline-title text-primary mb-3">
                          <HelpLabel help="Kullanıcı sayısı gibi miktara bağlı fiyatları tanımlamak için kullanılır. Her satır bir aralığı temsil eder.">
                            Birim ve Kademeler
                          </HelpLabel>
                        </h6>
                        <div className="row g-3 mb-3">
                          <div className="col-md-5">
                            <label className="form-label">
                              <HelpLabel help="Hesaplamada kullanılacak dinamik alan adıdır.">
                                Birim Alanı
                              </HelpLabel>
                            </label>
                            <input
                              className="form-control"
                              value={form.adjustment.unitField}
                              onChange={(event) => updateAdjustment("unitField", event.target.value)}
                            />
                          </div>
                          <div className="col-md-3">
                            <label className="form-label">
                              <HelpLabel help="Kademe tanımlı değilse bu sayıya kadar olan birimler ücretlendirilmez. Kademeler varsa kademeler esas alınır.">
                                Ücretsiz Birim
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
                              <HelpLabel help="Birim değeri küsuratlı gelirse nasıl yuvarlanacağını belirler. Kullanıcı sayısı gibi alanlarda genelde Yukarı seçilir.">
                                Yuvarlama
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
                              <option value="round">En Yakın</option>
                              <option value="none">Yok</option>
                            </select>
                          </div>
                        </div>

                        <div className="table-responsive">
                          <table className="table table-middle mb-2">
                            <thead className="table-light">
                              <tr>
                                <th>
                                  <HelpLabel help="Bu kademe için birim aralığının başladığı değerdir.">
                                    Başlangıç
                                  </HelpLabel>
                                </th>
                                <th>
                                  <HelpLabel help="Bu kademe için aralığın bittiği değerdir. Boş bırakılırsa üst sınır yoktur.">
                                    Bitiş
                                  </HelpLabel>
                                </th>
                                <th>
                                  <HelpLabel help="Bu kademede uygulanacak hesaplama tipidir. Genelde sabit tutar veya yüzde kullanılır.">
                                    Tip
                                  </HelpLabel>
                                </th>
                                <th>
                                  <HelpLabel help="Bu kademe eşleştiğinde uygulanacak tutar, yüzde veya çarpan değeridir.">
                                    Değer
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
                        <Button color="light" size="sm" type="button" onClick={addTier}>
                          <em className="icon ni ni-plus me-1" />
                          Kademe Ekle
                        </Button>
                      </div>
                    </div>
                  )}

                  <div className="col-12">
                    <div className="border-top pt-3">
                      <h6 className="overline-title text-primary mb-3">
                        <HelpLabel help="Kuralın üreteceği fiyat etkisini veya nihai fiyatı alt ve üst sınırlarla kontrol eder.">
                          Limitler
                        </HelpLabel>
                      </h6>
                      <div className="row g-3">
                        <div className="col-md-3">
                          <label className="form-label">
                            <HelpLabel help="Kuralın oluşturabileceği en düşük fiyat etkisidir. Boş bırakılırsa alt sınır uygulanmaz.">
                              Min. Etki
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
                            <HelpLabel help="Kuralın oluşturabileceği en yüksek fiyat etkisidir. Çok büyük indirim/artışları sınırlamak için kullanılır.">
                              Maks. Etki
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
                            <HelpLabel help="Kural uygulandıktan sonra fiyatın inebileceği en düşük nihai tutardır.">
                              Min. Final
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
                            <HelpLabel help="Kural uygulandıktan sonra fiyatın çıkabileceği en yüksek nihai tutardır.">
                              Maks. Final
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

                  <div className="col-12">
                    <div className="border-top pt-3">
                      <div className="d-flex justify-content-between align-items-center mb-3">
                        <h6 className="overline-title text-primary mb-0">
                          <HelpLabel help="Kuralın çalışması için sağlanması gereken şartlardır. Koşul yoksa kural diğer filtreler eşleştiğinde çalışır.">
                            Koşullar
                          </HelpLabel>
                        </h6>
                        <div className="d-flex gap-2 align-items-center h-100">
                          <select
                            className="form-select form-select-sm"
                            value={form.adjustment.conditionsOperator}
                            onChange={(event) =>
                              updateAdjustment("conditionsOperator", event.target.value as "all" | "any")
                            }
                          >
                            <option value="all">Tüm koşullar sağlansın</option>
                            <option value="any">Herhangi biri sağlansın</option>
                          </select>
                          <Button color="light" size="sm" type="button" className="w-100" onClick={addCondition}>
                            <em className="icon ni ni-plus me-1 " />
                            Koşul Ekle
                          </Button>
                        </div>
                      </div>

                      <div className="d-flex flex-column gap-2 h-100">
                        {form.adjustment.conditions.map((condition, index) => (
                          <div className="row g-2 align-items-end" key={index}>
                            <div className="col-md-5">
                              <label className="form-label">
                                <HelpLabel help="Mevcut dinamik fiyatlandırma kurallarında kullanılan alanlardan seçilir.">
                                  Alan
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
                                <HelpLabel help="Alan ile değer arasındaki karşılaştırma türüdür.">
                                  Operatör
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
                                <HelpLabel help="Karşılaştırılacak değerdir. Listeden biri operatöründe virgülle ayırın; Değer var operatöründe boş kalır.">
                                  Değer
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
                      </div>
                    </div>
                  </div>

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
                    const offeringLabel = rule.licenseOfferingName
                      ?? (offeringId ? offeringById.get(offeringId)?.name ?? offeringId.slice(0, 8) : "");
                    const variantLabel = rule.variantName
                      ?? variant?.name
                      ?? variant?.sku
                      ?? (rule.productVariantId ? rule.productVariantId.slice(0, 8) : "");
                    const hasFilters = Boolean(
                      offeringLabel || variantLabel || rule.salesChannel || rule.customerGroupCode
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
