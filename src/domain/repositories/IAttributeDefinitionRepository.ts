import {
  CreateProductAttributeDefinitionRequestDto,
  ProductAttributeDefinitionDto,
  UpdateProductAttributeDefinitionRequestDto,
} from "../types/productOperations.types";

export interface IAttributeDefinitionRepository {
  list(): Promise<ProductAttributeDefinitionDto[]>;
  byId(id: string): Promise<ProductAttributeDefinitionDto>;
  create(payload: CreateProductAttributeDefinitionRequestDto): Promise<ProductAttributeDefinitionDto>;
  update(id: string, payload: UpdateProductAttributeDefinitionRequestDto): Promise<void>;
  delete(id: string): Promise<void>;
}
