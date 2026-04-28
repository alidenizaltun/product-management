import {
  CreateProductCategoryMapRequestDto,
  CreateProductInventoryRequestDto,
  CreateInventoryReservationRequestDto,
  CreateInventoryTransactionRequestDto,
  CreateProductAttributeDefinitionRequestDto,
  CreateProductCategoryRequestDto,
  CreateProductPriceListItemRequestDto,
  CreateProductPriceListRequestDto,
  CreateProductRequestDto,
  CreateProductSupplierRequestDto,
  CreateWarehouseRequestDto,
  IProductOperationsRepository,
  InventoryReservationDto,
  InventoryReservationFilterDto,
  InventoryTransactionDto,
  InventoryTransactionFilterDto,
  ProductAttributeDefinitionDto,
  ProductCategoryDto,
  ProductCategoryMapDto,
  ProductDto,
  ProductFilterDto,
  ProductInventoryDto,
  ProductInventoryFilterDto,
  ProductPriceListDto,
  ProductPriceListItemDto,
  ProductSupplierDto,
  UpdateInventoryReservationStatusRequestDto,
  UpdateProductInventoryRequestDto,
  UpdateProductAttributeDefinitionRequestDto,
  UpdateProductCategoryRequestDto,
  UpdateProductPriceListItemRequestDto,
  UpdateProductPriceListRequestDto,
  UpdateProductRequestDto,
  UpdateProductSupplierRequestDto,
  UpdateWarehouseRequestDto,
  WarehouseDto,
} from "@/domain";
import { apiEndpoints } from "../config";
import { apiClient } from "./apiClient";

const withQuery = (url: string, query?: object): string => {
  if (!query) {
    return url;
  }

  const params = new URLSearchParams();

  Object.entries(query as Record<string, unknown>).forEach(([key, value]) => {
    if (value === undefined || value === null) {
      return;
    }

    if (value instanceof Date) {
      params.append(key, value.toISOString());
      return;
    }

    params.append(key, String(value));
  });

  const queryString = params.toString();
  return queryString ? `${url}?${queryString}` : url;
};

export class ProductOperationsRepository implements IProductOperationsRepository {
  async getProducts(filter?: ProductFilterDto): Promise<ProductDto[]> {
    const endpoint = withQuery(apiEndpoints.productOperations.products.list, filter);
    return apiClient.get<ProductDto[]>(endpoint);
  }

  async getProductById(productId: string): Promise<ProductDto | null> {
    return apiClient.get<ProductDto | null>(apiEndpoints.productOperations.products.byId(productId));
  }

  async createProduct(request: CreateProductRequestDto): Promise<ProductDto> {
    return apiClient.post<ProductDto>(apiEndpoints.productOperations.products.list, request);
  }

  async createProductCategoryMap(
    productId: string,
    request: CreateProductCategoryMapRequestDto
  ): Promise<ProductCategoryMapDto> {
    return apiClient.post<ProductCategoryMapDto>(
      apiEndpoints.productOperations.products.categoryMapsByProductId(productId),
      request
    );
  }

  async updateProduct(productId: string, request: UpdateProductRequestDto): Promise<boolean> {
    await apiClient.put<void>(apiEndpoints.productOperations.products.byId(productId), request);
    return true;
  }

  async deleteProduct(productId: string): Promise<boolean> {
    await apiClient.delete<void>(apiEndpoints.productOperations.products.byId(productId));
    return true;
  }

  async getAttributeDefinitions(): Promise<ProductAttributeDefinitionDto[]> {
    return apiClient.get<ProductAttributeDefinitionDto[]>(apiEndpoints.productOperations.attributes.list);
  }

  async getAttributeDefinitionById(attributeDefinitionId: string): Promise<ProductAttributeDefinitionDto | null> {
    return apiClient.get<ProductAttributeDefinitionDto | null>(
      apiEndpoints.productOperations.attributes.byId(attributeDefinitionId)
    );
  }

  async createAttributeDefinition(
    request: CreateProductAttributeDefinitionRequestDto
  ): Promise<ProductAttributeDefinitionDto> {
    return apiClient.post<ProductAttributeDefinitionDto>(apiEndpoints.productOperations.attributes.list, request);
  }

  async updateAttributeDefinition(
    attributeDefinitionId: string,
    request: UpdateProductAttributeDefinitionRequestDto
  ): Promise<boolean> {
    await apiClient.put<void>(apiEndpoints.productOperations.attributes.byId(attributeDefinitionId), request);
    return true;
  }

