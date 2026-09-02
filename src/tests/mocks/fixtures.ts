import type { ProductDto, ProductDetailDto } from "@/domain/types/productOperations.types";
import type { User } from "@/domain/entities/User";
import type { AuthResponse } from "@/domain/types/auth.types";
import type {
  ProductAttributeDefinitionDto,
  ProductCategoryDto,
  ProductInventoryDto,
  InventoryReservationDto,
  InventoryTransactionDto,
  ProductPriceListDto,
  ProductPriceListItemDto,
  PriceRevisionDto,
  PriceRevisionSummaryDto,
  PriceRevisionLineDto,
  PriceRevisionExecutionResultDto,
  PricingTemplateDto,
  PricingTemplateUsageDto,
  ApplyPricingTemplateResultDto,
  RegionDto,
  ProductSupplierDto,
  UnitDefinitionDto,
  WarehouseDto,
} from "@/domain/types/productOperations.types";
import type { AllLookupsDto, LookupItem } from "@/domain/types/lookup.types";
import type { Integration, SystemSetting } from "@/domain/types/system.types";
import type { Role, PermissionDefinition, AdminUser } from "@/domain/types/identity.types";

const NOW = "2025-01-01T00:00:00Z";

export const mockUser: User = {
  id: "user-001",
  email: "admin@example.com",
  firstName: "Admin",
  lastName: "Kullanıcı",
  fullName: "Admin Kullanıcı",
  phoneNumber: null,
  emailConfirmed: true,
  isActive: true,
  roles: ["Admin"],
  permissions: [],
  createdAt: NOW,
};

export const mockAuthResponse: AuthResponse = {
  succeeded: true,
  user: mockUser,
  token: {
    accessToken: "mock-access-token",
    refreshToken: "mock-refresh-token",
    expiresIn: 3600,
    tokenType: "Bearer",
    expiresAt: "2025-01-01T01:00:00Z",
  },
  errors: [],
};

export const mockAttributeDefinition: ProductAttributeDefinitionDto = {
  id: "attr-001",
  key: "COLOR",
  displayName: "Renk",
  dataType: 1,
  isRequired: false,
  isFilterable: true,
  isVariantAxis: true,
  createdAt: NOW,
};

export const mockCategory: ProductCategoryDto = {
  id: "cat-001",
  code: "CAT-000001",
  name: "Elektronik",
  createdAt: NOW,
};

export const mockIntegration: Integration = {
  id: "integration-001",
  name: "Brevo",
  type: "Email",
  providerKey: "brevo",
  isEnabled: true,
  hasCredentials: true,
  isSystemManaged: false,
  createdAt: NOW,
};

export const mockInventory: ProductInventoryDto = {
  id: "inventory-001",
  productId: "prod-001",
  warehouseId: "warehouse-001",
  quantityOnHand: 100,
  quantityReserved: 10,
  quantityAvailable: 90,
  inventoryPolicy: 1,
  createdAt: NOW,
};

export const mockInventoryReservation: InventoryReservationDto = {
  id: "reservation-001",
  productId: "prod-001",
  quantity: 5,
  reservationCode: "RES-000001",
  status: 1,
  createdAt: NOW,
};

export const mockInventoryTransaction: InventoryTransactionDto = {
  id: "transaction-001",
  productId: "prod-001",
  transactionType: 1,
  quantity: 10,
  occurredAt: NOW,
  createdAt: NOW,
};

export const mockLookupItem: LookupItem = { id: "lookup-001", name: "Test Öğesi" };

export const mockAllLookups: AllLookupsDto = {
  products: [mockLookupItem],
  categories: [mockLookupItem],
  warehouses: [mockLookupItem],
  suppliers: [mockLookupItem],
  priceLists: [mockLookupItem],
  unitDefinitions: [mockLookupItem],
  regions: [mockLookupItem],
};

export const mockPriceList: ProductPriceListDto = {
  id: "pricelist-001",
  code: "PL-000001",
  name: "Standart Liste",
  currencyCode: "TRY",
  isActive: true,
  createdAt: NOW,
};

export const mockPriceListItem: ProductPriceListItemDto = {
  id: "pricelist-item-001",
  productPriceListId: mockPriceList.id,
  productId: "prod-001",
  amount: 100,
  createdAt: NOW,
};

export const mockPriceRevisionSummary: PriceRevisionSummaryDto = {
  lineCount: 1,
  excludedLineCount: 0,
  productCount: 1,
  totalOldValue: 100,
  totalNewValue: 110,
  totalDifference: 10,
  breakdown: [],
  skippedRules: [],
};

export const mockPriceRevision: PriceRevisionDto = {
  id: "revision-001",
  code: "REV-000001",
  name: "2026 Zam",
  adjustmentType: 1,
  value: 10,
  roundingMode: 1,
  status: 1,
  scopes: [],
};

