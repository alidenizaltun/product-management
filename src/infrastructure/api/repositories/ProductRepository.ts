import { IProductRepository, ProductListParams, ProductListResponse } from "@/domain/repositories/IProductRepository";
import {
  ProductDto,
  ProductDetailDto,
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
} from "@/domain/types/productOperations.types";
import { apiClient } from "../apiClient";
import { apiEndpoints } from "../../config/apiEndpoints";

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

export class ProductRepository implements IProductRepository {
  async getProducts(params?: ProductListParams): Promise<ProductListResponse> {
    const endpoint = `${apiEndpoints.products.list}${buildQuery(params)}`;
    const response = await apiClient.get<ProductDto[] | ProductListResponse>(endpoint);

    if (Array.isArray(response)) {
      return { items: response, totalCount: response.length };
    }

    return response;
  }

  async getProductById(id: string): Promise<ProductDto> {
    return apiClient.get<ProductDto>(apiEndpoints.products.byId(id));
  }

  async getProductDetail(id: string): Promise<ProductDetailDto> {
    return apiClient.get<ProductDetailDto>(apiEndpoints.products.detail(id));
  }

  async createFullProduct(payload: CreateFullProductRequestDto): Promise<ProductDto> {
    return apiClient.post<ProductDto>(apiEndpoints.products.full, payload);
  }

  async updateFullProduct(id: string, payload: UpdateFullProductRequestDto): Promise<void> {
    await apiClient.put<void>(apiEndpoints.products.fullById(id), payload);
  }

  async deleteProduct(id: string): Promise<void> {
    await apiClient.delete<void>(apiEndpoints.products.byId(id));
  }

  // --- Modules ---
  async getModules(productId: string): Promise<ProductModuleDto[]> {
    return apiClient.get<ProductModuleDto[]>(apiEndpoints.products.modules(productId));
  }

  async createModule(productId: string, payload: Omit<ProductModuleDto, "id" | "productId" | "createdAt" | "updatedAt">): Promise<ProductModuleDto> {
    return apiClient.post<ProductModuleDto>(apiEndpoints.products.modules(productId), payload);
  }

  async updateModule(productId: string, moduleId: string, payload: Partial<ProductModuleDto>): Promise<void> {
    await apiClient.put<void>(apiEndpoints.products.moduleById(productId, moduleId), payload);
  }

  async deleteModule(productId: string, moduleId: string): Promise<void> {
    await apiClient.delete<void>(apiEndpoints.products.moduleById(productId, moduleId));
  }

  // --- Pricing Tiers ---
  async getPricingTiers(productId: string): Promise<SoftwarePricingTierDto[]> {
    return apiClient.get<SoftwarePricingTierDto[]>(apiEndpoints.products.pricingTiers(productId));
  }

  async createPricingTier(productId: string, payload: Omit<SoftwarePricingTierDto, "id" | "productId" | "createdAt" | "updatedAt">): Promise<SoftwarePricingTierDto> {
    return apiClient.post<SoftwarePricingTierDto>(apiEndpoints.products.pricingTiers(productId), payload);
  }

  async updatePricingTier(productId: string, tierId: string, payload: Partial<SoftwarePricingTierDto>): Promise<void> {
    await apiClient.put<void>(apiEndpoints.products.pricingTierById(productId, tierId), payload);
  }

  async deletePricingTier(productId: string, tierId: string): Promise<void> {
    await apiClient.delete<void>(apiEndpoints.products.pricingTierById(productId, tierId));
  }

  // --- Pricing Rules ---
  async getPricingRules(productId: string): Promise<ProductPricingRuleDto[]> {
    return apiClient.get<ProductPricingRuleDto[]>(apiEndpoints.products.pricingRules(productId));
  }

  async getPricingRuleById(pricingRuleId: string): Promise<ProductPricingRuleDto> {
    return apiClient.get<ProductPricingRuleDto>(apiEndpoints.products.pricingRuleById(pricingRuleId));
  }

  async createPricingRule(productId: string, payload: UpsertProductPricingRuleRequestDto): Promise<ProductPricingRuleDto> {
    return apiClient.post<ProductPricingRuleDto>(apiEndpoints.products.pricingRules(productId), payload);
  }

  async updatePricingRule(pricingRuleId: string, payload: UpsertProductPricingRuleRequestDto): Promise<void> {
    await apiClient.put<void>(apiEndpoints.products.pricingRuleById(pricingRuleId), payload);
  }