  async deleteAttributeDefinition(attributeDefinitionId: string): Promise<boolean> {
    await apiClient.delete<void>(apiEndpoints.productOperations.attributes.byId(attributeDefinitionId));
    return true;
  }

  async getCategories(): Promise<ProductCategoryDto[]> {
    return apiClient.get<ProductCategoryDto[]>(apiEndpoints.productOperations.catalog.categories);
  }

  async getCategoryById(categoryId: string): Promise<ProductCategoryDto | null> {
    return apiClient.get<ProductCategoryDto | null>(apiEndpoints.productOperations.catalog.categoryById(categoryId));
  }

  async createCategory(request: CreateProductCategoryRequestDto): Promise<ProductCategoryDto> {
    return apiClient.post<ProductCategoryDto>(apiEndpoints.productOperations.catalog.categories, request);
  }

  async updateCategory(categoryId: string, request: UpdateProductCategoryRequestDto): Promise<boolean> {
    await apiClient.put<void>(apiEndpoints.productOperations.catalog.categoryById(categoryId), request);
    return true;
  }

  async deleteCategory(categoryId: string): Promise<boolean> {
    await apiClient.delete<void>(apiEndpoints.productOperations.catalog.categoryById(categoryId));
    return true;
  }

  async getSuppliers(includeInactive = false): Promise<ProductSupplierDto[]> {
    const endpoint = withQuery(apiEndpoints.productOperations.catalog.suppliers, { includeInactive });
    return apiClient.get<ProductSupplierDto[]>(endpoint);
  }

  async getSupplierById(supplierId: string): Promise<ProductSupplierDto | null> {
    return apiClient.get<ProductSupplierDto | null>(apiEndpoints.productOperations.catalog.supplierById(supplierId));
  }

  async createSupplier(request: CreateProductSupplierRequestDto): Promise<ProductSupplierDto> {
    return apiClient.post<ProductSupplierDto>(apiEndpoints.productOperations.catalog.suppliers, request);
  }

  async updateSupplier(supplierId: string, request: UpdateProductSupplierRequestDto): Promise<boolean> {
    await apiClient.put<void>(apiEndpoints.productOperations.catalog.supplierById(supplierId), request);
    return true;
  }

  async deleteSupplier(supplierId: string): Promise<boolean> {
    await apiClient.delete<void>(apiEndpoints.productOperations.catalog.supplierById(supplierId));
    return true;
  }

  async getWarehouses(includeInactive = false): Promise<WarehouseDto[]> {
    const endpoint = withQuery(apiEndpoints.productOperations.catalog.warehouses, { includeInactive });
    return apiClient.get<WarehouseDto[]>(endpoint);
  }

  async getWarehouseById(warehouseId: string): Promise<WarehouseDto | null> {
    return apiClient.get<WarehouseDto | null>(apiEndpoints.productOperations.catalog.warehouseById(warehouseId));
  }

  async createWarehouse(request: CreateWarehouseRequestDto): Promise<WarehouseDto> {
    return apiClient.post<WarehouseDto>(apiEndpoints.productOperations.catalog.warehouses, request);
  }

  async updateWarehouse(warehouseId: string, request: UpdateWarehouseRequestDto): Promise<boolean> {
    await apiClient.put<void>(apiEndpoints.productOperations.catalog.warehouseById(warehouseId), request);
    return true;
  }

  async deleteWarehouse(warehouseId: string): Promise<boolean> {
    await apiClient.delete<void>(apiEndpoints.productOperations.catalog.warehouseById(warehouseId));
    return true;
  }

  async getInventoryTransactions(filter?: InventoryTransactionFilterDto): Promise<InventoryTransactionDto[]> {
    const endpoint = withQuery(apiEndpoints.productOperations.inventory.transactions, filter);
    return apiClient.get<InventoryTransactionDto[]>(endpoint);
  }

  async getInventories(filter?: ProductInventoryFilterDto): Promise<ProductInventoryDto[]> {
    const endpoint = withQuery(apiEndpoints.productOperations.inventory.inventories, filter);
    return apiClient.get<ProductInventoryDto[]>(endpoint);
  }

  async getInventoryById(inventoryId: string): Promise<ProductInventoryDto | null> {
    return apiClient.get<ProductInventoryDto | null>(apiEndpoints.productOperations.inventory.inventoryById(inventoryId));
  }

