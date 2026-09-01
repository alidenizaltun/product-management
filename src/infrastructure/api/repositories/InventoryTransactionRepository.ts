import { IInventoryTransactionRepository } from "@/domain/repositories/IInventoryTransactionRepository";
import {
  CreateInventoryTransactionRequestDto,
  InventoryTransactionDto,
  InventoryTransactionFilterDto,
} from "@/domain/types/productOperations.types";
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

export class InventoryTransactionRepository implements IInventoryTransactionRepository {
  async getAll(filter?: InventoryTransactionFilterDto): Promise<InventoryTransactionDto[]> {
    return apiClient.get<InventoryTransactionDto[]>(`${inv.transactions}${buildQuery(filter as Record<string, unknown>)}`);
  }

  async create(payload: CreateInventoryTransactionRequestDto): Promise<InventoryTransactionDto> {
    return apiClient.post<InventoryTransactionDto>(inv.transactions, payload);
  }
}

export const inventoryTransactionRepository = new InventoryTransactionRepository();