export const mockPriceRevisionLine: PriceRevisionLineDto = {
  id: "line-001",
  priceRevisionId: mockPriceRevision.id,
  targetType: 1,
  targetId: "offering-001",
  targetPath: "LicenseOffering.BasePrice",
  productId: "prod-001",
  productName: "Test Ürünü",
  targetLabel: "Standart Lisans",
  currencyCode: "TRY",
  oldValue: 100,
  newValue: 110,
  difference: 10,
  isExcluded: false,
  isApplied: false,
};

export const mockPriceRevisionExecutionResult: PriceRevisionExecutionResultDto = {
  priceRevisionId: mockPriceRevision.id,
  status: 5,
  affectedLineCount: 1,
  skippedLineCount: 0,
  skippedLines: [],
};

export const mockPricingTemplate: PricingTemplateDto = {
  id: "template-001",
  code: "TPL-000001",
  name: "Standart Şablon",
  templateKind: 1,
  currencyCode: "TRY",
  payloadJson: "{}",
  version: 1,
  isActive: true,
  sortOrder: 0,
  usageCount: 0,
};

export const mockPricingTemplateUsage: PricingTemplateUsageDto = {
  pricingRuleId: "rule-001",
  pricingRuleCode: "rule-standart",
  pricingRuleName: "Standart kural",
  productId: "prod-001",
  productCode: "TEST-001",
  productName: "Test Ürünü",
  templateVersion: 1,
  isOutdated: false,
  isActive: true,
};

export const mockApplyPricingTemplateResult: ApplyPricingTemplateResultDto = {
  productId: "prod-001",
  productName: "Test Ürünü",
  succeeded: true,
  linkedOfferingCount: 1,
};

export const mockRegion: RegionDto = {
  id: "region-001",
  code: "REG-000001",
  name: "Avrupa",
  isActive: true,
  sortOrder: 0,
  createdAt: NOW,
};

export const mockSupplier: ProductSupplierDto = {
  id: "supplier-001",
  supplierCode: "SUP-000001",
  name: "Test Tedarikçi",
  isActive: true,
  createdAt: NOW,
};

export const mockSystemSetting: SystemSetting = {
  id: "setting-001",
  category: "General",
  key: "SITE_NAME",
  value: "Product Manager",
  dataType: "String",
  displayName: "Site Adı",
  isEditable: true,
  sortOrder: 0,
};

export const mockUnitDefinition: UnitDefinitionDto = {
  id: "unit-001",
  code: "UNIT-000001",
  name: "Kullanıcı",
  isActive: true,
  sortOrder: 0,
  createdAt: NOW,
};

export const mockWarehouse: WarehouseDto = {
  id: "warehouse-001",
  code: "WH-000001",
  name: "Merkez Depo",
  isActive: true,
  createdAt: NOW,
};

export const mockRole: Role = {
  id: "role-001",
  name: "Admin",
  isActive: true,
  userCount: 1,
  permissions: ["products.view"],
  createdAt: NOW,
};

export const mockPermissionDefinition: PermissionDefinition = {
  key: "products.view",
  displayName: "Ürünleri Görüntüle",
  category: "Products",
};

export const mockAdminUser: AdminUser = {
  id: "admin-user-001",
  email: "admin@example.com",
  fullName: "Admin Kullanıcı",
  emailConfirmed: true,
  isActive: true,
  roles: ["Admin"],
  createdAt: NOW,
};

export const mockProductDto: ProductDto = {
    id: "prod-001",
    productCode: "TEST-001",
    name: "Test Ürünü",
    shortDescription: "Kısa açıklama",
    description: "Uzun açıklama",
    kind: 1,
    status: 0,
    brand: "TestMarka",
    isActive: true,
    isSellable: true,
    isPurchasable: true,
    trackInventory: true,
    defaultCurrencyCode: "TRY",
    unitDefinitionId: "unit-001",
    taxRate: 18,
    taxCode: "KDV18",
    tags: "tag1,tag2",
    primaryImageUrl: "https://via.placeholder.com/400x300?text=Test",
    primaryThumbnailUrl: "https://via.placeholder.com/200x150?text=Test",
    imageUrls: ["https://via.placeholder.com/400x300?text=Test"],
    createdAt: NOW,
};

