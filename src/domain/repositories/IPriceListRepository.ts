import {
  CreateProductPriceListRequestDto,
  ProductPriceListDto,
  ProductPriceListItemDto,
  UpdateProductPriceListRequestDto,
} from "../types/productOperations.types";

export interface IPriceListRepository {
  list(): Promise<ProductPriceListDto[]>;
  byId(id: string): Promise<ProductPriceListDto>;
  create(payload: CreateProductPriceListRequestDto): Promise<ProductPriceListDto>;
  update(id: string, payload: UpdateProductPriceListRequestDto): Promise<void>;
  delete(id: string): Promise<void>;
  items(priceListId: string): Promise<ProductPriceListItemDto[]>;
}
