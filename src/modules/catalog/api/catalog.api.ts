import {
  ProductCategoryDto,
  CreateProductCategoryRequestDto,
  UpdateProductCategoryRequestDto,
  ProductSupplierDto,
  CreateProductSupplierRequestDto,
  UpdateProductSupplierRequestDto,
  WarehouseDto,
  CreateWarehouseRequestDto,
  UpdateWarehouseRequestDto,
} from "@/domain";
import { apiClient } from "@/infrastructure/api";
import { apiEndpoints } from "@/infrastructure/config";

const cat = apiEndpoints.productOperations.catalog;

export const categoriesApi = {
  list: () => apiClient.get<ProductCategoryDto[]>(cat.categories),
  byId: (id: string) => apiClient.get<ProductCategoryDto>(cat.categoryById(id)),
  create: (payload: CreateProductCategoryRequestDto) =>
    apiClient.post<ProductCategoryDto>(cat.categories, payload),
  update: (id: string, payload: UpdateProductCategoryRequestDto) =>
    apiClient.put<void>(cat.categoryById(id), payload),
  delete: (id: string) => apiClient.delete<void>(cat.categoryById(id)),
};

export const suppliersApi = {
  list: () => apiClient.get<ProductSupplierDto[]>(cat.suppliers),
  byId: (id: string) => apiClient.get<ProductSupplierDto>(cat.supplierById(id)),
  create: (payload: CreateProductSupplierRequestDto) =>
    apiClient.post<ProductSupplierDto>(cat.suppliers, payload),
  update: (id: string, payload: UpdateProductSupplierRequestDto) =>
    apiClient.put<void>(cat.supplierById(id), payload),
  delete: (id: string) => apiClient.delete<void>(cat.supplierById(id)),
};

export const warehousesApi = {
  list: () => apiClient.get<WarehouseDto[]>(cat.warehouses),
  byId: (id: string) => apiClient.get<WarehouseDto>(cat.warehouseById(id)),
  create: (payload: CreateWarehouseRequestDto) =>
    apiClient.post<WarehouseDto>(cat.warehouses, payload),
  update: (id: string, payload: UpdateWarehouseRequestDto) =>
    apiClient.put<void>(cat.warehouseById(id), payload),
  delete: (id: string) => apiClient.delete<void>(cat.warehouseById(id)),
};
