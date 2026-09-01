import {
  CreateInventoryTransactionRequestDto,
  InventoryTransactionDto,
  InventoryTransactionFilterDto,
} from "../types/productOperations.types";

export interface IInventoryTransactionRepository {
  getAll(filter?: InventoryTransactionFilterDto): Promise<InventoryTransactionDto[]>;
  create(payload: CreateInventoryTransactionRequestDto): Promise<InventoryTransactionDto>;
}
