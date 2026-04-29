import {
  ProductDto,
  ProductFilterDto,
  CreateProductRequestDto,
  UpdateProductRequestDto,
  CreateFullProductRequestDto,
  UpdateFullProductRequestDto,
} from "@/domain";
import { apiClient } from "@/infrastructure/api";
import { apiEndpoints } from "@/infrastructure/config";

export interface ProductListResponse {
  items: ProductDto[];
  totalCount: number;
}

const buildQuery = (params?: ProductFilterDto & { page?: number; pageSize?: number }) => {
  if (!params) {
    return "";
  }

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
  getProducts: async (params?: ProductFilterDto & { page?: number; pageSize?: number }): Promise<ProductListResponse> => {
    const endpoint = `${apiEndpoints.productOperations.products.list}${buildQuery(params)}`;
    const response = await apiClient.get<ProductDto[] | ProductListResponse>(endpoint);

    if (Array.isArray(response)) {
      return { items: response, totalCount: response.length };
    }

    return response;
  },

  getProductById: async (id: string): Promise<ProductDto> => {
    return apiClient.get<ProductDto>(apiEndpoints.productOperations.products.byId(id));
  },

  createProduct: async (payload: CreateProductRequestDto): Promise<ProductDto> => {
    return apiClient.post<ProductDto>(apiEndpoints.productOperations.products.list, payload);
  },

  updateProduct: async (id: string, payload: UpdateProductRequestDto): Promise<void> => {
    await apiClient.put<void>(apiEndpoints.productOperations.products.byId(id), payload);
  },

  createFullProduct: async (payload: CreateFullProductRequestDto): Promise<ProductDto> => {
    return apiClient.post<ProductDto>(apiEndpoints.productOperations.products.list, payload);
  },

  updateFullProduct: async (id: string, payload: UpdateFullProductRequestDto): Promise<void> => {
    await apiClient.put<void>(apiEndpoints.productOperations.products.byId(id), payload);
  },
};
