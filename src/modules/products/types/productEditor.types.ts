export type ProductProfileType = "physical" | "software" | "service" | "subscription";

export interface VariantAxisForm {
  name: string;
  valuesCsv: string;
}

export interface VariantForm {
  sku: string;
  barcode?: string;
  isActive: boolean;
  optionSummary?: string;
}

export interface PriceItemForm {
  priceListId: string;
  currency: string;
  variantSku?: string;
  amount?: number;
  minQty?: number;
  validFrom?: string;
  validTo?: string;
}

export interface AttributeForm {
  definitionKey: string;
  value: string;
  scope: "product" | "variant";
  variantSku?: string;
}

export interface SupplierForm {
  supplierId: string;
  leadTimeDays?: number;
  purchasePrice?: number;
}

export interface MediaForm {
  fileName?: string;
  url?: string;
  isCover?: boolean;
  sortOrder?: number;
  variantSku?: string;
}

export interface BundleForm {
  productId: string;
  variantId?: string;
  quantity: number;
}

export interface ProductProfileForm {
  type: ProductProfileType;
  physical?: {
    weight?: number;
    width?: number;
    height?: number;
    depth?: number;
    warrantyMonths?: number;
  };
  software?: {
    licenseType?: string;
    downloadUrl?: string;
    platform?: string;
  };
  service?: {
    serviceType?: string;
    durationMinutes?: number;
  };
  subscription?: {
    billingPeriod?: string;
    trialDays?: number;
  };
}

export interface ProductMetadataForm {
  variantAxes: VariantAxisForm[];
  variants: VariantForm[];
  prices: PriceItemForm[];
  attributes: AttributeForm[];
  categories: string[];
  suppliers: SupplierForm[];
  media: MediaForm[];
  bundles: BundleForm[];
  profile: ProductProfileForm;
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
  metadata: ProductMetadataForm;
}
