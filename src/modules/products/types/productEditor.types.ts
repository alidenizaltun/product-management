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

export interface PriceItemForm {
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
  licenseModel?: number;
  seatCount?: number;
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
  unitOfMeasure?: string;
  taxRate?: number;
  taxCode?: string;
  tags?: string;
  metadataJson?: string;

  attributeValues: AttributeValueForm[];
  variants: VariantForm[];
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
}
