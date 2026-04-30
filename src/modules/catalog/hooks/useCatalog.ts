import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { categoriesApi, suppliersApi, warehousesApi } from "@/modules/catalog/api/catalog.api";
import {
  CreateProductCategoryRequestDto,
  CreateProductSupplierRequestDto,
  CreateWarehouseRequestDto,
  UpdateProductCategoryRequestDto,
  UpdateProductSupplierRequestDto,
  UpdateWarehouseRequestDto,
} from "@/shared/types/productOperations.types";

export const catalogKeys = {
  categories: ["catalog", "categories"] as const,
  category: (id: string) => ["catalog", "categories", id] as const,
  suppliers: ["catalog", "suppliers"] as const,
  supplier: (id: string) => ["catalog", "suppliers", id] as const,
  warehouses: ["catalog", "warehouses"] as const,
  warehouse: (id: string) => ["catalog", "warehouses", id] as const,
};

export const useCategories = () =>
  useQuery({ queryKey: catalogKeys.categories, queryFn: categoriesApi.list });

export const useCategory = (id?: string) =>
  useQuery({
    queryKey: id ? catalogKeys.category(id) : ["catalog", "categories", "missing"],
    queryFn: () => categoriesApi.byId(id as string),
    enabled: Boolean(id),
  });

export const useCategoryMutations = () => {
  const qc = useQueryClient();
  return {
    create: useMutation({
      mutationFn: (payload: CreateProductCategoryRequestDto) => categoriesApi.create(payload),
      onSuccess: () => qc.invalidateQueries({ queryKey: catalogKeys.categories }),
    }),
    update: useMutation({
      mutationFn: (vars: { id: string; payload: UpdateProductCategoryRequestDto }) =>
        categoriesApi.update(vars.id, vars.payload),
      onSuccess: (_d, vars) => {
        qc.invalidateQueries({ queryKey: catalogKeys.categories });
        qc.invalidateQueries({ queryKey: catalogKeys.category(vars.id) });
      },
    }),
    remove: useMutation({
      mutationFn: (id: string) => categoriesApi.delete(id),
      onSuccess: () => qc.invalidateQueries({ queryKey: catalogKeys.categories }),
    }),
  };
};

export const useSuppliers = () =>
  useQuery({ queryKey: catalogKeys.suppliers, queryFn: suppliersApi.list });

export const useSupplier = (id?: string) =>
  useQuery({
    queryKey: id ? catalogKeys.supplier(id) : ["catalog", "suppliers", "missing"],
    queryFn: () => suppliersApi.byId(id as string),
    enabled: Boolean(id),
  });

export const useSupplierMutations = () => {
  const qc = useQueryClient();
  return {
    create: useMutation({
      mutationFn: (payload: CreateProductSupplierRequestDto) => suppliersApi.create(payload),
      onSuccess: () => qc.invalidateQueries({ queryKey: catalogKeys.suppliers }),
    }),
    update: useMutation({
      mutationFn: (vars: { id: string; payload: UpdateProductSupplierRequestDto }) =>
        suppliersApi.update(vars.id, vars.payload),
      onSuccess: (_d, vars) => {
        qc.invalidateQueries({ queryKey: catalogKeys.suppliers });
        qc.invalidateQueries({ queryKey: catalogKeys.supplier(vars.id) });
      },
    }),
    remove: useMutation({
      mutationFn: (id: string) => suppliersApi.delete(id),
      onSuccess: () => qc.invalidateQueries({ queryKey: catalogKeys.suppliers }),
    }),
  };
};

export const useWarehouses = () =>
  useQuery({ queryKey: catalogKeys.warehouses, queryFn: warehousesApi.list });

export const useWarehouse = (id?: string) =>
  useQuery({
    queryKey: id ? catalogKeys.warehouse(id) : ["catalog", "warehouses", "missing"],
    queryFn: () => warehousesApi.byId(id as string),
    enabled: Boolean(id),
  });

export const useWarehouseMutations = () => {
  const qc = useQueryClient();
  return {
    create: useMutation({
      mutationFn: (payload: CreateWarehouseRequestDto) => warehousesApi.create(payload),
      onSuccess: () => qc.invalidateQueries({ queryKey: catalogKeys.warehouses }),
    }),
    update: useMutation({
      mutationFn: (vars: { id: string; payload: UpdateWarehouseRequestDto }) =>
        warehousesApi.update(vars.id, vars.payload),
      onSuccess: (_d, vars) => {
        qc.invalidateQueries({ queryKey: catalogKeys.warehouses });
        qc.invalidateQueries({ queryKey: catalogKeys.warehouse(vars.id) });
      },
    }),
    remove: useMutation({
      mutationFn: (id: string) => warehousesApi.delete(id),
      onSuccess: () => qc.invalidateQueries({ queryKey: catalogKeys.warehouses }),
    }),
  };
};
