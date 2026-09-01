import { IWarehouseRepository } from "@/domain/repositories/IWarehouseRepository";
import { CreateWarehouseRequestDto, UpdateWarehouseRequestDto, WarehouseDto } from "@/domain/types/productOperations.types";
import { apiClient } from "../apiClient";
import { apiEndpoints } from "../../config/apiEndpoints";

const cat = apiEndpoints.catalog;

export class WarehouseRepository implements IWarehouseRepository {
  async list(): Promise<WarehouseDto[]> {
    return apiClient.get<WarehouseDto[]>(cat.warehouses);
  }

  async byId(id: string): Promise<WarehouseDto> {
    return apiClient.get<WarehouseDto>(cat.warehouseById(id));
  }

  async create(payload: CreateWarehouseRequestDto): Promise<WarehouseDto> {
    return apiClient.post<WarehouseDto>(cat.warehouses, payload);
  }

  async update(id: string, payload: UpdateWarehouseRequestDto): Promise<void> {
    await apiClient.put<void>(cat.warehouseById(id), payload);
  }

  async delete(id: string): Promise<void> {
    await apiClient.delete<void>(cat.warehouseById(id));
  }
}

export const warehouseRepository = new WarehouseRepository();
