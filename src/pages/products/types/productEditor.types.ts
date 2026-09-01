import type { ProductPricingRuleAdjustmentDto } from "@/domain/types/productOperations.types";

export type ProductProfileType = "physical" | "software" | "service" | "subscription";

export interface AttributeValueForm {
  attributeDefinitionId: string;
  valueText: string;
}

export interface VariantForm {
  sku: string;
  name?: string;
  optionValuesJson?: string;
  additionalPrice?: number;
  additionalCost?: number;
  isActive: boolean;
}

/** Ürünün bir bölgedeki satış koşulları: bölgeye özel para birimi ve KDV oranı. */
export interface ProductRegionForm {
  id?: string;
  regionId: string;
  currencyCode: string;
  /** Boş bırakılırsa ürünün kendi KDV oranı geçerlidir. */
  taxRate?: number;
  isDefault: boolean;
  isActive: boolean;
  sortOrder: number;
}

export interface PriceItemForm {
  /** Fiyatın geçerli olduğu bölge; boşsa tüm bölgelerde geçerlidir. */
  regionId?: string;
  priceType: number;
  amount?: number;
  compareAtAmount?: number;
  currencyCode: string;
  minQuantity?: number;
  maxQuantity?: number;
  validFrom?: string;
  validTo?: string;
  salesChannel?: string;
  customerGroupCode?: string;
}

export interface InventoryForm {
  warehouseId: string;
  warehouseCode?: string;
  quantityOnHand?: number;
  quantityReserved?: number;
  reorderPoint?: number;
  reorderQuantity?: number;
  inventoryPolicy?: number;
}

export interface MediaItemForm {
  mediaType: number;
  url?: string;
  thumbnailUrl?: string;
  mimeType?: string;
  altText?: string;
  isPrimary?: boolean;
  sortOrder?: number;
}

export interface CategoryMapForm {
  productCategoryId: string;
  isPrimary?: boolean;
  sortOrder?: number;
}

export interface BundleItemForm {
  childProductId: string;
  quantity: number;
  isOptional?: boolean;
}

export interface SupplierMapForm {
  productSupplierId: string;
  supplierProductCode?: string;
  supplierCost?: number;
  leadTimeInDays?: number;
  minOrderQuantity?: number;
  isPreferred?: boolean;
}

export interface InventoryTransactionForm {
  transactionType: number;
  quantity: number;
  unitCost?: number;
  referenceType?: string;
  referenceNumber?: string;
  note?: string;
  occurredAt?: string;
}

export interface InventoryReservationForm {
  quantity: number;
  reservationCode: string;
  reservedUntil?: string;
  status?: number;
  sourceType?: string;
  sourceId?: string;
}

export interface PriceListItemForm {
  productPriceListId: string;
  amount?: number;
  compareAtAmount?: number;
  minQuantity?: number;
  maxQuantity?: number;
}

export interface PhysicalProfileForm {
  weight?: number;
  width?: number;
  height?: number;
  length?: number;
  requiresShipping?: boolean;
  isFragile?: boolean;
  isHazardous?: boolean;
  requiresSerialNumber?: boolean;
  warrantyInMonths?: number;
}

export interface SoftwareProfileForm {
  version?: string;
  downloadUrl?: string;
  supportedPlatformsJson?: string;
  systemRequirementsJson?: string;
  releaseNotes?: string;
}

export interface ServiceProfileForm {
  deliveryMode?: number;
  durationInMinutes?: number;
  maxConcurrentBooking?: number;
  serviceAreaJson?: string;
}

export interface SubscriptionProfileForm {
  billingPeriodUnit?: number;
  billingPeriodValue?: number;
  trialDays?: number;
  autoRenew?: boolean;
  gracePeriodDays?: number;
  cancellationPolicy?: string;
}

export interface ModuleOfferingPriceForm {
  productLicenseOfferingId?: string;
  /** Henüz kaydedilmemiş offering'e referans; backend ile eşleştirir */
  licenseOfferingTempId?: string;
  appliesToAllLicenseOfferings?: boolean;
  price: number;
  currencyCode: string;
  isActive: boolean;
}

export interface ProductModuleForm {
  /** Kayıtlı modülün ID'si — düzenleme modunda API'den gelir, yeni modüllerde undefined */
  id?: string;
  moduleCode: string;
  name: string;
  description?: string;
  currencyCode: string;
  isOptional: boolean;
  isActive: boolean;
  sortOrder: number;
  offeringPrices: ModuleOfferingPriceForm[];
}

export interface SoftwarePricingTierForm {
  /** Kaydedilmiş bir offering'e referans (düzenleme modunda kullanılır) */
  productLicenseOfferingId?: string;
  /** Henüz kaydedilmemiş offering'e referans; backend bu değerle eşleştirir */
  licenseOfferingTempId?: string;
  unitDefinitionId: string;
  minUnits: number;
  maxUnits?: number;
  pricePerUnit: number;
  flatFee: number;
  currencyCode: string;
  isActive: boolean;
}

export interface ProductUnitForm {
  id?: string;
  _tempId?: string;
  unitDefinitionId: string;
  code: string;
  name: string;
  description?: string;
  role: 1 | 2 | 3;
  isDefault: boolean;
  isActive: boolean;
  sortOrder: number;
}

export interface LicenseOfferingForm {
  id?: string;
  _tempId?: string;
  productUnitId?: string;
  productUnitTempId?: string;
  productUnitIds?: string[];
  productUnitTempIds?: string[];
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
  convertToOfferingId?: string;
  validFrom?: string;
  validTo?: string;
  isActive: boolean;
  sortOrder: number;
}

export interface ProductPricingRuleForm {
  id?: string;
  productLicenseOfferingId?: string;
  licenseOfferingTempId?: string;
  productUnitId?: string;
  productUnitTempId?: string;
  productUnitIds?: string[];
  productUnitTempIds?: string[];
  productVariantId?: string | null;
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
}

export interface UnitConversionForm {
  fromUnitDefinitionId: string;
  toUnitDefinitionId: string;
  conversionFactor: number;
  fromUnitRole: 1 | 2 | 3;
  isActive: boolean;
}

export interface ProductFormValues {
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
  unitDefinitionId?: string;
  taxRate: number;
  taxCode?: string;
  tags?: string;
  metadataJson?: string;

  attributeValues: AttributeValueForm[];
  variants: VariantForm[];
  regions: ProductRegionForm[];
  prices: PriceItemForm[];
  inventories: InventoryForm[];
  mediaItems: MediaItemForm[];
  categoryMaps: CategoryMapForm[];
  bundleItems: BundleItemForm[];
  supplierMaps: SupplierMapForm[];
  inventoryTransactions: InventoryTransactionForm[];
  inventoryReservations: InventoryReservationForm[];
  priceListItems: PriceListItemForm[];

  physicalProfile: PhysicalProfileForm;
  softwareProfile: SoftwareProfileForm;
  serviceProfile: ServiceProfileForm;
  subscriptionProfile: SubscriptionProfileForm;

  modules: ProductModuleForm[];
  productUnits: ProductUnitForm[];
  softwarePricingTiers: SoftwarePricingTierForm[];
  licenseOfferings: LicenseOfferingForm[];
  pricingRules: ProductPricingRuleForm[];
  unitConversions: UnitConversionForm[];
}
