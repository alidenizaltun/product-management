import { ISupplierRepository } from "@/domain/repositories/ISupplierRepository";
import { CreateProductSupplierRequestDto, ProductSupplierDto, UpdateProductSupplierRequestDto } from "@/domain/types/productOperations.types";
import { apiClient } from "../apiClient";
import { apiEndpoints } from "../../config/apiEndpoints";

const cat = apiEndpoints.catalog;

export class SupplierRepository implements ISupplierRepository {
  async list(): Promise<ProductSupplierDto[]> {
    return apiClient.get<ProductSupplierDto[]>(cat.suppliers);
  }

  async byId(id: string): Promise<ProductSupplierDto> {
    return apiClient.get<ProductSupplierDto>(cat.supplierById(id));
  }

  async create(payload: CreateProductSupplierRequestDto): Promise<ProductSupplierDto> {
    return apiClient.post<ProductSupplierDto>(cat.suppliers, payload);
  }

  async update(id: string, payload: UpdateProductSupplierRequestDto): Promise<void> {
    await apiClient.put<void>(cat.supplierById(id), payload);
  }

  async delete(id: string): Promise<void> {
    await apiClient.delete<void>(cat.supplierById(id));
  }
}

export const supplierRepository = new SupplierRepository();
