import { IPriceListRepository } from "@/domain/repositories/IPriceListRepository";
import {
  CreateProductPriceListRequestDto,
  ProductPriceListDto,
  ProductPriceListItemDto,
  UpdateProductPriceListRequestDto,
} from "@/domain/types/productOperations.types";
import { apiClient } from "../apiClient";
import { apiEndpoints } from "../../config/apiEndpoints";

const pl = apiEndpoints.priceLists;

export class PriceListRepository implements IPriceListRepository {
  async list(): Promise<ProductPriceListDto[]> {
    return apiClient.get<ProductPriceListDto[]>(pl.list);
  }

  async byId(id: string): Promise<ProductPriceListDto> {
    return apiClient.get<ProductPriceListDto>(pl.byId(id));
  }

  async create(payload: CreateProductPriceListRequestDto): Promise<ProductPriceListDto> {
    return apiClient.post<ProductPriceListDto>(pl.list, payload);
  }

  async update(id: string, payload: UpdateProductPriceListRequestDto): Promise<void> {
    await apiClient.put<void>(pl.byId(id), payload);
  }

  async delete(id: string): Promise<void> {
    await apiClient.delete<void>(pl.byId(id));
  }

  async items(priceListId: string): Promise<ProductPriceListItemDto[]> {
    return apiClient.get<ProductPriceListItemDto[]>(pl.itemsByPriceListId(priceListId));
  }
}

export const priceListRepository = new PriceListRepository();
