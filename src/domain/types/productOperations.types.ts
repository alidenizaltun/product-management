export type Uuid = string;

// ─── UnitDefinition ───────────────────────────────────────────────────────────

export interface UnitDefinitionDto {
  id: Uuid;
  code: string;
  name: string;
  description?: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateUnitDefinitionRequestDto {
  /** Gönderilmezse kod sistem tarafından üretilir (UNIT-000001). */
  code?: string;
  name: string;
  description?: string;
  isActive?: boolean;
  sortOrder?: number;
}

export interface UpdateUnitDefinitionRequestDto {
  code: string;
  name: string;
  description?: string;
  isActive: boolean;
  sortOrder: number;
}

// ─── Region (Bölge) ───────────────────────────────────────────────────────────

export interface RegionDto {
  id: Uuid;
  code: string;
  name: string;
  description?: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateRegionRequestDto {
  /** Gönderilmezse kod sistem tarafından üretilir (REG-000001). */
  code?: string;
  name: string;
  description?: string;
  isActive?: boolean;
  sortOrder?: number;
}

export interface UpdateRegionRequestDto {
  code: string;
  name: string;
  description?: string;
  isActive: boolean;
  sortOrder: number;
}

/** Ürünün bir bölgedeki satış koşulları: bölgeye özel para birimi ve KDV oranı. */
export interface ProductRegionDto {
  id: Uuid;
  productId: Uuid;
  regionId: Uuid;
  regionCode?: string | null;
  regionName?: string | null;
  currencyCode: string;
  /** Boşsa ürünün kendi KDV oranı geçerlidir. */
  taxRate?: number | null;
  isDefault: boolean;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt?: string | null;
}

export interface CreateProductRegionRequestDto {
  regionId: Uuid;
  currencyCode: string;
  taxRate?: number | null;
  isDefault: boolean;
  isActive: boolean;
  sortOrder: number;
}

export type UpdateProductRegionRequestDto = CreateProductRegionRequestDto;

export interface ProductDto {
  id: Uuid;
  productCode: string;
  name: string;
  shortDescription?: string;
  description?: string;
  kind: number;
  status: number;
  brand?: string;
  manufacturer?: string;
  barcode?: string;
  isActive: boolean;
  isSellable: boolean;
  isPurchasable: boolean;
  trackInventory: boolean;
  defaultCurrencyCode: string;
  unitDefinitionId?: Uuid;
  unitDefinitionName?: string;
  taxRate?: number;
  taxCode?: string;
  tags?: string;
  metadataJson?: string;
  /** Liste API — ana görsel */
  primaryImageUrl?: string;
  primaryThumbnailUrl?: string;
  imageUrls?: string[];
  createdAt: string;
  updatedAt?: string;
}

/** Liste endpoint'inden dönen özet ürün (tam ProductDto alt kümesi + görseller) */
export type ProductListItemDto = Pick<
  ProductDto,
  | "id"
  | "productCode"
  | "name"
  | "primaryImageUrl"
  | "primaryThumbnailUrl"
  | "imageUrls"
> &
  Partial<ProductDto>;

export const getProductListImageUrl = (product: {
  primaryThumbnailUrl?: string;
  primaryImageUrl?: string;
  imageUrls?: string[];
}): string | undefined =>
  product.primaryThumbnailUrl?.trim() ||
  product.primaryImageUrl?.trim() ||
  product.imageUrls?.find((u) => u?.trim())?.trim();

// --- Sub-DTOs used in ProductDetailDto ---

export interface ProductAttributeValueDto {
  id: Uuid;
  productId: Uuid;
  attributeDefinitionId: Uuid;
  attributeKey?: string;
  attributeDisplayName?: string;
  attributeDataType?: number;
  valueText?: string;
  valueNumber?: number;
  valueBool?: boolean;
  valueDate?: string;
  valueJson?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface ProductVariantDto {
  id: Uuid;
  productId: Uuid;
  sku: string;
  barcode?: string;
  name: string;
  optionValuesJson?: string;
  additionalPrice?: number;
  additionalCost?: number;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface ProductPriceDto {
  id: Uuid;
  productId: Uuid;
  productVariantId?: Uuid;
  /** Boşsa fiyat tüm bölgelerde geçerlidir. */
  regionId?: Uuid | null;
  regionName?: string | null;
  priceType: number;
  amount: number;
  compareAtAmount?: number;
  currencyCode: string;
  minQuantity?: number;
  maxQuantity?: number;
  validFrom?: string;
  validTo?: string;
  salesChannel?: string;
  customerGroupCode?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface ProductInventoryDetailDto {
  id: Uuid;
  productId: Uuid;
  productVariantId?: Uuid;
  warehouseId: Uuid;
  warehouseCode?: string;
  quantityOnHand: number;
  quantityReserved: number;
  quantityAvailable: number;
  reorderPoint?: number;
  reorderQuantity?: number;
  inventoryPolicy?: number;
  createdAt: string;
  updatedAt?: string;
}

export interface ProductMediaItemDto {
  id: Uuid;
  productId: Uuid;
  mediaType: number;
  url: string;
  thumbnailUrl?: string;
  mimeType?: string;
  altText?: string;
  isPrimary: boolean;
  sortOrder?: number;
  createdAt: string;
  updatedAt?: string;
}

export interface ProductCategoryMapDetailDto {
  id: Uuid;
  productId: Uuid;
  productCategoryId: Uuid;
  categoryCode?: string;
  categoryName?: string;
  isPrimary: boolean;
  sortOrder?: number;
  createdAt: string;
  updatedAt?: string;
}

export interface ProductBundleItemDto {
  id: Uuid;
  bundleProductId: Uuid;
  childProductId: Uuid;
  childVariantId?: Uuid;
  quantity: number;
  isOptional: boolean;
  ruleJson?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface ProductSupplierMapDto {
  id: Uuid;
  productId: Uuid;
  productSupplierId: Uuid;
  supplierProductCode?: string;
  supplierCost?: number;
  leadTimeInDays?: number;
  minOrderQuantity?: number;
  isPreferred: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface ProductPhysicalProfileDto {
  id: Uuid;
  productId: Uuid;
  weight?: number;
  width?: number;
  height?: number;
  length?: number;
  requiresShipping: boolean;
  isFragile: boolean;
  isHazardous: boolean;
  requiresSerialNumber: boolean;
  warrantyInMonths?: number;
  createdAt: string;
  updatedAt?: string;
}

export interface ProductSoftwareProfileDto {
  id: Uuid;
  productId: Uuid;
  version?: string;
  downloadUrl?: string;
  supportedPlatformsJson?: string;
  systemRequirementsJson?: string;
  releaseNotes?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface ProductServiceProfileDto {
  id: Uuid;
  productId: Uuid;
  deliveryMode?: number;
  durationInMinutes?: number;
  maxConcurrentBooking?: number;
  serviceAreaJson?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface ProductSubscriptionProfileDto {
  id: Uuid;
  productId: Uuid;
  billingPeriodUnit?: number;
  billingPeriodValue?: number;
  trialDays?: number;
  autoRenew: boolean;
  gracePeriodDays?: number;
  cancellationPolicy?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface ProductModuleOfferingPriceSimpleDto {
  id?: Uuid;
  productLicenseOfferingId: Uuid;
  licenseOfferingName?: string | null;
  licenseOfferingTempId?: string;
  price: number;
  currencyCode: string;
  isActive: boolean;
}

export interface ProductModuleDto {
  id: Uuid;
  productId: Uuid;
  moduleCode: string;
  name: string;
  description?: string;
  currencyCode: string;
  isOptional: boolean;
  isActive: boolean;
  sortOrder: number;
  offeringPrices?: ProductModuleOfferingPriceSimpleDto[];
  createdAt: string;
  updatedAt?: string;
}

export interface SoftwarePricingTierDto {
  id: Uuid;
  productId: Uuid;
  productLicenseOfferingId: Uuid;
  licenseOfferingName?: string;
  unitDefinitionId: Uuid;
  unitDefinitionCode?: string;
  unitDefinitionName?: string;
  minUnits: number;
  maxUnits?: number;
  pricePerUnit: number;
  flatFee: number;
  currencyCode: string;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

export type PricingAdjustmentType = "fixed" | "percent" | "percentage" | "multiplier" | "custom";
export type PricingAdjustmentMode = "unit" | string;
export type PricingAdjustmentApplyOn = "basePrice" | "currentPrice" | "previousResult" | string;
export type PricingConditionOperator = "all" | "any";

export interface ProductPricingRuleTierDto {
  from?: number | null;
  to?: number | null;
  type?: PricingAdjustmentType | string;
  value?: number | null;
}

export interface ProductPricingRuleConditionItemDto {
  field: string;
  operator: "eq" | "neq" | "gt" | "gte" | "lt" | "lte" | "contains" | "in" | "exists" | string;
  value?: unknown;
}

export interface ProductPricingRuleAdjustmentDto {
  mode?: PricingAdjustmentMode;
  type?: PricingAdjustmentType | string;
  value?: number | null;
  amount?: number | null;
  operation?: string;
  direction?: string;
  applyOn?: PricingAdjustmentApplyOn;
  unit?: {
    field?: string;
    freeUnits?: number | null;
    rounding?: "ceil" | "floor" | "round" | "none" | string;
  };
  tiers?: ProductPricingRuleTierDto[];
  limits?: {
    minAdjustment?: number | null;
    maxAdjustment?: number | null;
    minFinalPrice?: number | null;
    maxFinalPrice?: number | null;
  };
  conditions?: {
    operator?: PricingConditionOperator;
    items?: ProductPricingRuleConditionItemDto[];
  };
  [key: string]: unknown;
}

export interface ProductPricingRuleDto {
  id: Uuid;
  productId: Uuid;
  productLicenseOfferingId?: Uuid | null;
  licenseOfferingId?: Uuid | null;
  licenseOfferingTempId?: string | null;
  licenseOfferingName?: string | null;
  productUnitId?: Uuid | null;
  productUnitTempId?: string | null;
  productUnitIds?: Uuid[];
  productUnitTempIds?: string[];
  productUnits?: ProductUnitDto[];
  productUnitCode?: string | null;
  productUnitName?: string | null;
  unitDefinitionId?: Uuid | null;
  unitDefinitionCode?: string | null;
  unitDefinitionName?: string | null;
  productVariantId?: Uuid | null;
  variantName?: string | null;
  variantSku?: string | null;
  salesChannel?: string | null;
  customerGroupCode?: string | null;
  code: string;
  name: string;
  priority: number;
  isActive: boolean;
  validFrom?: string | null;
  validTo?: string | null;
  priceAdjustment?: ProductPricingRuleAdjustmentDto | null;
  priceAdjustmentJson?: string | null;
  /** Kural bir fiyat şablonundan kopyalandıysa kaynağın izi. */
  sourceTemplateId?: Uuid | null;
  sourceTemplateCode?: string | null;
  sourceTemplateName?: string | null;
  sourceTemplateVersion?: number | null;
  /** Şablonun güncel sürümü; sourceTemplateVersion'dan büyükse kural geride kalmıştır. */
  templateCurrentVersion?: number | null;
  createdAt?: string;
  updatedAt?: string | null;
}

export interface UpsertProductPricingRuleRequestDto {
  code: string;
  name: string;
  priority: number;
  isActive: boolean;
  validFrom?: string | null;
  validTo?: string | null;
  salesChannel?: string | null;
  customerGroupCode?: string | null;
  productVariantId?: Uuid | null;
  productUnitId?: Uuid | null;
  productUnitTempId?: string | null;
  productUnitIds?: Uuid[];
  productUnitTempIds?: string[];
  productLicenseOfferingId?: Uuid | null;
  licenseOfferingId?: Uuid | null;
  licenseOfferingTempId?: string | null;
  priceAdjustment?: ProductPricingRuleAdjustmentDto | null;
  priceAdjustmentJson?: string | null;
}

export interface ProductLicenseOfferingDto {
  id: Uuid;
  productId: Uuid;
  productUnitId?: Uuid | null;
  productUnitTempId?: string | null;
  productUnitIds?: Uuid[];
  productUnitTempIds?: string[];
  productUnits?: ProductUnitDto[];
  productUnitCode?: string | null;
  productUnitName?: string | null;
  unitDefinitionId?: Uuid | null;
  unitDefinitionCode?: string | null;
  unitDefinitionName?: string | null;
  licenseModel: number;
  name: string;
  description?: string;
  basePrice: number;
  currencyCode: string;
  billingPeriodUnit?: number;
  billingPeriodValue?: number;
  autoRenew: boolean;
  gracePeriodDays?: number;
  trialDays?: number;
  convertToOfferingId?: Uuid;
  convertToOfferingName?: string;
  maxSeats?: number;
  validFrom?: string;
  validTo?: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt?: string;
}

// ─── ModuleOfferingPrice ──────────────────────────────────────────────────────

export interface ProductModuleOfferingPriceDto {
  id: Uuid;
  productModuleId: Uuid;
  moduleCode: string | null;
  moduleName: string | null;
  productLicenseOfferingId: Uuid;
  licenseOfferingName: string | null;
  price: number;
  currencyCode: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string | null;
}

export interface CreateProductModuleOfferingPriceRequest {
  productLicenseOfferingId: Uuid;
  price: number;
  currencyCode: string;
  isActive: boolean;
}

export interface UpdateProductModuleOfferingPriceRequest {
  price: number;
  currencyCode: string;
  isActive: boolean;
}

// ─── UnitConversion ───────────────────────────────────────────────────────────

export type UnitRole = 1 | 2 | 3; // 1=Sales, 2=Stock, 3=Purchase

export const UNIT_ROLE_LABELS: Record<UnitRole, string> = {
  1: 'Satış Birimi',
  2: 'Stok Birimi',
  3: 'Satın Alma Birimi',
};

export interface ProductUnitDto {
  id: Uuid;
  productId: Uuid;
  unitDefinitionId: Uuid;
  unitDefinitionCode?: string | null;
  unitDefinitionName?: string | null;
  code: string;
  name: string;
  description?: string | null;
  role: UnitRole;
  isDefault: boolean;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt?: string | null;
}

export interface CreateProductUnitRequestDto {
  id?: Uuid;
  _tempId?: string;
  unitDefinitionId: Uuid;
  code: string;
  name: string;
  description?: string | null;
  role: UnitRole;
  isDefault: boolean;
  isActive: boolean;
  sortOrder: number;
}

export type UpdateProductUnitRequestDto = Omit<CreateProductUnitRequestDto, "id" | "_tempId">;

export interface ProductUnitConversionDto {
  id: Uuid;
  productId: Uuid;
  fromUnitDefinitionId: Uuid;
  fromUnitDefinitionCode: string;
  fromUnitDefinitionName: string;
  toUnitDefinitionId: Uuid;
  toUnitDefinitionCode: string;
  toUnitDefinitionName: string;
  conversionFactor: number;
  fromUnitRole: UnitRole;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string | null;
}

export interface CreateProductUnitConversionRequestDto {
  fromUnitDefinitionId: Uuid;
  toUnitDefinitionId: Uuid;
  conversionFactor: number;
  fromUnitRole: UnitRole;
  isActive?: boolean;
}

export interface ProductDetailDto extends ProductDto {
  attributeValues: ProductAttributeValueDto[];
  variants: ProductVariantDto[];
  prices: ProductPriceDto[];
  inventories: ProductInventoryDetailDto[];
  mediaItems: ProductMediaItemDto[];
  categoryMaps: ProductCategoryMapDetailDto[];
  bundleItems: ProductBundleItemDto[];
  supplierMaps: ProductSupplierMapDto[];
  physicalProfile?: ProductPhysicalProfileDto;
  softwareProfile?: ProductSoftwareProfileDto;
  serviceProfile?: ProductServiceProfileDto;
  subscriptionProfile?: ProductSubscriptionProfileDto;
  modules?: ProductModuleDto[];
  moduleOfferingPrices?: ProductModuleOfferingPriceDto[];
  softwarePricingTiers?: SoftwarePricingTierDto[];
  pricingRules?: ProductPricingRuleDto[];
  licenseOfferings?: ProductLicenseOfferingDto[];
  productUnits?: ProductUnitDto[];
  regions?: ProductRegionDto[];
  unitConversions?: ProductUnitConversionDto[];
  inventoryTransactions?: InventoryTransactionDto[];
  inventoryReservations?: InventoryReservationDto[];
  priceListItems?: ProductPriceListItemDto[];
}

export interface ProductFilterDto {
  search?: string;
  kind?: number;
  status?: number;
  isActive?: boolean;
  take?: number;
  includeLargeFields?: boolean;
}

export interface CreateProductRequestDto {
  /** Gönderilmezse kod sistem tarafından üretilir (PRD-000001). */
  productCode?: string;
  name: string;
  shortDescription?: string;
  description?: string;
  kind?: number;
  status?: number;
  brand?: string;
  manufacturer?: string;
  barcode?: string;
  isActive?: boolean;
  isSellable?: boolean;
  isPurchasable?: boolean;
  trackInventory?: boolean;
  defaultCurrencyCode?: string;
  unitDefinitionId?: Uuid;
  taxRate?: number;
  taxCode?: string;
  tags?: string;
  metadataJson?: string;
}

export interface UpdateProductRequestDto {
  productCode: string;
  name: string;
  shortDescription?: string;
  description?: string;
  kind: number;
  status: number;
  brand?: string;
  manufacturer?: string;
  barcode?: string;
  isActive: boolean;
  isSellable: boolean;
  isPurchasable: boolean;
  trackInventory: boolean;
  defaultCurrencyCode?: string;
  unitDefinitionId?: Uuid;
  taxRate?: number;
  taxCode?: string;
  tags?: string;
  metadataJson?: string;
}

export interface ProductAttributeDefinitionDto {
  id: Uuid;
  key: string;
  displayName: string;
  dataType: number;
  isRequired: boolean;
  isFilterable: boolean;
  isVariantAxis: boolean;
  allowedValuesJson?: string;
  validationRuleJson?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateProductAttributeDefinitionRequestDto {
  key: string;
  displayName: string;
  dataType?: number;
  isRequired?: boolean;
  isFilterable?: boolean;
  isVariantAxis?: boolean;
  allowedValuesJson?: string;
  validationRuleJson?: string;
}

export interface UpdateProductAttributeDefinitionRequestDto {
  key: string;
  displayName: string;
  dataType: number;
  isRequired: boolean;
  isFilterable: boolean;
  isVariantAxis: boolean;
  allowedValuesJson?: string;
  validationRuleJson?: string;
}

export interface ProductCategoryDto {
  id: Uuid;
  code: string;
  name: string;
  description?: string;
  parentCategoryId?: Uuid;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateProductCategoryRequestDto {
  /** Gönderilmezse kod sistem tarafından üretilir (CAT-000001). */
  code?: string;
  name: string;
  description?: string;
  parentCategoryId?: Uuid;
}

export interface UpdateProductCategoryRequestDto {
  code: string;
  name: string;
  description?: string;
  parentCategoryId?: Uuid;
}

export interface ProductCategoryMapDto {
  id: Uuid;
  productId: Uuid;
  categoryId: Uuid;
  createdAt?: string;
}

export interface CreateProductCategoryMapRequestDto {
  categoryId: Uuid;
}

export interface ProductSupplierDto {
  id: Uuid;
  supplierCode: string;
  name: string;
  taxNumber?: string;
  email?: string;
  phone?: string;
  address?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateProductSupplierRequestDto {
  /** Gönderilmezse kod sistem tarafından üretilir (SUP-000001). */
  supplierCode?: string;
  name: string;
  taxNumber?: string;
  email?: string;
  phone?: string;
  address?: string;
  isActive?: boolean;
}

export interface UpdateProductSupplierRequestDto {
  supplierCode: string;
  name: string;
  taxNumber?: string;
  email?: string;
  phone?: string;
  address?: string;
  isActive?: boolean;
}

export interface WarehouseDto {
  id: Uuid;
  code: string;
  name: string;
  description?: string;
  address?: string;
  city?: string;
  country?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateWarehouseRequestDto {
  /** Gönderilmezse kod sistem tarafından üretilir (WH-000001). */
  code?: string;
  name: string;
  description?: string;
  address?: string;
  city?: string;
  country?: string;
  isActive?: boolean;
}

export interface UpdateWarehouseRequestDto {
  code: string;
  name: string;
  description?: string;
  address?: string;
  city?: string;
  country?: string;
  isActive?: boolean;
}

export interface ProductInventoryDto {
  id: Uuid;
  productId: Uuid;
  productVariantId?: Uuid;
  warehouseId: Uuid;
  warehouseCode?: string;
  quantityOnHand: number;
  quantityReserved: number;
  quantityAvailable: number;
  reorderPoint?: number;
  reorderQuantity?: number;
  inventoryPolicy: number;
  createdAt: string;
  updatedAt?: string;
}

export interface ProductInventoryFilterDto {
  productId?: Uuid;
  productVariantId?: Uuid;
  warehouseId?: Uuid;
  inventoryPolicy?: number;
  take?: number;
}

export interface CreateProductInventoryRequestDto {
  productId: Uuid;
  productVariantId?: Uuid;
  warehouseId: Uuid;
  quantityOnHand?: number;
  quantityReserved?: number;
  reorderPoint?: number;
  reorderQuantity?: number;
  inventoryPolicy?: number;
}

export interface UpdateProductInventoryRequestDto {
  productId: Uuid;
  productVariantId?: Uuid;
  warehouseId: Uuid;
  quantityOnHand?: number;
  quantityReserved?: number;
  reorderPoint?: number;
  reorderQuantity?: number;
  inventoryPolicy?: number;
}

export interface InventoryTransactionDto {
  id: Uuid;
  productId: Uuid;
  productVariantId?: Uuid;
  warehouseId?: Uuid;
  transactionType: number;
  quantity: number;
  unitCost?: number;
  referenceType?: string;
  referenceNumber?: string;
  note?: string;
  occurredAt: string;
  createdAt: string;
}

export interface InventoryTransactionFilterDto {
  productId?: Uuid;
  productVariantId?: Uuid;
  warehouseId?: Uuid;
  transactionType?: number;
  dateFrom?: string;
  dateTo?: string;
  take?: number;
}

export interface CreateInventoryTransactionRequestDto {
  productId: Uuid;
  productVariantId?: Uuid;
  warehouseId?: Uuid;
  transactionType: number;
  quantity: number;
  unitCost?: number;
  referenceType?: string;
  referenceNumber?: string;
  note?: string;
  occurredAt?: string;
}

export interface InventoryReservationDto {
  id: Uuid;
  productId: Uuid;
  productVariantId?: Uuid;
  warehouseId?: Uuid;
  quantity: number;
  reservationCode: string;
  reservedUntil?: string;
  status: number;
  sourceType?: string;
  sourceId?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface InventoryReservationFilterDto {
  productId?: Uuid;
  productVariantId?: Uuid;
  warehouseId?: Uuid;
  status?: number;
  reservedUntilMin?: string;
  reservedUntilMax?: string;
  take?: number;
}

export interface CreateInventoryReservationRequestDto {
  productId: Uuid;
  productVariantId?: Uuid;
  warehouseId?: Uuid;
  quantity: number;
  reservationCode: string;
  reservedUntil?: string;
  status?: number;
  sourceType?: string;
  sourceId?: string;
}

export interface UpdateInventoryReservationStatusRequestDto {
  status: number;
  reservedUntil?: string;
}

export interface ProductPriceListDto {
  id: Uuid;
  code: string;
  name: string;
  description?: string;
  currencyCode: string;
  isActive: boolean;
  validFrom?: string;
  validTo?: string;
  salesChannel?: string;
  customerGroupCode?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateProductPriceListRequestDto {
  /** Gönderilmezse kod sistem tarafından üretilir (PL-000001). */
  code?: string;
  name: string;
  description?: string;
  currencyCode?: string;
  isActive?: boolean;
  validFrom?: string;
  validTo?: string;
  salesChannel?: string;
  customerGroupCode?: string;
}

export interface UpdateProductPriceListRequestDto {
  code: string;
  name: string;
  description?: string;
  currencyCode?: string;
  isActive?: boolean;
  validFrom?: string;
  validTo?: string;
  salesChannel?: string;
  customerGroupCode?: string;
}

export interface ProductPriceListItemDto {
  id: Uuid;
  productPriceListId: Uuid;
  productId: Uuid;
  productVariantId?: Uuid;
  amount: number;
  compareAtAmount?: number;
  minQuantity?: number;
  maxQuantity?: number;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateProductPriceListItemRequestDto {
  productPriceListId: Uuid;
  productId: Uuid;
  productVariantId?: Uuid;
  amount: number;
  compareAtAmount?: number;
  minQuantity?: number;
  maxQuantity?: number;
}

export interface UpdateProductPriceListItemRequestDto {
  amount: number;
  compareAtAmount?: number;
  minQuantity?: number;
  maxQuantity?: number;
}

export interface CreateFullProductRequestDto {
  product: CreateProductRequestDto;
  productUnits?: CreateProductUnitRequestDto[];
  regions?: CreateProductRegionRequestDto[];
  attributeValues?: Array<{
    attributeDefinitionId: Uuid;
    valueText: string;
  }>;
  variants?: Array<{
    sku: string;
    name?: string;
    optionValuesJson?: string;
    additionalPrice?: number;
    additionalCost?: number;
    isActive?: boolean;
  }>;
  prices?: Array<{
    regionId?: Uuid | null;
    priceType?: number;
    amount: number;
    compareAtAmount?: number;
    currencyCode: string;
    minQuantity?: number;
    maxQuantity?: number;
    validFrom?: string;
    validTo?: string;
    salesChannel?: string;
    customerGroupCode?: string;
  }>;
  inventories?: Array<{
    warehouseId: Uuid;
    warehouseCode?: string;
    quantityOnHand?: number;
    quantityReserved?: number;
    reorderPoint?: number;
    reorderQuantity?: number;
    inventoryPolicy?: number;
  }>;
  mediaItems?: Array<{
    mediaType?: number;
    url?: string;
    thumbnailUrl?: string;
    mimeType?: string;
    altText?: string;
    isPrimary?: boolean;
    sortOrder?: number;
  }>;
  categoryMaps?: Array<{
    productCategoryId: Uuid;
    isPrimary?: boolean;
    sortOrder?: number;
  }>;
  bundleItems?: Array<{
    childProductId: Uuid;
    quantity: number;
    isOptional?: boolean;
  }>;
  supplierMaps?: Array<{
    productSupplierId: Uuid;
    supplierProductCode?: string;
    supplierCost?: number;
    leadTimeInDays?: number;
    minOrderQuantity?: number;
    isPreferred?: boolean;
  }>;
  inventoryTransactions?: Array<{
    transactionType: number;
    quantity: number;
    unitCost?: number;
    referenceType?: string;
    referenceNumber?: string;
    note?: string;
    occurredAt?: string;
  }>;
  inventoryReservations?: Array<{
    quantity: number;
    reservationCode: string;
    reservedUntil?: string;
    status?: number;
    sourceType?: string;
    sourceId?: string;
  }>;
  priceListItems?: Array<{
    productPriceListId: Uuid;
    amount: number;
    compareAtAmount?: number;
    minQuantity?: number;
    maxQuantity?: number;
  }>;
  physicalProfile?: {
    weight?: number;
    width?: number;
    height?: number;
    length?: number;
    requiresShipping?: boolean;
    isFragile?: boolean;
    isHazardous?: boolean;
    requiresSerialNumber?: boolean;
    warrantyInMonths?: number;
  };
  softwareProfile?: {
    version?: string;
    downloadUrl?: string;
    supportedPlatformsJson?: string;
    systemRequirementsJson?: string;
    releaseNotes?: string;
  };
  serviceProfile?: {
    deliveryMode?: number;
    durationInMinutes?: number;
    maxConcurrentBooking?: number;
    serviceAreaJson?: string;
  };
  subscriptionProfile?: {
    billingPeriodUnit?: number;
    billingPeriodValue?: number;
    trialDays?: number;
    autoRenew?: boolean;
    gracePeriodDays?: number;
    cancellationPolicy?: string;
  };
  modules?: Array<{
    productId?: Uuid;
    moduleCode: string;
    name: string;
    description?: string;
    currencyCode: string;
    isOptional?: boolean;
    isActive?: boolean;
    sortOrder?: number;
    offeringPrices?: Array<{
      productLicenseOfferingId?: Uuid;
      licenseOfferingTempId?: string;
      price: number;
      currencyCode: string;
      isActive?: boolean;
    }>;
  }>;
  softwarePricingTiers?: Array<{
    productId?: Uuid;
    /** Kaydedilmiş bir offering'e referans (düzenleme modunda) */
    productLicenseOfferingId?: Uuid;
    /** Yeni eklenen offering'e geçici referans; backend bu key ile eşleştirir */
    licenseOfferingTempId?: string;
    unitDefinitionId: Uuid;
    minUnits: number;
    maxUnits?: number;
    pricePerUnit: number;
    flatFee?: number;
    currencyCode: string;
    isActive?: boolean;
  }>;
  licenseOfferings?: Array<{
    productId?: Uuid;
    /** Mevcut offering'in id'si (güncelleme için); yeni eklenenler için boş bırakın */
    id?: Uuid;
    /** Frontend'in tier eşleştirmesi için kullandığı geçici anahtar */
    _tempId?: string;
    productUnitId?: Uuid;
    productUnitTempId?: string;
    productUnitIds?: Uuid[];
    productUnitTempIds?: string[];
    licenseModel: number;
    name: string;
    description?: string;
    basePrice: number;
    currencyCode: string;
    billingPeriodUnit?: number;
    billingPeriodValue?: number;
    autoRenew?: boolean;
    gracePeriodDays?: number;
    trialDays?: number;
    convertToOfferingId?: Uuid;
    maxSeats?: number;
    validFrom?: string;
    validTo?: string;
    isActive?: boolean;
    sortOrder?: number;
  }>;
  pricingRules?: Array<{
    id?: Uuid;
    productLicenseOfferingId?: Uuid;
    licenseOfferingId?: Uuid;
    licenseOfferingTempId?: string;
    productUnitId?: Uuid;
    productUnitTempId?: string;
    productUnitIds?: Uuid[];
    productUnitTempIds?: string[];
    productVariantId?: Uuid | null;
    code: string;
    name: string;
    priority: number;
    isActive: boolean;
    validFrom?: string | null;
    validTo?: string | null;
    salesChannel?: string | null;
    customerGroupCode?: string | null;
    priceAdjustment?: ProductPricingRuleAdjustmentDto | null;
    priceAdjustmentJson?: string | null;
  }>;
}

export interface UpdateFullProductRequestDto extends Omit<CreateFullProductRequestDto, "product"> {
  product: UpdateProductRequestDto;
}

// ─── Fiyat şablonları ────────────────────────────────────────────────────────

export const PRICING_TEMPLATE_KIND = {
  PricingRule: 1,
  LicenseOffering: 2,
  ModulePrice: 3,
  ProductPrice: 4,
  PriceListItem: 5,
} as const;

export interface PricingTemplateDto {
  id: Uuid;
  code: string;
  name: string;
  description?: string | null;
  templateKind: number;
  unitDefinitionId?: Uuid | null;
  unitDefinitionCode?: string | null;
  unitDefinitionName?: string | null;
  currencyCode: string;
  payloadJson: string;
  version: number;
  isActive: boolean;
  sortOrder: number;
  usageCount: number;
  createdAt?: string;
  updatedAt?: string | null;
}

export interface CreatePricingTemplateRequestDto {
  code?: string | null;
  name: string;
  description?: string | null;
  templateKind: number;
  unitDefinitionId?: Uuid | null;
  currencyCode: string;
  payloadJson?: string | null;
  payload?: ProductPricingRuleAdjustmentDto | null;
  isActive: boolean;
  sortOrder: number;
}

export interface UpdatePricingTemplateRequestDto {
  code: string;
  name: string;
  description?: string | null;
  unitDefinitionId?: Uuid | null;
  currencyCode: string;
  payloadJson?: string | null;
  payload?: ProductPricingRuleAdjustmentDto | null;
  isActive: boolean;
  sortOrder: number;
}

export interface ApplyPricingTemplateRequestDto {
  productId: Uuid;
  licenseOfferingId?: Uuid | null;
  productVariantId?: Uuid | null;
  priority: number;
  isActive: boolean;
  validFrom?: string | null;
  validTo?: string | null;
  overrideValue?: number | null;
}

export interface ApplyPricingTemplateBulkRequestDto {
  productIds: Uuid[];
  priority: number;
  isActive: boolean;
  validFrom?: string | null;
  validTo?: string | null;
  overrideValue?: number | null;
}

export interface ApplyPricingTemplateResultDto {
  productId: Uuid;
  productName: string;
  succeeded: boolean;
  pricingRuleId?: Uuid | null;
  pricingRuleCode?: string | null;
  createdProductUnitId?: Uuid | null;
  /** Kurala ait ürün birimi (yeni oluşturulmuş ya da mevcut). */
  linkedProductUnitId?: Uuid | null;
  /** Birimin bağlandığı satış planı sayısı. */
  linkedOfferingCount: number;
  message?: string | null;
}

export interface SavePricingRuleAsTemplateRequestDto {
  name?: string | null;
  description?: string | null;
  code?: string | null;
  isActive: boolean;
}

export interface PricingTemplateUsageDto {
  pricingRuleId: Uuid;
  pricingRuleCode: string;
  pricingRuleName: string;
  productId: Uuid;
  productCode: string;
  productName: string;
  productLicenseOfferingId?: Uuid | null;
  licenseOfferingName?: string | null;
  sourceTemplateVersion?: number | null;
  templateVersion: number;
  isOutdated: boolean;
  isActive: boolean;
}

// ─── Zam revizyonları ────────────────────────────────────────────────────────

export const PRICE_REVISION_STATUS = {
  Draft: 1,
  Previewed: 2,
  PendingApproval: 3,
  Approved: 4,
  Applied: 5,
  RolledBack: 6,
  Rejected: 7,
  Cancelled: 8,
} as const;

export const PRICE_ADJUSTMENT_TYPE = {
  Percent: 1,
  Amount: 2,
  SetValue: 3,
  Multiplier: 4,
} as const;

export const PRICE_ROUNDING_MODE = {
  None: 1,
  Round: 2,
  Ceiling: 3,
  Floor: 4,
} as const;

export const PRICE_REVISION_SCOPE_TYPE = {
  Product: 1,
  Category: 2,
  PricingTemplate: 3,
  UnitDefinition: 4,
  LicenseOffering: 5,
  PriceList: 6,
  ProductKind: 7,
  Region: 8,
} as const;

export const PRICE_REVISION_TARGET_TYPE = {
  LicenseOfferingBasePrice: 1,
  ModuleOfferingPrice: 2,
  PricingRuleValue: 3,
  PricingRuleTier: 4,
  ProductPrice: 5,
  PriceListItem: 6,
} as const;

export interface PriceRevisionScopeDto {
  id: Uuid;
  priceRevisionId: Uuid;
  scopeType: number;
  targetId?: Uuid | null;
  targetValue?: string | null;
  targetName?: string | null;
  isExclude: boolean;
}

export interface CreatePriceRevisionScopeRequestDto {
  scopeType: number;
  targetId?: Uuid | null;
  targetValue?: string | null;
  isExclude: boolean;
}

export interface PriceRevisionTargetBreakdownDto {
  targetType: number;
  lineCount: number;
  totalOldValue: number;
  totalNewValue: number;
}

export interface PriceRevisionSkippedRuleDto {
  pricingRuleId: Uuid;
  productId: Uuid;
  productName: string;
  pricingRuleName: string;
  reason: string;
}

export interface PriceRevisionSummaryDto {
  lineCount: number;
  excludedLineCount: number;
  productCount: number;
  totalOldValue: number;
  totalNewValue: number;
  totalDifference: number;
  breakdown: PriceRevisionTargetBreakdownDto[];
  skippedRules: PriceRevisionSkippedRuleDto[];
}

export interface PriceRevisionDto {
  id: Uuid;
  code: string;
  name: string;
  description?: string | null;
  adjustmentType: number;
  value: number;
  roundingMode: number;
  roundingStep?: number | null;
  currencyCode?: string | null;
  status: number;
  effectiveDate?: string | null;
  submittedAt?: string | null;
  submittedByUserId?: Uuid | null;
  approvedAt?: string | null;
  approvedByUserId?: Uuid | null;
  approvalNote?: string | null;
  appliedAt?: string | null;
  appliedByUserId?: Uuid | null;
  rolledBackAt?: string | null;
  rolledBackByUserId?: Uuid | null;
  scopes: PriceRevisionScopeDto[];
  summary?: PriceRevisionSummaryDto | null;
  createdAt?: string;
  updatedAt?: string | null;
}

export interface CreatePriceRevisionRequestDto {
  code?: string | null;
  name: string;
  description?: string | null;
  adjustmentType: number;
  value: number;
  roundingMode: number;
  roundingStep?: number | null;
  currencyCode?: string | null;
  effectiveDate?: string | null;
}

export interface UpdatePriceRevisionRequestDto {
  code: string;
  name: string;
  description?: string | null;
  adjustmentType: number;
  value: number;
  roundingMode: number;
  roundingStep?: number | null;
  currencyCode?: string | null;
  effectiveDate?: string | null;
}

export interface PriceRevisionLineDto {
  id: Uuid;
  priceRevisionId: Uuid;
  targetType: number;
  targetId: Uuid;
  targetPath: string;
  productId: Uuid;
  productName: string;
  targetLabel: string;
  currencyCode: string;
  oldValue: number;
  newValue: number;
  difference: number;
  isExcluded: boolean;
  isApplied: boolean;
  skipReason?: string | null;
}

export interface PriceRevisionLineFilterDto {
  targetType?: number | null;
  productId?: Uuid | null;
  isExcluded?: boolean | null;
  skip?: number;
  take?: number;
}

export interface PriceRevisionLinePageDto {
  items: PriceRevisionLineDto[];
  totalCount: number;
}

export interface UpdatePriceRevisionLineRequestDto {
  isExcluded?: boolean | null;
  newValue?: number | null;
}

export interface PriceRevisionExecutionResultDto {
  priceRevisionId: Uuid;
  status: number;
  affectedLineCount: number;
  skippedLineCount: number;
  skippedLines: PriceRevisionLineDto[];
}
