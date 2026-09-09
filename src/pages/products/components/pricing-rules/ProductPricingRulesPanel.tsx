import React, { useMemo, useState } from "react";
import { Button } from "reactstrap";
import { FormModal } from "@/components/shared/FormModal";
import { DndContext, KeyboardSensor, PointerSensor, closestCenter, useSensor, useSensors } from "@dnd-kit/core";
import type { DragEndEvent } from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import ConfirmDialog from "@/components/shared/ConfirmDialog";
import HelpLabel from "@/pages/pricing/adjustment/HelpLabel";
import PricingAdjustmentFields from "@/pages/pricing/adjustment/PricingAdjustmentFields";
import { showApiError, showSuccess, showWarning } from "@/components/shared/NotificationAlert";
import { useProductPricingRuleMutations, useProductPricingRules } from "@/application/hooks/useProductPricingRules";
import UnitQuickAddModal from "@/pages/products/components/pricing/UnitQuickAddModal";
import {
  ApplyTemplateModal,
  SaveAsTemplateModal,
  TemplateOriginBadge,
} from "@/pages/products/components/pricing/PricingTemplateActions";
import {
  adjustmentToForm,
  collectAdjustmentFields,
  defaultAdjustment,
  formToAdjustment,
  formatFieldLabel,
  getAdjustment,
} from "@/pages/pricing/adjustment/adjustmentForm";
import type { AdjustmentFormState } from "@/pages/pricing/adjustment/adjustmentForm";
import type {
  ProductLicenseOfferingDto,
  ProductPricingRuleDto,
  ProductUnitDto,
  ProductVariantDto,
  UnitDefinitionDto,
  UpsertProductPricingRuleRequestDto,
} from "@/domain/types/productOperations.types";

type ScopedLicenseOfferingOption = ProductLicenseOfferingDto & { _tempId?: string };
type ScopedProductUnitOption = ProductUnitDto & { _tempId?: string };

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
  /** Verilirse birim seçimi adımında yeni evrensel birim oluşturma butonu gösterilir. */
  onCreateProductUnit?: (definition: UnitDefinitionDto) => Promise<{ productUnitId: string; reused: boolean; isTemp: boolean }>;
  /** Verilirse ürüne atanmış birimler için "Komple Kaldır" butonu gösterilir (ürün-birim bağlantısı tamamen kaldırılır, evrensel birim silinmez). */
  onRemoveProductUnit?: (unit: ScopedProductUnitOption) => Promise<void>;
  /** Bir birim bu plana (kilitli satış planına) atandığında çağrılır: örn. birim bir kurala eklendiğinde veya yeni oluşturulduğunda. */
  onAssignProductUnitToPlan?: (unit: { id?: string; _tempId?: string }) => Promise<void>;
  /** Verilirse birimi sadece bu plandan kaldırma seçeneği gösterilir (ürün ve diğer planlarda kalmaya devam eder). */
  onRemoveProductUnitFromPlan?: (unit: ScopedProductUnitOption) => Promise<void>;
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


const getProductUnitScopeValue = (unit: ScopedProductUnitOption) =>
  unit.id ? `id:${unit.id}` : unit._tempId ? `temp:${unit._tempId}` : "";

const getProductUnitLabel = (unit: ScopedProductUnitOption) =>
  unit.name?.trim() || unit.code?.trim() || unit.unitDefinitionName?.trim() || "Adsız birim";