  async createInventory(request: CreateProductInventoryRequestDto): Promise<ProductInventoryDto> {
    return apiClient.post<ProductInventoryDto>(apiEndpoints.productOperations.inventory.inventories, request);
  }

  async updateInventory(inventoryId: string, request: UpdateProductInventoryRequestDto): Promise<boolean> {
    await apiClient.put<void>(apiEndpoints.productOperations.inventory.inventoryById(inventoryId), request);
    return true;
  }

  async deleteInventory(inventoryId: string): Promise<boolean> {
    await apiClient.delete<void>(apiEndpoints.productOperations.inventory.inventoryById(inventoryId));
    return true;
  }

  async createInventoryTransaction(request: CreateInventoryTransactionRequestDto): Promise<InventoryTransactionDto> {
    return apiClient.post<InventoryTransactionDto>(apiEndpoints.productOperations.inventory.transactions, request);
  }

  async getInventoryReservations(filter?: InventoryReservationFilterDto): Promise<InventoryReservationDto[]> {
    const endpoint = withQuery(apiEndpoints.productOperations.inventory.reservations, filter);
    return apiClient.get<InventoryReservationDto[]>(endpoint);
  }

  async createInventoryReservation(request: CreateInventoryReservationRequestDto): Promise<InventoryReservationDto> {
    return apiClient.post<InventoryReservationDto>(apiEndpoints.productOperations.inventory.reservations, request);
  }

  async updateInventoryReservationStatus(
    reservationId: string,
    request: UpdateInventoryReservationStatusRequestDto
  ): Promise<boolean> {
    await apiClient.patch<void>(apiEndpoints.productOperations.inventory.reservationStatus(reservationId), request);
    return true;
  }

  async deleteInventoryReservation(reservationId: string): Promise<boolean> {
    await apiClient.delete<void>(apiEndpoints.productOperations.inventory.reservationById(reservationId));
    return true;
  }

  async getPriceLists(includeInactive = false): Promise<ProductPriceListDto[]> {
    const endpoint = withQuery(apiEndpoints.productOperations.priceLists.list, { includeInactive });
    return apiClient.get<ProductPriceListDto[]>(endpoint);
  }

  async getPriceListById(priceListId: string): Promise<ProductPriceListDto | null> {
    return apiClient.get<ProductPriceListDto | null>(apiEndpoints.productOperations.priceLists.byId(priceListId));
  }

  async createPriceList(request: CreateProductPriceListRequestDto): Promise<ProductPriceListDto> {
    return apiClient.post<ProductPriceListDto>(apiEndpoints.productOperations.priceLists.list, request);
  }

  async updatePriceList(priceListId: string, request: UpdateProductPriceListRequestDto): Promise<boolean> {
    await apiClient.put<void>(apiEndpoints.productOperations.priceLists.byId(priceListId), request);
    return true;
  }

  async deletePriceList(priceListId: string): Promise<boolean> {
    await apiClient.delete<void>(apiEndpoints.productOperations.priceLists.byId(priceListId));
    return true;
  }

  async getPriceListItems(priceListId: string): Promise<ProductPriceListItemDto[]> {
    return apiClient.get<ProductPriceListItemDto[]>(
      apiEndpoints.productOperations.priceLists.itemsByPriceListId(priceListId)
    );
  }

  async getPriceListItemById(priceListItemId: string): Promise<ProductPriceListItemDto | null> {
    return apiClient.get<ProductPriceListItemDto | null>(apiEndpoints.productOperations.priceLists.itemById(priceListItemId));
  }

  async createPriceListItem(request: CreateProductPriceListItemRequestDto): Promise<ProductPriceListItemDto> {
    return apiClient.post<ProductPriceListItemDto>(apiEndpoints.productOperations.priceLists.items, request);
  }

  async updatePriceListItem(
    priceListItemId: string,
    request: UpdateProductPriceListItemRequestDto
  ): Promise<boolean> {
    await apiClient.put<void>(apiEndpoints.productOperations.priceLists.itemById(priceListItemId), request);
    return true;
  }

  async deletePriceListItem(priceListItemId: string): Promise<boolean> {
    await apiClient.delete<void>(apiEndpoints.productOperations.priceLists.itemById(priceListItemId));
    return true;
  }
}

export const productOperationsRepository = new ProductOperationsRepository();