  async deletePricingRule(pricingRuleId: string): Promise<void> {
    await apiClient.delete<void>(apiEndpoints.products.pricingRuleById(pricingRuleId));
  }

  async reorderPricingRules(productId: string, orderedPricingRuleIds: string[]): Promise<void> {
    await apiClient.put<void>(apiEndpoints.products.reorderPricingRules(productId), { orderedPricingRuleIds });
  }

  // --- Product Units ---
  async getProductUnits(productId: string): Promise<ProductUnitDto[]> {
    return apiClient.get<ProductUnitDto[]>(apiEndpoints.products.productUnits(productId));
  }

  async getProductUnitById(productUnitId: string): Promise<ProductUnitDto> {
    return apiClient.get<ProductUnitDto>(apiEndpoints.products.productUnitById(productUnitId));
  }

  async createProductUnit(productId: string, payload: CreateProductUnitRequestDto): Promise<ProductUnitDto> {
    return apiClient.post<ProductUnitDto>(apiEndpoints.products.productUnits(productId), payload);
  }

  async updateProductUnit(productUnitId: string, payload: UpdateProductUnitRequestDto): Promise<void> {
    await apiClient.put<void>(apiEndpoints.products.productUnitById(productUnitId), payload);
  }

  async deleteProductUnit(productUnitId: string): Promise<void> {
    await apiClient.delete<void>(apiEndpoints.products.productUnitById(productUnitId));
  }

  // --- License Offerings ---
  async getLicenseOfferings(productId: string): Promise<ProductLicenseOfferingDto[]> {
    return apiClient.get<ProductLicenseOfferingDto[]>(apiEndpoints.products.licenseOfferings(productId));
  }

  async createLicenseOffering(productId: string, payload: Omit<ProductLicenseOfferingDto, "id" | "productId" | "createdAt" | "updatedAt">): Promise<ProductLicenseOfferingDto> {
    return apiClient.post<ProductLicenseOfferingDto>(apiEndpoints.products.licenseOfferings(productId), payload);
  }

  async updateLicenseOffering(productId: string, offeringId: string, payload: Partial<ProductLicenseOfferingDto>): Promise<void> {
    await apiClient.put<void>(apiEndpoints.products.licenseOfferingById(productId, offeringId), payload);
  }

  async deleteLicenseOffering(productId: string, offeringId: string): Promise<void> {
    await apiClient.delete<void>(apiEndpoints.products.licenseOfferingById(productId, offeringId));
  }

  // --- Unit Conversions ---
  async getUnitConversions(productId: string): Promise<ProductUnitConversionDto[]> {
    return apiClient.get<ProductUnitConversionDto[]>(apiEndpoints.products.unitConversions(productId));
  }

  async createUnitConversion(productId: string, payload: CreateProductUnitConversionRequestDto): Promise<ProductUnitConversionDto> {
    return apiClient.post<ProductUnitConversionDto>(apiEndpoints.products.unitConversions(productId), payload);
  }

  async updateUnitConversion(productId: string, conversionId: string, payload: CreateProductUnitConversionRequestDto): Promise<void> {
    await apiClient.put<void>(apiEndpoints.products.unitConversionById(productId, conversionId), payload);
  }

  async deleteUnitConversion(productId: string, conversionId: string): Promise<void> {
    await apiClient.delete<void>(apiEndpoints.products.unitConversionById(productId, conversionId));
  }

  // --- Module Offering Prices ---
  async getModuleOfferingPrices(productId: string, moduleId: string): Promise<ProductModuleOfferingPriceDto[]> {
    return apiClient.get<ProductModuleOfferingPriceDto[]>(apiEndpoints.products.moduleOfferingPrices(productId, moduleId));
  }

  async createModuleOfferingPrice(productId: string, moduleId: string, payload: CreateProductModuleOfferingPriceRequest): Promise<ProductModuleOfferingPriceDto> {
    return apiClient.post<ProductModuleOfferingPriceDto>(apiEndpoints.products.moduleOfferingPrices(productId, moduleId), payload);
  }

  async updateModuleOfferingPrice(productId: string, moduleId: string, priceId: string, payload: UpdateProductModuleOfferingPriceRequest): Promise<void> {
    await apiClient.put<void>(apiEndpoints.products.moduleOfferingPriceById(productId, moduleId, priceId), payload);
  }

  async deleteModuleOfferingPrice(productId: string, moduleId: string, priceId: string): Promise<void> {
    await apiClient.delete<void>(apiEndpoints.products.moduleOfferingPriceById(productId, moduleId, priceId));
  }
}

export const productRepository = new ProductRepository();
