import {
  ProductPriceListDto,
  CreateProductPriceListRequestDto,
  UpdateProductPriceListRequestDto,
  ProductPriceListItemDto,
} from "@/domain";
import { apiClient } from "@/infrastructure/api";
import { apiEndpoints } from "@/infrastructure/config";

const pl = apiEndpoints.productOperations.priceLists;

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
