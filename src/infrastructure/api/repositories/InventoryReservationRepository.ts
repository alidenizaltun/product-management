import { IInventoryReservationRepository } from "@/domain/repositories/IInventoryReservationRepository";
import {
  InventoryReservationDto,
  InventoryReservationFilterDto,
  UpdateInventoryReservationStatusRequestDto,
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

export class InventoryReservationRepository implements IInventoryReservationRepository {
  async getAll(filter?: InventoryReservationFilterDto): Promise<InventoryReservationDto[]> {
    return apiClient.get<InventoryReservationDto[]>(`${inv.reservations}${buildQuery(filter as Record<string, unknown>)}`);
  }

  async getById(id: string): Promise<InventoryReservationDto> {
    return apiClient.get<InventoryReservationDto>(inv.reservationById(id));
  }

  async updateStatus(id: string, payload: UpdateInventoryReservationStatusRequestDto): Promise<void> {
    await apiClient.patch<void>(inv.reservationStatus(id), payload);
  }
}

export const inventoryReservationRepository = new InventoryReservationRepository();
