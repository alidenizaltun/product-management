import { CreateProductSupplierRequestDto, ProductSupplierDto, UpdateProductSupplierRequestDto } from "../types/productOperations.types";

export interface ISupplierRepository {
  list(): Promise<ProductSupplierDto[]>;
  byId(id: string): Promise<ProductSupplierDto>;
  create(payload: CreateProductSupplierRequestDto): Promise<ProductSupplierDto>;
  update(id: string, payload: UpdateProductSupplierRequestDto): Promise<void>;
  delete(id: string): Promise<void>;
}
