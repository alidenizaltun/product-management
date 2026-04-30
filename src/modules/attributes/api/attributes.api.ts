import {
  ProductAttributeDefinitionDto,
  CreateProductAttributeDefinitionRequestDto,
  UpdateProductAttributeDefinitionRequestDto,
} from "@/shared/types/productOperations.types";
import { apiClient } from "@/shared/api/apiClient";
import { apiEndpoints } from "@/shared/config/apiEndpoints";

const attr = apiEndpoints.attributes;

export const attributeDefinitionsApi = {
  list: () => apiClient.get<ProductAttributeDefinitionDto[]>(attr.list),
  byId: (id: string) => apiClient.get<ProductAttributeDefinitionDto>(attr.byId(id)),
  create: (payload: CreateProductAttributeDefinitionRequestDto) =>
    apiClient.post<ProductAttributeDefinitionDto>(attr.list, payload),
  update: (id: string, payload: UpdateProductAttributeDefinitionRequestDto) =>
    apiClient.put<void>(attr.byId(id), payload),
  delete: (id: string) => apiClient.delete<void>(attr.byId(id)),
};
