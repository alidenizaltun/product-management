import {
  ProductAttributeDefinitionDto,
  CreateProductAttributeDefinitionRequestDto,
  UpdateProductAttributeDefinitionRequestDto,
} from "@/domain";
import { apiClient } from "@/infrastructure/api";
import { apiEndpoints } from "@/infrastructure/config";

const attr = apiEndpoints.productOperations.attributes;

export const attributeDefinitionsApi = {
  list: () => apiClient.get<ProductAttributeDefinitionDto[]>(attr.list),
  byId: (id: string) => apiClient.get<ProductAttributeDefinitionDto>(attr.byId(id)),
  create: (payload: CreateProductAttributeDefinitionRequestDto) =>
    apiClient.post<ProductAttributeDefinitionDto>(attr.list, payload),
  update: (id: string, payload: UpdateProductAttributeDefinitionRequestDto) =>
    apiClient.put<void>(attr.byId(id), payload),
  delete: (id: string) => apiClient.delete<void>(attr.byId(id)),
};
