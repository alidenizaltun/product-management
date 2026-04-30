import {
  ProductPriceListDto,
  CreateProductPriceListRequestDto,
  UpdateProductPriceListRequestDto,
  ProductPriceListItemDto,
} from "@/shared/types/productOperations.types";
import { apiClient } from "@/shared/api/apiClient";
import { apiEndpoints } from "@/shared/config/apiEndpoints";

const pl = apiEndpoints.priceLists;

export const priceListsApi = {
  list: () => apiClient.get<ProductPriceListDto[]>(pl.list),
  byId: (id: string) => apiClient.get<ProductPriceListDto>(pl.byId(id)),
  create: (payload: CreateProductPriceListRequestDto) =>
    apiClient.post<ProductPriceListDto>(pl.list, payload),
  update: (id: string, payload: UpdateProductPriceListRequestDto) =>
    apiClient.put<void>(pl.byId(id), payload),
  delete: (id: string) => apiClient.delete<void>(pl.byId(id)),
  items: (priceListId: string) =>
    apiClient.get<ProductPriceListItemDto[]>(pl.itemsByPriceListId(priceListId)),
};
