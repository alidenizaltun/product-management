import { ProductInventoryDto, ProductInventoryFilterDto } from "../types/productOperations.types";

export interface IInventoryRepository {
  getAll(filter?: ProductInventoryFilterDto): Promise<ProductInventoryDto[]>;
  getById(id: string): Promise<ProductInventoryDto>;
}
