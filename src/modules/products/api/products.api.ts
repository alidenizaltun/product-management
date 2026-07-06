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
} from "@/shared/types/productOperations.types";
import { apiClient } from "@/shared/api/apiClient";
import { apiEndpoints } from "@/shared/config/apiEndpoints";

export interface ProductListResponse {
  items: ProductDto[];
  totalCount: number;
}

export type ProductListParams = ProductFilterDto & { page?: number; pageSize?: number };

const buildQuery = (params?: ProductListParams) => {
  if (!params) return "";

  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      search.append(key, String(value));
    }
  });

  const qs = search.toString();
  return qs ? `?${qs}` : "";
};

export const productsApi = {
  getProducts: async (params?: ProductListParams): Promise<ProductListResponse> => {
    const endpoint = `${apiEndpoints.products.list}${buildQuery(params)}`;
    const response = await apiClient.get<ProductDto[] | ProductListResponse>(endpoint);

    if (Array.isArray(response)) {
      return { items: response, totalCount: response.length };
    }

    return response;
  },

  getProductById: async (id: string): Promise<ProductDto> => {
    return apiClient.get<ProductDto>(apiEndpoints.products.byId(id));
  },

  getProductDetail: async (id: string): Promise<ProductDetailDto> => {
    return apiClient.get<ProductDetailDto>(apiEndpoints.products.detail(id));
  },

  createFullProduct: async (payload: CreateFullProductRequestDto): Promise<ProductDto> => {
    return apiClient.post<ProductDto>(apiEndpoints.products.full, payload);
  },

  updateFullProduct: async (id: string, payload: UpdateFullProductRequestDto): Promise<void> => {
    await apiClient.put<void>(apiEndpoints.products.fullById(id), payload);
  },

  deleteProduct: async (id: string): Promise<void> => {
    await apiClient.delete<void>(apiEndpoints.products.byId(id));
  },

  // --- Modules ---
  getModules: async (productId: string): Promise<ProductModuleDto[]> => {
    return apiClient.get<ProductModuleDto[]>(apiEndpoints.products.modules(productId));
  },

  createModule: async (productId: string, payload: Omit<ProductModuleDto, "id" | "productId" | "createdAt" | "updatedAt">): Promise<ProductModuleDto> => {
    return apiClient.post<ProductModuleDto>(apiEndpoints.products.modules(productId), payload);
  },

  updateModule: async (productId: string, moduleId: string, payload: Partial<ProductModuleDto>): Promise<void> => {
    await apiClient.put<void>(apiEndpoints.products.moduleById(productId, moduleId), payload);
  },

  deleteModule: async (productId: string, moduleId: string): Promise<void> => {
    await apiClient.delete<void>(apiEndpoints.products.moduleById(productId, moduleId));
  },

  // --- Pricing Tiers ---
  getPricingTiers: async (productId: string): Promise<SoftwarePricingTierDto[]> => {
    return apiClient.get<SoftwarePricingTierDto[]>(apiEndpoints.products.pricingTiers(productId));
  },

  createPricingTier: async (productId: string, payload: Omit<SoftwarePricingTierDto, "id" | "productId" | "createdAt" | "updatedAt">): Promise<SoftwarePricingTierDto> => {
    return apiClient.post<SoftwarePricingTierDto>(apiEndpoints.products.pricingTiers(productId), payload);
  },

  updatePricingTier: async (productId: string, tierId: string, payload: Partial<SoftwarePricingTierDto>): Promise<void> => {
    await apiClient.put<void>(apiEndpoints.products.pricingTierById(productId, tierId), payload);
  },

  deletePricingTier: async (productId: string, tierId: string): Promise<void> => {
    await apiClient.delete<void>(apiEndpoints.products.pricingTierById(productId, tierId));
  },

  // --- Pricing Rules ---
  getPricingRules: async (productId: string): Promise<ProductPricingRuleDto[]> => {
    return apiClient.get<ProductPricingRuleDto[]>(apiEndpoints.products.pricingRules(productId));
  },

  getPricingRuleById: async (pricingRuleId: string): Promise<ProductPricingRuleDto> => {
    return apiClient.get<ProductPricingRuleDto>(apiEndpoints.products.pricingRuleById(pricingRuleId));
  },

  createPricingRule: async (productId: string, payload: UpsertProductPricingRuleRequestDto): Promise<ProductPricingRuleDto> => {
    return apiClient.post<ProductPricingRuleDto>(apiEndpoints.products.pricingRules(productId), payload);
  },

  updatePricingRule: async (pricingRuleId: string, payload: UpsertProductPricingRuleRequestDto): Promise<void> => {
    await apiClient.put<void>(apiEndpoints.products.pricingRuleById(pricingRuleId), payload);
  },

  deletePricingRule: async (pricingRuleId: string): Promise<void> => {
    await apiClient.delete<void>(apiEndpoints.products.pricingRuleById(pricingRuleId));
  },

  // --- Product Units ---
  getProductUnits: async (productId: string): Promise<ProductUnitDto[]> => {
    return apiClient.get<ProductUnitDto[]>(apiEndpoints.products.productUnits(productId));
  },

  getProductUnitById: async (productUnitId: string): Promise<ProductUnitDto> => {
    return apiClient.get<ProductUnitDto>(apiEndpoints.products.productUnitById(productUnitId));
  },

  createProductUnit: async (productId: string, payload: CreateProductUnitRequestDto): Promise<ProductUnitDto> => {
    return apiClient.post<ProductUnitDto>(apiEndpoints.products.productUnits(productId), payload);
  },

  updateProductUnit: async (productUnitId: string, payload: UpdateProductUnitRequestDto): Promise<void> => {
    await apiClient.put<void>(apiEndpoints.products.productUnitById(productUnitId), payload);
  },

  deleteProductUnit: async (productUnitId: string): Promise<void> => {
    await apiClient.delete<void>(apiEndpoints.products.productUnitById(productUnitId));
  },

  // --- License Offerings ---
  getLicenseOfferings: async (productId: string): Promise<ProductLicenseOfferingDto[]> => {
    return apiClient.get<ProductLicenseOfferingDto[]>(apiEndpoints.products.licenseOfferings(productId));
  },

  createLicenseOffering: async (productId: string, payload: Omit<ProductLicenseOfferingDto, "id" | "productId" | "createdAt" | "updatedAt">): Promise<ProductLicenseOfferingDto> => {
    return apiClient.post<ProductLicenseOfferingDto>(apiEndpoints.products.licenseOfferings(productId), payload);
  },

  updateLicenseOffering: async (productId: string, offeringId: string, payload: Partial<ProductLicenseOfferingDto>): Promise<void> => {
    await apiClient.put<void>(apiEndpoints.products.licenseOfferingById(productId, offeringId), payload);
  },

  deleteLicenseOffering: async (productId: string, offeringId: string): Promise<void> => {
    await apiClient.delete<void>(apiEndpoints.products.licenseOfferingById(productId, offeringId));
  },

  // --- Unit Conversions ---
  getUnitConversions: async (productId: string): Promise<ProductUnitConversionDto[]> => {
    return apiClient.get<ProductUnitConversionDto[]>(apiEndpoints.products.unitConversions(productId));
  },

  createUnitConversion: async (productId: string, payload: CreateProductUnitConversionRequestDto): Promise<ProductUnitConversionDto> => {
    return apiClient.post<ProductUnitConversionDto>(apiEndpoints.products.unitConversions(productId), payload);
  },

  updateUnitConversion: async (productId: string, conversionId: string, payload: CreateProductUnitConversionRequestDto): Promise<void> => {
    await apiClient.put<void>(apiEndpoints.products.unitConversionById(productId, conversionId), payload);
  },

  deleteUnitConversion: async (productId: string, conversionId: string): Promise<void> => {
    await apiClient.delete<void>(apiEndpoints.products.unitConversionById(productId, conversionId));
  },

  // --- Module Offering Prices ---
  getModuleOfferingPrices: async (productId: string, moduleId: string): Promise<ProductModuleOfferingPriceDto[]> => {
    return apiClient.get<ProductModuleOfferingPriceDto[]>(apiEndpoints.products.moduleOfferingPrices(productId, moduleId));
  },

  createModuleOfferingPrice: async (productId: string, moduleId: string, payload: CreateProductModuleOfferingPriceRequest): Promise<ProductModuleOfferingPriceDto> => {
    return apiClient.post<ProductModuleOfferingPriceDto>(apiEndpoints.products.moduleOfferingPrices(productId, moduleId), payload);
  },

  updateModuleOfferingPrice: async (productId: string, moduleId: string, priceId: string, payload: UpdateProductModuleOfferingPriceRequest): Promise<void> => {
    await apiClient.put<void>(apiEndpoints.products.moduleOfferingPriceById(productId, moduleId, priceId), payload);
  },

  deleteModuleOfferingPrice: async (productId: string, moduleId: string, priceId: string): Promise<void> => {
    await apiClient.delete<void>(apiEndpoints.products.moduleOfferingPriceById(productId, moduleId, priceId));
  },
};
