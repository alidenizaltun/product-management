import { IInventoryRepository } from "@/domain/repositories/IInventoryRepository";
import { ProductInventoryDto, ProductInventoryFilterDto } from "@/domain/types/productOperations.types";
import { apiClient } from "../apiClient";
import { apiEndpoints } from "../../config/apiEndpoints";

const inv = apiEndpoints.inventory;

const buildQuery = (params?: Record<string, unknown>) => {
  if (!params) return "";
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      search.append(key, String(value));
    }
  });
  const qs = search.toString();
  return qs ? `?${qs}` : "";
};

export class InventoryRepository implements IInventoryRepository {
  async getAll(filter?: ProductInventoryFilterDto): Promise<ProductInventoryDto[]> {
    return apiClient.get<ProductInventoryDto[]>(`${inv.inventories}${buildQuery(filter as Record<string, unknown>)}`);
  }

  async getById(id: string): Promise<ProductInventoryDto> {
    return apiClient.get<ProductInventoryDto>(inv.inventoryById(id));
  }
}

export const inventoryRepository = new InventoryRepository();
