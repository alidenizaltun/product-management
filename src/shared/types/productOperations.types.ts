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

// --- Sub-DTOs used in ProductDetailDto ---

export interface ProductAttributeValueDto {
  id: Uuid;
  productId: Uuid;
  attributeDefinitionId: Uuid;
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
  isPrimary: boolean;
  sortOrder?: number;
  createdAt: string;
  updatedAt?: string;
}

export interface ProductBundleItemDto {
  id: Uuid;
  productId: Uuid;
  bundledProductId: Uuid;
  quantity: number;
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
  licenseModel?: number;
  seatCount?: number;
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
  productCode: string;
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
  code: string;
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
  supplierCode: string;
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
  code: string;
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
