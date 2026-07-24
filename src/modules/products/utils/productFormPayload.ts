import type { ProductPricingRuleDto, CreateFullProductRequestDto } from "@/shared/types/productOperations.types";
import type {
  LicenseOfferingForm,
  ModuleOfferingPriceForm,
  ProductPricingRuleForm,
} from "@/modules/products/types/productEditor.types";

type PricingRuleSource = ProductPricingRuleDto | ProductPricingRuleForm;
type FullProductPricingRulePayload = NonNullable<CreateFullProductRequestDto["pricingRules"]>[number];
type FullProductModulePayload = NonNullable<CreateFullProductRequestDto["modules"]>[number];
type FullProductModuleOfferingPricePayload = NonNullable<FullProductModulePayload["offeringPrices"]>[number];

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

const getLicenseOfferingReferences = (licenseOfferings: LicenseOfferingForm[]) =>
  licenseOfferings
    .map((offering) => ({
      productLicenseOfferingId: offering.id || undefined,
      licenseOfferingTempId: offering._tempId || undefined,
    }))
    .filter((offering) => Boolean(offering.productLicenseOfferingId) || Boolean(offering.licenseOfferingTempId));

const getModuleOfferingPriceKey = (price: {
  productLicenseOfferingId?: string;
  licenseOfferingTempId?: string;
}) => price.productLicenseOfferingId
  ? `id:${price.productLicenseOfferingId}`
  : price.licenseOfferingTempId
    ? `temp:${price.licenseOfferingTempId}`
    : undefined;

export const buildModuleOfferingPricePayloads = (
  prices: ModuleOfferingPriceForm[] | undefined,
  licenseOfferings: LicenseOfferingForm[] | undefined,
  fallbackCurrency = "TRY"
) => {
  if (!prices?.length) return undefined;

  const licenseOfferingReferences = getLicenseOfferingReferences(licenseOfferings ?? []);
  const expandedPrices = new Map<string, FullProductModuleOfferingPricePayload>();

  prices.forEach((price) => {
    const targets = price.appliesToAllLicenseOfferings
      ? licenseOfferingReferences
      : [{
        productLicenseOfferingId: price.productLicenseOfferingId || undefined,
        licenseOfferingTempId: price.licenseOfferingTempId || undefined,
      }];

    targets.forEach((target) => {
      const key = getModuleOfferingPriceKey(target);
      if (!key) return;

      expandedPrices.set(key, {
        productLicenseOfferingId: target.productLicenseOfferingId,
        licenseOfferingTempId: target.licenseOfferingTempId,
        price: Number.isFinite(price.price) ? price.price : 0,
        currencyCode: price.currencyCode || fallbackCurrency,
        isActive: Boolean(price.isActive),
      });
    });
  });

  return expandedPrices.size ? Array.from(expandedPrices.values()) : undefined;
};
