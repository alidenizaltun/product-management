import { CreateWarehouseRequestDto, UpdateWarehouseRequestDto, WarehouseDto } from "../types/productOperations.types";

export interface IWarehouseRepository {
  list(): Promise<WarehouseDto[]>;
  byId(id: string): Promise<WarehouseDto>;
  create(payload: CreateWarehouseRequestDto): Promise<WarehouseDto>;
  update(id: string, payload: UpdateWarehouseRequestDto): Promise<void>;
  delete(id: string): Promise<void>;
}