export const mockProductDetailDto: ProductDetailDto = {
    ...mockProductDto,
    attributeValues: [
        {
            id: "av-001",
            productId: "prod-001",
            attributeDefinitionId: "attr-001",
            attributeKey: "COLOR",
            attributeDisplayName: "Renk",
            attributeDataType: 1,
            valueText: "Kırmızı",
            createdAt: NOW,
        },
        {
            id: "av-002",
            productId: "prod-001",
            attributeDefinitionId: "attr-002",
            attributeKey: "SIZE",
            attributeDisplayName: "Beden",
            attributeDataType: 1,
            valueText: "L",
            createdAt: NOW,
        },
    ],
    variants: [
        {
            id: "var-001",
            productId: "prod-001",
            sku: "SKU-001-RED-L",
            name: "Kırmızı - L",
            optionValuesJson: '{"renk":"kırmızı","beden":"L"}',
            additionalPrice: 0,
            additionalCost: 0,
            isActive: true,
            createdAt: NOW,
        },
        {
            id: "var-002",
            productId: "prod-001",
            sku: "SKU-001-BLUE-M",
            name: "Mavi - M",
            optionValuesJson: '{"renk":"mavi","beden":"M"}',
            additionalPrice: 10,
            additionalCost: 5,
            isActive: true,
            createdAt: NOW,
        },
    ],
    prices: [
        {
            id: "price-001",
            productId: "prod-001",
            priceType: 1,
            amount: 299.99,
            compareAtAmount: 399.99,
            currencyCode: "TRY",
            minQuantity: 1,
            salesChannel: "web",
            createdAt: NOW,
        },
        {
            id: "price-002",
            productId: "prod-001",
            priceType: 2,
            amount: 249.99,
            currencyCode: "TRY",
            minQuantity: 10,
            maxQuantity: 50,
            salesChannel: "web",
            customerGroupCode: "KURUMSAL",
            createdAt: NOW,
        },
    ],
    inventories: [
        {
            id: "inv-001",
            productId: "prod-001",
            warehouseId: "wh-001",
            warehouseCode: "MERKEZ",
            quantityOnHand: 100,
            quantityReserved: 10,
            quantityAvailable: 90,
            reorderPoint: 20,
            reorderQuantity: 50,
            inventoryPolicy: 1,
            createdAt: NOW,
        },
    ],
    mediaItems: [],
    categoryMaps: [
        {
            id: "cm-001",
            productId: "prod-001",
            productCategoryId: "cat-001",
            categoryCode: "electronics",
            categoryName: "Elektronik",
            isPrimary: true,
            sortOrder: 0,
            createdAt: NOW,
        },
    ],
    bundleItems: [],
    supplierMaps: [
        {
            id: "sm-001",
            productId: "prod-001",
            productSupplierId: "sup-001",
            supplierProductCode: "EXT-001",
            supplierCost: 150,
            leadTimeInDays: 3,
            minOrderQuantity: 5,
            isPreferred: true,
            createdAt: NOW,
        },
    ],
    inventoryTransactions: [],
    inventoryReservations: [],
    priceListItems: [],
    physicalProfile: {
        id: "pp-001",
        productId: "prod-001",
        weight: 1.5,
        width: 30,
        height: 20,
        length: 10,
        requiresShipping: true,
        isFragile: false,
        isHazardous: false,
        requiresSerialNumber: false,
        warrantyInMonths: 24,
        createdAt: NOW,
    },
    softwareProfile: undefined,
    serviceProfile: undefined,
    subscriptionProfile: undefined,
    modules: [],
    productUnits: [],
    softwarePricingTiers: [],
    licenseOfferings: [],
    unitConversions: [],
};

