import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  inventoryRepository,
  inventoryTransactionRepository,
  inventoryReservationRepository,
} from "@/infrastructure/api/repositories";
import {
  ProductInventoryFilterDto,
  InventoryTransactionFilterDto,
  CreateInventoryTransactionRequestDto,
  InventoryReservationFilterDto,
  UpdateInventoryReservationStatusRequestDto,
} from "@/domain/types/productOperations.types";

export const inventoryKeys = {
  inventories: (filter?: ProductInventoryFilterDto) =>
    ["inventory", "inventories", filter ?? {}] as const,
  inventory: (id: string) => ["inventory", "inventories", id] as const,
  transactions: (filter?: InventoryTransactionFilterDto) =>
    ["inventory", "transactions", filter ?? {}] as const,
  reservations: (filter?: InventoryReservationFilterDto) =>
    ["inventory", "reservations", filter ?? {}] as const,
  reservation: (id: string) => ["inventory", "reservations", id] as const,
};

export const useInventories = (filter?: ProductInventoryFilterDto) =>
  useQuery({
    queryKey: inventoryKeys.inventories(filter),
    queryFn: () => inventoryRepository.getAll(filter),
  });

export const useInventoryTransactions = (filter?: InventoryTransactionFilterDto) =>
  useQuery({
    queryKey: inventoryKeys.transactions(filter),
    queryFn: () => inventoryTransactionRepository.getAll(filter),
  });

export const useInventoryReservations = (filter?: InventoryReservationFilterDto) =>
  useQuery({
    queryKey: inventoryKeys.reservations(filter),
    queryFn: () => inventoryReservationRepository.getAll(filter),
  });

export const useInventoryReservation = (id?: string) =>
  useQuery({
    queryKey: id ? inventoryKeys.reservation(id) : ["inventory", "reservations", "missing"],
    queryFn: () => inventoryReservationRepository.getById(id as string),
    enabled: Boolean(id),
  });

export const useInventoryTransactionMutations = () => {
  const qc = useQueryClient();
  return {
    create: useMutation({
      mutationFn: (payload: CreateInventoryTransactionRequestDto) =>
        inventoryTransactionRepository.create(payload),
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: ["inventory"] });
      },
    }),
  };
};

export const useInventoryReservationMutations = () => {
  const qc = useQueryClient();
  return {
    updateStatus: useMutation({
      mutationFn: (vars: { id: string; payload: UpdateInventoryReservationStatusRequestDto }) =>
        inventoryReservationRepository.updateStatus(vars.id, vars.payload),
      onSuccess: () => qc.invalidateQueries({ queryKey: ["inventory", "reservations"] }),
    }),
  };
};