const emptyForm = (lockedOfferingId?: string, lockedOfferingTempId?: string, defaultPriority?: number): RuleFormState => ({
  code: "",
  name: "",
  priority: defaultPriority != null ? String(defaultPriority) : "",
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
  const adjustment = getAdjustment(rule);
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

type SortableHandleProps = {
  attributes: ReturnType<typeof useSortable>["attributes"];
  listeners: ReturnType<typeof useSortable>["listeners"];
};

const SortableRuleRow: React.FC<{
  id: string;
  children: (dragHandleProps: SortableHandleProps) => React.ReactNode;
}> = ({ id, children }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });

  return (
    <div
      ref={setNodeRef}
      className={`pricing-sortable-item ${isDragging ? "is-dragging" : ""}`}
      style={{ transform: CSS.Transform.toString(transform), transition }}
    >
      {children({ attributes, listeners })}
    </div>
  );
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
  onCreateProductUnit,
  onRemoveProductUnit,
  onAssignProductUnitToPlan,
  onRemoveProductUnitFromPlan,
}) => {
  const { data, isLoading, isError, refetch } = useProductPricingRules(productId);
  const { createMutation, updateMutation, deleteMutation, reorderMutation } = useProductPricingRuleMutations(productId);
  const isLocked = Boolean(lockedLicenseOfferingId || lockedLicenseOfferingTempId);
  const [form, setForm] = useState<RuleFormState>(() => emptyForm(lockedLicenseOfferingId, lockedLicenseOfferingTempId));
  const [deleteTarget, setDeleteTarget] = useState<ProductPricingRuleDto | null>(null);
  const [engineOpen, setEngineOpen] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [unitModalOpen, setUnitModalOpen] = useState(false);
  const [applyTemplateOpen, setApplyTemplateOpen] = useState(false);
  const [templateSourceRule, setTemplateSourceRule] = useState<ProductPricingRuleDto | undefined>();
  const [addingUnit, setAddingUnit] = useState(false);
  const [removeUnitTarget, setRemoveUnitTarget] = useState<{ unit: ScopedProductUnitOption; mode: "product" | "plan" } | null>(null);
  const [removingUnit, setRemovingUnit] = useState(false);
  const dragSensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

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
  const lockedOffering = useMemo(() => {
    if (!isLocked) return undefined;
    return licenseOfferings.find((offering) => {
      if (lockedLicenseOfferingId && offering.id === lockedLicenseOfferingId) return true;
      if (lockedLicenseOfferingTempId && offering._tempId === lockedLicenseOfferingTempId) return true;
      return false;
    });
  }, [isLocked, licenseOfferings, lockedLicenseOfferingId, lockedLicenseOfferingTempId]);
  const lockedOfferingUnitIds = useMemo(() => new Set(lockedOffering?.productUnitIds ?? []), [lockedOffering]);
  const lockedOfferingUnitTempIds = useMemo(() => new Set(lockedOffering?.productUnitTempIds ?? []), [lockedOffering]);
  const productUnitById = useMemo(
    () => new Map(productUnits.map((unit) => [unit.id, unit])),
    [productUnits]
  );
  const variantById = useMemo(
    () => new Map(variants.map((variant) => [variant.id, variant])),
    [variants]
  );
  const unitsByDefinitionId = useMemo(() => {
    const map = new Map<string, ScopedProductUnitOption>();
    productUnits.forEach((unit) => {
      if (unit.unitDefinitionId && !map.has(unit.unitDefinitionId)) map.set(unit.unitDefinitionId, unit);
    });
    return map;
  }, [productUnits]);
  const formatConditionFieldLabel = (field: string) => {
    if (field.startsWith("unit.")) {
      const unit = unitsByDefinitionId.get(field.replace("unit.", ""));
      if (unit) return getProductUnitLabel(unit);
    }
    return formatFieldLabel(field);
  };

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

  const updateAdjustment = (adjustment: AdjustmentFormState) => {
    setForm((current) => ({ ...current, adjustment }));
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

  const handleUnitCreated = async (definition: UnitDefinitionDto) => {
    if (!onCreateProductUnit) return;

    try {
      setAddingUnit(true);
      const { productUnitId, isTemp, reused } = await onCreateProductUnit(definition);
      updateProductUnitScope(isTemp ? `temp:${productUnitId}` : `id:${productUnitId}`, true);
      await onAssignProductUnitToPlan?.(isTemp ? { _tempId: productUnitId } : { id: productUnitId });
      showSuccess(
        reused
          ? `"${definition.name}" birimi bu plana da eklendi.`
          : `"${definition.name}" birimi ürüne eklendi.`
      );
      setUnitModalOpen(false);
    } catch (error) {
      showApiError(error);
    } finally {
      setAddingUnit(false);
    }
  };

  const isUnitUsedInOtherPlan = (unit: ScopedProductUnitOption) =>
    allRules.some((rule) => {
      const ids = mapProductUnitIds(rule);
      const tempIds = rule.productUnitTempIds ?? (rule.productUnitTempId ? [rule.productUnitTempId] : []);
      const usesUnit = unit.id ? ids.includes(unit.id) : unit._tempId ? tempIds.includes(unit._tempId) : false;
      if (!usesUnit) return false;

      const ruleOfferingId = rule.productLicenseOfferingId ?? rule.licenseOfferingId ?? "";
      const ruleOfferingTempId = rule.licenseOfferingTempId ?? "";
      const isCurrentPlan =
        (Boolean(lockedLicenseOfferingId) && ruleOfferingId === lockedLicenseOfferingId) ||
        (Boolean(lockedLicenseOfferingTempId) && ruleOfferingTempId === lockedLicenseOfferingTempId);

      return !isCurrentPlan;
    });

  const handleRequestRemoveUnit = (unit: ScopedProductUnitOption, mode: "product" | "plan") => {
    if (mode === "product" && !onRemoveProductUnit) return;
    if (mode === "plan" && !onRemoveProductUnitFromPlan) return;
    setRemoveUnitTarget({ unit, mode });
  };

  const handleConfirmRemoveUnit = async () => {
    if (!removeUnitTarget) return;
    const { unit, mode } = removeUnitTarget;

    try {
      setRemovingUnit(true);
      if (mode === "product" && onRemoveProductUnit) {
        await onRemoveProductUnit(unit);
        showSuccess("Birim üründen kaldırıldı.");
      } else if (mode === "plan" && onRemoveProductUnitFromPlan) {
        await onRemoveProductUnitFromPlan(unit);
        showSuccess("Birim bu plandan kaldırıldı.");
      }
      setRemoveUnitTarget(null);
    } catch (error) {
      showApiError(error);
    } finally {
      setRemovingUnit(false);
    }
  };

  const handleRuleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id || !productId) return;

    const oldIndex = rules.findIndex((rule) => rule.id === active.id);
    const newIndex = rules.findIndex((rule) => rule.id === over.id);
    if (oldIndex < 0 || newIndex < 0) return;

    const reordered = arrayMove(rules, oldIndex, newIndex);
    reorderMutation.mutate(reordered.map((rule) => rule.id));
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
  // Ürün birimleri ürün seviyesindedir: bir plana eklenen birim aynı ürünün bütün
  // planlarında doğrudan listelenir. Planın kendi productUnitIds listesi birimi
  // gizlemez, sadece o planda fiilen kullanılıp kullanılmadığını gösterir.
  const activeSelectableProductUnits = productUnits.filter(
    (unit) => unit.isActive && Boolean(unit.id || unit._tempId)
  );
  const isUnitAssignedToPlan = (unit: ScopedProductUnitOption) => {
    if (!isLocked) return true;
    return Boolean(
      (unit.id && lockedOfferingUnitIds.has(unit.id)) ||
      (unit._tempId && lockedOfferingUnitTempIds.has(unit._tempId))
    );
  };
  const availableProductUnits = activeSelectableProductUnits.filter(
    (unit) => !selectedProductUnitValues.includes(getProductUnitScopeValue(unit))
  );
  const selectedProductUnitObjects = selectedProductUnitValues
    .map((value) => activeSelectableProductUnits.find((unit) => getProductUnitScopeValue(unit) === value))
    .filter((unit): unit is ScopedProductUnitOption => Boolean(unit));
  const pending = createMutation.isPending || updateMutation.isPending;
  const conditionFieldOptions = (() => {
    const fields = new Set<string>();

    collectAdjustmentFields(defaultAdjustment, fields);
    allRules.forEach((rule) => collectAdjustmentFields(getAdjustment(rule), fields));
    if (form.adjustment.unitField.trim()) fields.add(form.adjustment.unitField.trim());
    form.adjustment.conditions.forEach((condition) => {
      if (condition.field.trim()) fields.add(condition.field.trim());
    });

    const dynamicFields = [...fields].map((field) => ({
      value: field,
      label: formatConditionFieldLabel(field),
    }));
    const unitFields = activeSelectableProductUnits
      .filter((unit) => unit.unitDefinitionId)
      .map((unit) => ({
        value: `unit.${unit.unitDefinitionId}`,
        label: getProductUnitLabel(unit),
      }));

    const merged = new Map<string, { value: string; label: string }>();
    [...unitFields, ...dynamicFields].forEach((field) => merged.set(field.value, field));
    return [...merged.values()];
  })();

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

    setForm((current) => ({ ...current, ...nextScope }));
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

  /**
   * Bir birimi kuralın kapsamına alır. Birim ürüne ait olup bu plana henüz
   * atanmamışsa (başka bir planda eklenmiş olabilir) aynı anda plana da atanır;
   * böylece kullanıcı birimi her planda yeniden oluşturmak zorunda kalmaz.
   */
  const handleAddUnitToRule = async (unit: ScopedProductUnitOption) => {
    updateProductUnitScope(getProductUnitScopeValue(unit), true);
    if (isUnitAssignedToPlan(unit)) return;

    try {
      await onAssignProductUnitToPlan?.(unit.id ? { id: unit.id } : { _tempId: unit._tempId });
    } catch (error) {
      showApiError(error);
    }
  };

  return (
    <div className="row g-4">
      {editable && (
        <FormModal
          open={formOpen}
          toggle={resetForm}
          title={form.id ? "Kuralı Güncelle" : "Dinamik Kural Ekle"}
          size="xl"
          centered
          scrollable
          className="pricing-rule-modal"
          bodyClassName="pricing-manager-modal-body"
          loading={pending}
          loadingText="Kaydediliyor..."
          submitLabel={form.id ? "Kuralı Güncelle" : "Kural Ekle"}
          onSubmit={handleSubmit}
        >
            <div className="row g-3">
              <div className="col-12">
                <div className="pricing-rule-scope-panel">
                  <div className="pricing-rule-scope-copy">
                    <span className="overline-title text-primary">1. Adım — Birimler</span>
                    <p className="mb-0 text-soft">
                      Kuralın uygulanacağı ürün birimlerini seçin. Birimler ürün seviyesindedir: bir kez
                      eklendiğinde ürünün bütün satış planlarında listelenir ve kurala eklediğinizde bu plana
                      da otomatik atanır.
                    </p>
                  </div>
                  <div className="row g-3">
                    <div className="col-md-6">
                      <div className="d-flex align-items-center justify-content-between mb-2">
                        <label className="form-label mb-0">Ürünün birimleri</label>
                        {onCreateProductUnit && (
                          <Button color="light" size="sm" type="button" onClick={() => setUnitModalOpen(true)}>
                            <em className="icon ni ni-plus me-1" />
                            Yeni birim ekle
                          </Button>
                        )}
                      </div>
                      <div className="pricing-unit-list">
                        {availableProductUnits.map((unit) => {
                          const value = getProductUnitScopeValue(unit);
                          const inPlan = isUnitAssignedToPlan(unit);
                          return (
                            <div className="pricing-unit-list-item" key={value}>
                              <span>
                                {getProductUnitLabel(unit)} ({unit.code}){!unit.id ? " (kaydedilecek)" : ""}
                                {isLocked && !inPlan && (
                                  <span className="badge bg-outline-light text-soft ms-2" title="Bu birim ürüne ekli; kurala eklediğinizde bu plana da atanır.">
                                    Bu planda kullanılmıyor
                                  </span>
                                )}
                              </span>
                              <div className="d-flex gap-1">
                                <Button color="light" size="sm" type="button" onClick={() => void handleAddUnitToRule(unit)}>
                                  <em className="icon ni ni-plus" />
                                  Ekle
                                </Button>
                                {onRemoveProductUnitFromPlan && inPlan && isLocked && (
                                  <Button
                                    color="warning"
                                    outline
                                    size="sm"
                                    type="button"
                                    title="Sadece bu plandan kaldır"
                                    onClick={() => handleRequestRemoveUnit(unit, "plan")}
                                  >
                                    <em className="icon ni ni-signout" />
                                  </Button>
                                )}
                                {onRemoveProductUnit && (
                                  <Button
                                    color="danger"
                                    outline
                                    size="sm"
                                    type="button"
                                    title="Komple üründen kaldır"
                                    onClick={() => handleRequestRemoveUnit(unit, "product")}
                                  >
                                    <em className="icon ni ni-trash" />
                                  </Button>
                                )}
                              </div>
                            </div>
                          );
                        })}
                        {availableProductUnits.length === 0 && (
                          <span className="text-soft fs-12px">Ürüne eklenmiş birim yok.</span>
                        )}
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="d-flex align-items-center justify-content-between mb-2">
                        <label className="form-label">Kuralın geçerli olduğu birimler</label>
                      </div>
                      <div className="pricing-unit-list">
                        {selectedProductUnitObjects.map((unit) => {
                          const value = getProductUnitScopeValue(unit);
                          return (
                            <div className="pricing-unit-list-item" key={value}>
                              <span>
                                {getProductUnitLabel(unit)} ({unit.code}){!unit.id ? " (kaydedilecek)" : ""}
                              </span>
                              <Button color="danger" outline size="sm" type="button" onClick={() => updateProductUnitScope(value, false)}>
                                <em className="icon ni ni-cross" />
                                Kaldır
                              </Button>
                            </div>
                          );
                        })}
                        {selectedProductUnitObjects.length === 0 && (
                          <span className="text-soft fs-12px">Kurala henüz birim atanmadı — tüm ürün birimleri için geçerli olur.</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <PricingAdjustmentFields
                value={form.adjustment}
                onChange={updateAdjustment}
                engineOpen={engineOpen}
                onEngineOpenChange={setEngineOpen}
                conditionFieldOptions={conditionFieldOptions}
                leadingAdvancedRow={
                  <>
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
                    <div className="col-md-3 d-flex align-items-end pb-1">
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
                  </>
                }
              />
            </div>
        </FormModal>
      )}

      <ApplyTemplateModal
        open={applyTemplateOpen}
        productId={productId}
        licenseOfferingId={lockedLicenseOfferingId}
        onClose={() => setApplyTemplateOpen(false)}
        onApplied={() => refetch()}
      />

      <SaveAsTemplateModal
        open={Boolean(templateSourceRule)}
        rule={templateSourceRule}
        onClose={() => setTemplateSourceRule(undefined)}
      />

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
                    setForm(emptyForm(lockedLicenseOfferingId, lockedLicenseOfferingTempId, (rules.length + 1) * 10));
                    setEngineOpen(false);
                    setFormOpen(true);
                  }}
                >
                  <em className="icon ni ni-plus me-1" />
                  Yeni Kural
                </Button>
              )}
              {editable && productId && (
                <Button color="light" size="sm" type="button" onClick={() => setApplyTemplateOpen(true)}>
                  <em className="icon ni ni-tag me-1" />
                  Şablondan Ekle
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
            <div className="card-inner">
              <DndContext sensors={dragSensors} collisionDetection={closestCenter} onDragEnd={handleRuleDragEnd}>
                <SortableContext items={rules.map((rule) => rule.id)} strategy={verticalListSortingStrategy}>
                  <div className="d-flex flex-column gap-2">
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
                        <SortableRuleRow id={rule.id} key={rule.id}>
                          {({ attributes, listeners }) => (
                            <div className="card card-bordered">
                              <div className="card-inner d-flex flex-wrap align-items-center gap-3">
                                {editable && (
                                  <button
                                    type="button"
                                    className="btn btn-sm btn-icon btn-outline-light pricing-drag-handle"
                                    title="Sürükleyerek sırala"
                                    {...attributes}
                                    {...listeners}
                                  >
                                    <em className="icon ni ni-drag" />
                                  </button>
                                )}
                                <div style={{ minWidth: 160 }}>
                                  <div className="fw-medium">
                                    {rule.name}
                                    <TemplateOriginBadge rule={rule} />
                                  </div>
                                  <code className="fs-12">{rule.code}</code>
                                </div>
                                <div className="fs-13px">{shortJsonSummary(rule)}</div>
                                <div className="fs-12">
                                  {showOfferingBadge && <span className="badge bg-outline-primary me-1">{offeringLabel}</span>}
                                  {productUnitLabel && <span className="badge bg-outline-success me-1">{productUnitLabel}</span>}
                                  {variantLabel && <span className="badge bg-outline-info me-1">{variantLabel}</span>}
                                  {!hasFilters && "Tümü"}
                                </div>
                                <div className="fs-12 text-soft">
                                  {rule.validFrom ? new Date(rule.validFrom).toLocaleDateString("tr-TR") : "Başlangıç yok"}
                                  {" - "}
                                  {rule.validTo ? new Date(rule.validTo).toLocaleDateString("tr-TR") : "Bitiş yok"}
                                </div>
                                <span className={`badge bg-${rule.isActive ? "success" : "secondary"}`}>
                                  {rule.isActive ? "Aktif" : "Pasif"}
                                </span>
                                {editable && (
                                  <div className="d-inline-flex flex-wrap gap-1 ms-auto">
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
                                    {rule.id && (
                                      <Button
                                        color="light"
                                        size="sm"
                                        type="button"
                                        title="Bu kuralı başka ürünlerde de kullanmak üzere şablona al"
                                        onClick={() => setTemplateSourceRule(rule)}
                                      >
                                        <em className="icon ni ni-tag me-1" />
                                        Şablona Al
                                      </Button>
                                    )}
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
                                )}
                              </div>
                            </div>
                          )}
                        </SortableRuleRow>
                      );
                    })}
                  </div>
                </SortableContext>
              </DndContext>
            </div>
          )}
        </div>
      </div>

      {onCreateProductUnit && (
        <UnitQuickAddModal
          isOpen={unitModalOpen}
          onClose={() => setUnitModalOpen(false)}
          existingUnitDefinitionIds={activeSelectableProductUnits.map((unit) => unit.unitDefinitionId).filter(Boolean)}
          onUnitSelected={(definition) => void handleUnitCreated(definition)}
          adding={addingUnit}
        />
      )}

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

      <ConfirmDialog
        open={Boolean(removeUnitTarget)}
        title={removeUnitTarget?.mode === "plan" ? "Birim Bu Plandan Kaldırılsın mı?" : "Birim Üründen Kaldırılsın mı?"}
        message={
          removeUnitTarget
            ? removeUnitTarget.mode === "plan"
              ? `"${getProductUnitLabel(removeUnitTarget.unit)}" birimi sadece bu satış planından kaldırılacak; üründe ve diğer planlarda kalmaya devam edecek.`
              : isUnitUsedInOtherPlan(removeUnitTarget.unit)
                ? `"${getProductUnitLabel(removeUnitTarget.unit)}" birimi başka bir satış planının fiyatlandırma kuralında kullanılıyor. Yine de üründen kaldırmak istiyor musunuz? Bu kurallardaki birim referansı geçersiz kalacaktır.`
                : `"${getProductUnitLabel(removeUnitTarget.unit)}" birimi üründen kaldırılacak. Evrensel birim tanımı silinmez, sadece bu ürünle bağlantısı kesilir.`
            : ""
        }
        variant="danger"
        loading={removingUnit}
        confirmLabel={removeUnitTarget?.mode === "plan" ? "Kaldır" : "Sil"}
        onCancel={() => setRemoveUnitTarget(null)}
        onConfirm={() => void handleConfirmRemoveUnit()}
      />
    </div>
  );
};

export default ProductPricingRulesPanel;
