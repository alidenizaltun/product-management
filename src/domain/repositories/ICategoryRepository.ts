import { CreateProductCategoryRequestDto, ProductCategoryDto, UpdateProductCategoryRequestDto } from "../types/productOperations.types";

export interface ICategoryRepository {
  list(): Promise<ProductCategoryDto[]>;
  byId(id: string): Promise<ProductCategoryDto>;
  create(payload: CreateProductCategoryRequestDto): Promise<ProductCategoryDto>;
  update(id: string, payload: UpdateProductCategoryRequestDto): Promise<void>;
  delete(id: string): Promise<void>;
}
