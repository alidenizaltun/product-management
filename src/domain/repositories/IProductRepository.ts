import {
  ProductDto,
  ProductDetailDto,
  ProductFilterDto,
  CreateFullProductRequestDto,
  UpdateFullProductRequestDto,
  ProductModuleDto,
  SoftwarePricingTierDto,
  ProductPricingRuleDto,
  UpsertProductPricingRuleRequestDto,
  ProductLicenseOfferingDto,
  ProductUnitDto,
  CreateProductUnitRequestDto,
  UpdateProductUnitRequestDto,
  ProductUnitConversionDto,
  CreateProductUnitConversionRequestDto,
  ProductModuleOfferingPriceDto,
  CreateProductModuleOfferingPriceRequest,
  UpdateProductModuleOfferingPriceRequest,
} from "../types/productOperations.types";

export interface ProductListResponse {
  items: ProductDto[];
  totalCount: number;
}

export type ProductListParams = ProductFilterDto & { page?: number; pageSize?: number };

export interface IProductRepository {
  getProducts(params?: ProductListParams): Promise<ProductListResponse>;
  getProductById(id: string): Promise<ProductDto>;
  getProductDetail(id: string): Promise<ProductDetailDto>;
  createFullProduct(payload: CreateFullProductRequestDto): Promise<ProductDto>;
  updateFullProduct(id: string, payload: UpdateFullProductRequestDto): Promise<void>;
  deleteProduct(id: string): Promise<void>;

  getModules(productId: string): Promise<ProductModuleDto[]>;
  createModule(productId: string, payload: Omit<ProductModuleDto, "id" | "productId" | "createdAt" | "updatedAt">): Promise<ProductModuleDto>;
  updateModule(productId: string, moduleId: string, payload: Partial<ProductModuleDto>): Promise<void>;
  deleteModule(productId: string, moduleId: string): Promise<void>;

  getPricingTiers(productId: string): Promise<SoftwarePricingTierDto[]>;
  createPricingTier(productId: string, payload: Omit<SoftwarePricingTierDto, "id" | "productId" | "createdAt" | "updatedAt">): Promise<SoftwarePricingTierDto>;
  updatePricingTier(productId: string, tierId: string, payload: Partial<SoftwarePricingTierDto>): Promise<void>;
  deletePricingTier(productId: string, tierId: string): Promise<void>;

  getPricingRules(productId: string): Promise<ProductPricingRuleDto[]>;
  getPricingRuleById(pricingRuleId: string): Promise<ProductPricingRuleDto>;
  createPricingRule(productId: string, payload: UpsertProductPricingRuleRequestDto): Promise<ProductPricingRuleDto>;
  updatePricingRule(pricingRuleId: string, payload: UpsertProductPricingRuleRequestDto): Promise<void>;
  deletePricingRule(pricingRuleId: string): Promise<void>;
  reorderPricingRules(productId: string, orderedPricingRuleIds: string[]): Promise<void>;

  getProductUnits(productId: string): Promise<ProductUnitDto[]>;
  getProductUnitById(productUnitId: string): Promise<ProductUnitDto>;
  createProductUnit(productId: string, payload: CreateProductUnitRequestDto): Promise<ProductUnitDto>;
  updateProductUnit(productUnitId: string, payload: UpdateProductUnitRequestDto): Promise<void>;
  deleteProductUnit(productUnitId: string): Promise<void>;

  getLicenseOfferings(productId: string): Promise<ProductLicenseOfferingDto[]>;
  createLicenseOffering(productId: string, payload: Omit<ProductLicenseOfferingDto, "id" | "productId" | "createdAt" | "updatedAt">): Promise<ProductLicenseOfferingDto>;
  updateLicenseOffering(productId: string, offeringId: string, payload: Partial<ProductLicenseOfferingDto>): Promise<void>;
  deleteLicenseOffering(productId: string, offeringId: string): Promise<void>;

  getUnitConversions(productId: string): Promise<ProductUnitConversionDto[]>;
  createUnitConversion(productId: string, payload: CreateProductUnitConversionRequestDto): Promise<ProductUnitConversionDto>;
  updateUnitConversion(productId: string, conversionId: string, payload: CreateProductUnitConversionRequestDto): Promise<void>;
  deleteUnitConversion(productId: string, conversionId: string): Promise<void>;

  getModuleOfferingPrices(productId: string, moduleId: string): Promise<ProductModuleOfferingPriceDto[]>;
  createModuleOfferingPrice(productId: string, moduleId: string, payload: CreateProductModuleOfferingPriceRequest): Promise<ProductModuleOfferingPriceDto>;
  updateModuleOfferingPrice(productId: string, moduleId: string, priceId: string, payload: UpdateProductModuleOfferingPriceRequest): Promise<void>;
  deleteModuleOfferingPrice(productId: string, moduleId: string, priceId: string): Promise<void>;
}
