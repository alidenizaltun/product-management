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

export class ProductOperationsUseCases {
  constructor(private repository: IProductOperationsRepository) {}

  getProducts(filter?: ProductFilterDto): Promise<ProductDto[]> {
    return this.repository.getProducts(filter);
  }

  getProductById(productId: string): Promise<ProductDto | null> {
    return this.repository.getProductById(productId);
  }

  createProduct(request: CreateProductRequestDto): Promise<ProductDto> {
    return this.repository.createProduct(request);
  }

  createProductCategoryMap(productId: string, request: CreateProductCategoryMapRequestDto): Promise<ProductCategoryMapDto> {
    return this.repository.createProductCategoryMap(productId, request);
  }

  updateProduct(productId: string, request: UpdateProductRequestDto): Promise<boolean> {
    return this.repository.updateProduct(productId, request);
  }

  deleteProduct(productId: string): Promise<boolean> {
    return this.repository.deleteProduct(productId);
  }

  getAttributeDefinitions(): Promise<ProductAttributeDefinitionDto[]> {
    return this.repository.getAttributeDefinitions();
  }

  getAttributeDefinitionById(attributeDefinitionId: string): Promise<ProductAttributeDefinitionDto | null> {
    return this.repository.getAttributeDefinitionById(attributeDefinitionId);
  }

  createAttributeDefinition(
    request: CreateProductAttributeDefinitionRequestDto
  ): Promise<ProductAttributeDefinitionDto> {
    return this.repository.createAttributeDefinition(request);
  }

  updateAttributeDefinition(
    attributeDefinitionId: string,
    request: UpdateProductAttributeDefinitionRequestDto
  ): Promise<boolean> {
    return this.repository.updateAttributeDefinition(attributeDefinitionId, request);
  }

  deleteAttributeDefinition(attributeDefinitionId: string): Promise<boolean> {
    return this.repository.deleteAttributeDefinition(attributeDefinitionId);
  }

  getCategories(): Promise<ProductCategoryDto[]> {
    return this.repository.getCategories();
  }

  getCategoryById(categoryId: string): Promise<ProductCategoryDto | null> {
    return this.repository.getCategoryById(categoryId);
  }

  createCategory(request: CreateProductCategoryRequestDto): Promise<ProductCategoryDto> {
    return this.repository.createCategory(request);
  }

  updateCategory(categoryId: string, request: UpdateProductCategoryRequestDto): Promise<boolean> {
    return this.repository.updateCategory(categoryId, request);
  }

  deleteCategory(categoryId: string): Promise<boolean> {
    return this.repository.deleteCategory(categoryId);
  }

  getSuppliers(includeInactive?: boolean): Promise<ProductSupplierDto[]> {
    return this.repository.getSuppliers(includeInactive);
  }

  getSupplierById(supplierId: string): Promise<ProductSupplierDto | null> {
    return this.repository.getSupplierById(supplierId);
  }

  createSupplier(request: CreateProductSupplierRequestDto): Promise<ProductSupplierDto> {
    return this.repository.createSupplier(request);
  }

  updateSupplier(supplierId: string, request: UpdateProductSupplierRequestDto): Promise<boolean> {
    return this.repository.updateSupplier(supplierId, request);
  }

  deleteSupplier(supplierId: string): Promise<boolean> {
    return this.repository.deleteSupplier(supplierId);
  }

  getWarehouses(includeInactive?: boolean): Promise<WarehouseDto[]> {
    return this.repository.getWarehouses(includeInactive);
  }

  getWarehouseById(warehouseId: string): Promise<WarehouseDto | null> {
    return this.repository.getWarehouseById(warehouseId);
  }

  createWarehouse(request: CreateWarehouseRequestDto): Promise<WarehouseDto> {
    return this.repository.createWarehouse(request);
  }

  updateWarehouse(warehouseId: string, request: UpdateWarehouseRequestDto): Promise<boolean> {
    return this.repository.updateWarehouse(warehouseId, request);
  }

  deleteWarehouse(warehouseId: string): Promise<boolean> {
    return this.repository.deleteWarehouse(warehouseId);
  }

  getInventoryTransactions(filter?: InventoryTransactionFilterDto): Promise<InventoryTransactionDto[]> {
    return this.repository.getInventoryTransactions(filter);
  }

  getInventories(filter?: ProductInventoryFilterDto): Promise<ProductInventoryDto[]> {
    return this.repository.getInventories(filter);
  }

  getInventoryById(inventoryId: string): Promise<ProductInventoryDto | null> {
    return this.repository.getInventoryById(inventoryId);
  }

  createInventory(request: CreateProductInventoryRequestDto): Promise<ProductInventoryDto> {
    return this.repository.createInventory(request);
  }

  updateInventory(inventoryId: string, request: UpdateProductInventoryRequestDto): Promise<boolean> {
    return this.repository.updateInventory(inventoryId, request);
  }

  deleteInventory(inventoryId: string): Promise<boolean> {
    return this.repository.deleteInventory(inventoryId);
  }

  createInventoryTransaction(request: CreateInventoryTransactionRequestDto): Promise<InventoryTransactionDto> {
    return this.repository.createInventoryTransaction(request);
  }

  getInventoryReservations(filter?: InventoryReservationFilterDto): Promise<InventoryReservationDto[]> {
    return this.repository.getInventoryReservations(filter);
  }

  createInventoryReservation(request: CreateInventoryReservationRequestDto): Promise<InventoryReservationDto> {
    return this.repository.createInventoryReservation(request);
  }

  updateInventoryReservationStatus(
    reservationId: string,
    request: UpdateInventoryReservationStatusRequestDto
  ): Promise<boolean> {
    return this.repository.updateInventoryReservationStatus(reservationId, request);
  }

  deleteInventoryReservation(reservationId: string): Promise<boolean> {
    return this.repository.deleteInventoryReservation(reservationId);
  }

  getPriceLists(includeInactive?: boolean): Promise<ProductPriceListDto[]> {
    return this.repository.getPriceLists(includeInactive);
  }

  getPriceListById(priceListId: string): Promise<ProductPriceListDto | null> {
    return this.repository.getPriceListById(priceListId);
  }

  createPriceList(request: CreateProductPriceListRequestDto): Promise<ProductPriceListDto> {
    return this.repository.createPriceList(request);
  }

  updatePriceList(priceListId: string, request: UpdateProductPriceListRequestDto): Promise<boolean> {
    return this.repository.updatePriceList(priceListId, request);
  }

  deletePriceList(priceListId: string): Promise<boolean> {
    return this.repository.deletePriceList(priceListId);
  }

  getPriceListItems(priceListId: string): Promise<ProductPriceListItemDto[]> {
    return this.repository.getPriceListItems(priceListId);
  }

  getPriceListItemById(priceListItemId: string): Promise<ProductPriceListItemDto | null> {
    return this.repository.getPriceListItemById(priceListItemId);
  }

  createPriceListItem(request: CreateProductPriceListItemRequestDto): Promise<ProductPriceListItemDto> {
    return this.repository.createPriceListItem(request);
  }

  updatePriceListItem(
    priceListItemId: string,
    request: UpdateProductPriceListItemRequestDto
  ): Promise<boolean> {
    return this.repository.updatePriceListItem(priceListItemId, request);
  }

  deletePriceListItem(priceListItemId: string): Promise<boolean> {
    return this.repository.deletePriceListItem(priceListItemId);
  }
}
