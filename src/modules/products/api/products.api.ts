import {
  ProductDto,
  ProductFilterDto,
  CreateFullProductRequestDto,
  UpdateFullProductRequestDto,
} from "@/domain";
import { apiClient } from "@/infrastructure/api";
import { apiEndpoints } from "@/infrastructure/config";

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

  createFullProduct: async (payload: CreateFullProductRequestDto): Promise<ProductDto> => {
    return apiClient.post<ProductDto>(apiEndpoints.productOperations.products.full, payload);
  },

  updateFullProduct: async (id: string, payload: UpdateFullProductRequestDto): Promise<void> => {
    await apiClient.put<void>(apiEndpoints.productOperations.products.fullById(id), payload);
  },

  deleteProduct: async (id: string): Promise<void> => {
    await apiClient.delete<void>(apiEndpoints.productOperations.products.byId(id));
  },
};
