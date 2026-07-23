import type { ProductPricingRuleDto, CreateFullProductRequestDto } from "@/shared/types/productOperations.types";
import type { ProductPricingRuleForm } from "@/modules/products/types/productEditor.types";

type PricingRuleSource = ProductPricingRuleDto | ProductPricingRuleForm;
type FullProductPricingRulePayload = NonNullable<CreateFullProductRequestDto["pricingRules"]>[number];

const collectIds = (ids?: string[], id?: string | null) => (ids?.length ? ids : id ? [id] : []).filter(Boolean);

const isDraftRuleId = (id?: string) => Boolean(id?.startsWith("draft-rule-"));

export const buildPricingRulePayload = (rule: PricingRuleSource): FullProductPricingRulePayload => {
  const savedUnitIds = collectIds(rule.productUnitIds, rule.productUnitId);
  const tempUnitIds = collectIds(rule.productUnitTempIds, rule.productUnitTempId);
  const licenseOfferingId =
    rule.productLicenseOfferingId ||
    ("licenseOfferingId" in rule ? rule.licenseOfferingId ?? undefined : undefined);

  return {
    id: rule.id && !isDraftRuleId(rule.id) ? rule.id : undefined,
    productLicenseOfferingId: licenseOfferingId || undefined,
    licenseOfferingId: licenseOfferingId || undefined,
    licenseOfferingTempId: rule.licenseOfferingTempId || undefined,
    productUnitId: savedUnitIds[0] || undefined,
    productUnitTempId: savedUnitIds.length === 0 ? tempUnitIds[0] || undefined : undefined,
    productUnitIds: savedUnitIds.length ? savedUnitIds : undefined,
    productUnitTempIds: tempUnitIds.length ? tempUnitIds : undefined,
    productVariantId: rule.productVariantId || null,
    code: rule.code,
    name: rule.name,
    priority: Number(rule.priority ?? 0),
    isActive: Boolean(rule.isActive),
    validFrom: rule.validFrom || null,
    validTo: rule.validTo || null,
    salesChannel: rule.salesChannel ?? null,
    customerGroupCode: rule.customerGroupCode ?? null,
    priceAdjustment: rule.priceAdjustment ?? null,
    priceAdjustmentJson: rule.priceAdjustmentJson ?? null,
  };
};

export const buildPricingRulePayloads = (rules: PricingRuleSource[] | undefined, emptyWhenMissing = false) =>
  rules?.length ? rules.map(buildPricingRulePayload) : emptyWhenMissing ? [] : undefined;
