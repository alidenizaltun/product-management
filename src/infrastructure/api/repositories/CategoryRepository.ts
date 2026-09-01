import { ICategoryRepository } from "@/domain/repositories/ICategoryRepository";
import { CreateProductCategoryRequestDto, ProductCategoryDto, UpdateProductCategoryRequestDto } from "@/domain/types/productOperations.types";
import { apiClient } from "../apiClient";
import { apiEndpoints } from "../../config/apiEndpoints";

const cat = apiEndpoints.catalog;

export class CategoryRepository implements ICategoryRepository {
  async list(): Promise<ProductCategoryDto[]> {
    return apiClient.get<ProductCategoryDto[]>(cat.categories);
  }

  async byId(id: string): Promise<ProductCategoryDto> {
    return apiClient.get<ProductCategoryDto>(cat.categoryById(id));
  }

  async create(payload: CreateProductCategoryRequestDto): Promise<ProductCategoryDto> {
    return apiClient.post<ProductCategoryDto>(cat.categories, payload);
  }

  async update(id: string, payload: UpdateProductCategoryRequestDto): Promise<void> {
    await apiClient.put<void>(cat.categoryById(id), payload);
  }

  async delete(id: string): Promise<void> {
    await apiClient.delete<void>(cat.categoryById(id));
  }
}

export const categoryRepository = new CategoryRepository();
