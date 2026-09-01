import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { categoryRepository, supplierRepository, warehouseRepository } from "@/infrastructure/api/repositories";
import {
  CreateProductCategoryRequestDto,
  CreateProductSupplierRequestDto,
  CreateWarehouseRequestDto,
  UpdateProductCategoryRequestDto,
  UpdateProductSupplierRequestDto,
  UpdateWarehouseRequestDto,
} from "@/domain/types/productOperations.types";

export const catalogKeys = {
  categories: ["catalog", "categories"] as const,
  category: (id: string) => ["catalog", "categories", id] as const,
  suppliers: ["catalog", "suppliers"] as const,
  supplier: (id: string) => ["catalog", "suppliers", id] as const,
  warehouses: ["catalog", "warehouses"] as const,
  warehouse: (id: string) => ["catalog", "warehouses", id] as const,
};

export const useCategories = () =>
  useQuery({ queryKey: catalogKeys.categories, queryFn: () => categoryRepository.list() });

export const useCategory = (id?: string) =>
  useQuery({
    queryKey: id ? catalogKeys.category(id) : ["catalog", "categories", "missing"],
    queryFn: () => categoryRepository.byId(id as string),
    enabled: Boolean(id),
  });

export const useCategoryMutations = () => {
  const qc = useQueryClient();
  return {
    create: useMutation({
      mutationFn: (payload: CreateProductCategoryRequestDto) => categoryRepository.create(payload),
      onSuccess: () => qc.invalidateQueries({ queryKey: catalogKeys.categories }),
    }),
    update: useMutation({
      mutationFn: (vars: { id: string; payload: UpdateProductCategoryRequestDto }) =>
        categoryRepository.update(vars.id, vars.payload),
      onSuccess: (_d, vars) => {
        qc.invalidateQueries({ queryKey: catalogKeys.categories });
        qc.invalidateQueries({ queryKey: catalogKeys.category(vars.id) });
      },
    }),
    remove: useMutation({
      mutationFn: (id: string) => categoryRepository.delete(id),
      onSuccess: () => qc.invalidateQueries({ queryKey: catalogKeys.categories }),
    }),
  };
};

export const useSuppliers = () =>
  useQuery({ queryKey: catalogKeys.suppliers, queryFn: () => supplierRepository.list() });

export const useSupplier = (id?: string) =>
  useQuery({
    queryKey: id ? catalogKeys.supplier(id) : ["catalog", "suppliers", "missing"],
    queryFn: () => supplierRepository.byId(id as string),
    enabled: Boolean(id),
  });

export const useSupplierMutations = () => {
  const qc = useQueryClient();
  return {
    create: useMutation({
      mutationFn: (payload: CreateProductSupplierRequestDto) => supplierRepository.create(payload),
      onSuccess: () => qc.invalidateQueries({ queryKey: catalogKeys.suppliers }),
    }),
    update: useMutation({
      mutationFn: (vars: { id: string; payload: UpdateProductSupplierRequestDto }) =>
        supplierRepository.update(vars.id, vars.payload),
      onSuccess: (_d, vars) => {
        qc.invalidateQueries({ queryKey: catalogKeys.suppliers });
        qc.invalidateQueries({ queryKey: catalogKeys.supplier(vars.id) });
      },
    }),
    remove: useMutation({
      mutationFn: (id: string) => supplierRepository.delete(id),
      onSuccess: () => qc.invalidateQueries({ queryKey: catalogKeys.suppliers }),
    }),
  };
};

export const useWarehouses = () =>
  useQuery({ queryKey: catalogKeys.warehouses, queryFn: () => warehouseRepository.list() });

export const useWarehouse = (id?: string) =>
  useQuery({
    queryKey: id ? catalogKeys.warehouse(id) : ["catalog", "warehouses", "missing"],
    queryFn: () => warehouseRepository.byId(id as string),
    enabled: Boolean(id),
  });

export const useWarehouseMutations = () => {
  const qc = useQueryClient();
  return {
    create: useMutation({
      mutationFn: (payload: CreateWarehouseRequestDto) => warehouseRepository.create(payload),
      onSuccess: () => qc.invalidateQueries({ queryKey: catalogKeys.warehouses }),
    }),
    update: useMutation({
      mutationFn: (vars: { id: string; payload: UpdateWarehouseRequestDto }) =>
        warehouseRepository.update(vars.id, vars.payload),
      onSuccess: (_d, vars) => {
        qc.invalidateQueries({ queryKey: catalogKeys.warehouses });
        qc.invalidateQueries({ queryKey: catalogKeys.warehouse(vars.id) });
      },
    }),
    remove: useMutation({
      mutationFn: (id: string) => warehouseRepository.delete(id),
      onSuccess: () => qc.invalidateQueries({ queryKey: catalogKeys.warehouses }),
    }),
  };
};
