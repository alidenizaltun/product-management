import {
  ProductInventoryDto,
  ProductInventoryFilterDto,
  InventoryTransactionDto,
  InventoryTransactionFilterDto,
  CreateInventoryTransactionRequestDto,
  InventoryReservationDto,
  InventoryReservationFilterDto,
  UpdateInventoryReservationStatusRequestDto,
} from "@/shared/types/productOperations.types";
import { apiClient } from "@/shared/api/apiClient";
import { apiEndpoints } from "@/shared/config/apiEndpoints";

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

export const inventoryApi = {
  inventories: (filter?: ProductInventoryFilterDto) =>
    apiClient.get<ProductInventoryDto[]>(`${inv.inventories}${buildQuery(filter as Record<string, unknown>)}`),
  inventoryById: (id: string) => apiClient.get<ProductInventoryDto>(inv.inventoryById(id)),

  transactions: (filter?: InventoryTransactionFilterDto) =>
    apiClient.get<InventoryTransactionDto[]>(`${inv.transactions}${buildQuery(filter as Record<string, unknown>)}`),
  createTransaction: (payload: CreateInventoryTransactionRequestDto) =>
    apiClient.post<InventoryTransactionDto>(inv.transactions, payload),

  reservations: (filter?: InventoryReservationFilterDto) =>
    apiClient.get<InventoryReservationDto[]>(`${inv.reservations}${buildQuery(filter as Record<string, unknown>)}`),
  reservationById: (id: string) => apiClient.get<InventoryReservationDto>(inv.reservationById(id)),
  updateReservationStatus: (id: string, payload: UpdateInventoryReservationStatusRequestDto) =>
    apiClient.patch<void>(inv.reservationStatus(id), payload),
};
