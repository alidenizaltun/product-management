import { IAttributeDefinitionRepository } from "@/domain/repositories/IAttributeDefinitionRepository";
import {
  CreateProductAttributeDefinitionRequestDto,
  ProductAttributeDefinitionDto,
  UpdateProductAttributeDefinitionRequestDto,
} from "@/domain/types/productOperations.types";
import { apiClient } from "../apiClient";
import { apiEndpoints } from "../../config/apiEndpoints";

const attr = apiEndpoints.attributes;

export class AttributeDefinitionRepository implements IAttributeDefinitionRepository {
  async list(): Promise<ProductAttributeDefinitionDto[]> {
    return apiClient.get<ProductAttributeDefinitionDto[]>(attr.list);
  }

  async byId(id: string): Promise<ProductAttributeDefinitionDto> {
    return apiClient.get<ProductAttributeDefinitionDto>(attr.byId(id));
  }

  async create(payload: CreateProductAttributeDefinitionRequestDto): Promise<ProductAttributeDefinitionDto> {
    return apiClient.post<ProductAttributeDefinitionDto>(attr.list, payload);
  }

  async update(id: string, payload: UpdateProductAttributeDefinitionRequestDto): Promise<void> {
    await apiClient.put<void>(attr.byId(id), payload);
  }

  async delete(id: string): Promise<void> {
    await apiClient.delete<void>(attr.byId(id));
  }
}

export const attributeDefinitionRepository = new AttributeDefinitionRepository();
