import {
  InventoryReservationDto,
  InventoryReservationFilterDto,
  UpdateInventoryReservationStatusRequestDto,
} from "../types/productOperations.types";

export interface IInventoryReservationRepository {
  getAll(filter?: InventoryReservationFilterDto): Promise<InventoryReservationDto[]>;
  getById(id: string): Promise<InventoryReservationDto>;
  updateStatus(id: string, payload: UpdateInventoryReservationStatusRequestDto): Promise<void>;
}