// Yazılım ürünü fixture'ı (kind=2)
export const mockSoftwareProductDetail: ProductDetailDto = {
    ...mockProductDto,
    id: "prod-sw-001",
    productCode: "SW-001",
    name: "CRM Yazılımı",
    kind: 2,
    attributeValues: [],
    variants: [],
    prices: [],
    inventories: [],
    mediaItems: [],
    categoryMaps: [],
    bundleItems: [],
    supplierMaps: [],
    inventoryTransactions: [],
    inventoryReservations: [],
    priceListItems: [],
    physicalProfile: undefined,
    softwareProfile: {
        id: "swp-001",
        productId: "prod-sw-001",
        version: "1.0.0",
        downloadUrl: "https://cdn.example.com/crm-1.0.0.zip",
        supportedPlatformsJson: '["windows","linux"]',
        systemRequirementsJson: '{"ram":"4GB","os":"Windows 10+"}',
        releaseNotes: "İlk sürüm.",
        createdAt: NOW,
    },
    serviceProfile: undefined,
    subscriptionProfile: undefined,
    modules: [
        {
            id: "mod-001",
            productId: "prod-sw-001",
            moduleCode: "CRM-HR",
            name: "İnsan Kaynakları",
            description: "İK modülü",
            currencyCode: "TRY",
            isOptional: true,
            isActive: true,
            sortOrder: 1,
            createdAt: NOW,
        },
        {
            id: "mod-002",
            productId: "prod-sw-001",
            moduleCode: "CRM-ACC",
            name: "Muhasebe",
            description: "Muhasebe modülü",
            currencyCode: "TRY",
            isOptional: true,
            isActive: true,
            sortOrder: 2,
            createdAt: NOW,
        },
    ],
    productUnits: [
        {
            id: "product-unit-user",
            productId: "prod-sw-001",
            unitDefinitionId: "unit-user",
            unitDefinitionCode: "USER",
            unitDefinitionName: "Kullanıcı",
            code: "USER",
            name: "Kullanıcı",
            role: 1,
            isDefault: true,
            isActive: true,
            sortOrder: 0,
            createdAt: NOW,
        },
        {
            id: "product-unit-branch",
            productId: "prod-sw-001",
            unitDefinitionId: "unit-branch",
            unitDefinitionCode: "BRANCH",
            unitDefinitionName: "Şube",
            code: "BRANCH",
            name: "Şube",
            role: 1,
            isDefault: false,
            isActive: true,
            sortOrder: 1,
            createdAt: NOW,
        },
    ],
    softwarePricingTiers: [
        {
            id: "tier-001",
            productId: "prod-sw-001",
            productLicenseOfferingId: "lo-001",
            licenseOfferingName: "Standart Lisans",
            unitDefinitionId: "unit-user",
            unitDefinitionCode: "user",
            unitDefinitionName: "Kullanıcı",
            minUnits: 1,
            maxUnits: 100,
            pricePerUnit: 50,
            flatFee: 0,
            currencyCode: "TRY",
            isActive: true,
            createdAt: NOW,
        },
    ],
    licenseOfferings: [
        {
            id: "lo-001",
            productId: "prod-sw-001",
            productUnitId: "product-unit-user",
            productUnitIds: ["product-unit-user", "product-unit-branch"],
            productUnits: [
                {
                    id: "product-unit-user",
                    productId: "prod-sw-001",
                    unitDefinitionId: "unit-user",
                    unitDefinitionCode: "USER",
                    unitDefinitionName: "Kullanıcı",
                    code: "USER",
                    name: "Kullanıcı",
                    role: 1,
                    isDefault: true,
                    isActive: true,
                    sortOrder: 0,
                    createdAt: NOW,
                },
                {
                    id: "product-unit-branch",
                    productId: "prod-sw-001",
                    unitDefinitionId: "unit-branch",
                    unitDefinitionCode: "BRANCH",
                    unitDefinitionName: "Şube",
                    code: "BRANCH",
                    name: "Şube",
                    role: 1,
                    isDefault: false,
                    isActive: true,
                    sortOrder: 1,
                    createdAt: NOW,
                },
            ],
            productUnitCode: "USER",
            productUnitName: "Kullanıcı",
            unitDefinitionId: "unit-user",
            unitDefinitionCode: "USER",
            unitDefinitionName: "Kullanıcı",
            licenseModel: 1,
            name: "Standart Lisans",
            description: "1 yıllık standart lisans",
            basePrice: 1200,
            currencyCode: "TRY",
            billingPeriodUnit: 3,
            billingPeriodValue: 12,
            autoRenew: true,
            gracePeriodDays: 7,
            trialDays: 14,
            maxSeats: 5,
            isActive: true,
            sortOrder: 1,
            createdAt: NOW,
        },
    ],
    pricingRules: [
        {
            id: "rule-001",
            productId: "prod-sw-001",
            productLicenseOfferingId: "lo-001",
            licenseOfferingName: "Standart Lisans",
            productUnitId: "product-unit-user",
            productUnitIds: ["product-unit-user", "product-unit-branch"],
            productUnits: [
                {
                    id: "product-unit-user",
                    productId: "prod-sw-001",
                    unitDefinitionId: "unit-user",
                    unitDefinitionCode: "USER",
                    unitDefinitionName: "Kullanıcı",
                    code: "USER",
                    name: "Kullanıcı",
                    role: 1,
                    isDefault: true,
                    isActive: true,
                    sortOrder: 0,
                    createdAt: NOW,
                },
                {
                    id: "product-unit-branch",
                    productId: "prod-sw-001",
                    unitDefinitionId: "unit-branch",
                    unitDefinitionCode: "BRANCH",
                    unitDefinitionName: "Şube",
                    code: "BRANCH",
                    name: "Şube",
                    role: 1,
                    isDefault: false,
                    isActive: true,
                    sortOrder: 1,
                    createdAt: NOW,
                },
            ],
            productUnitCode: "USER",
            productUnitName: "Kullanıcı",
            code: "rule-standart",
            name: "Standart kural",
            priority: 10,
            isActive: true,
            priceAdjustment: {
                type: "percentage",
                value: 10,
            },
            createdAt: NOW,
        },
    ],
    unitConversions: [],
};
