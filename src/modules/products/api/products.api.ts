import {
  ProductDto,
  ProductDetailDto,
  ProductFilterDto,
  CreateFullProductRequestDto,
  UpdateFullProductRequestDto,
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
};
