export type Uuid = string;

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
  unitOfMeasure?: string;
  taxRate?: number;
  taxCode?: string;
  tags?: string;
  metadataJson?: string;
  createdAt: string;
  updatedAt?: string;
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
  unitOfMeasure?: string;
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
  unitOfMeasure?: string;
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
    licenseModel?: number;
    seatCount?: number;
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
}

export interface UpdateFullProductRequestDto extends Omit<CreateFullProductRequestDto, "product"> {
  product: UpdateProductRequestDto;
}
