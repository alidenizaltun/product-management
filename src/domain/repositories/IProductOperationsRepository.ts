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

export interface IProductOperationsRepository {
  getProducts(filter?: ProductFilterDto): Promise<ProductDto[]>;
  getProductById(productId: string): Promise<ProductDto | null>;
  createProduct(request: CreateProductRequestDto): Promise<ProductDto>;
  createProductCategoryMap(productId: string, request: CreateProductCategoryMapRequestDto): Promise<ProductCategoryMapDto>;
  updateProduct(productId: string, request: UpdateProductRequestDto): Promise<boolean>;
  deleteProduct(productId: string): Promise<boolean>;

  getAttributeDefinitions(): Promise<ProductAttributeDefinitionDto[]>;
  getAttributeDefinitionById(attributeDefinitionId: string): Promise<ProductAttributeDefinitionDto | null>;
  createAttributeDefinition(request: CreateProductAttributeDefinitionRequestDto): Promise<ProductAttributeDefinitionDto>;
  updateAttributeDefinition(
    attributeDefinitionId: string,
    request: UpdateProductAttributeDefinitionRequestDto
  ): Promise<boolean>;
  deleteAttributeDefinition(attributeDefinitionId: string): Promise<boolean>;

  getCategories(): Promise<ProductCategoryDto[]>;
  getCategoryById(categoryId: string): Promise<ProductCategoryDto | null>;
  createCategory(request: CreateProductCategoryRequestDto): Promise<ProductCategoryDto>;
  updateCategory(categoryId: string, request: UpdateProductCategoryRequestDto): Promise<boolean>;
  deleteCategory(categoryId: string): Promise<boolean>;

  getSuppliers(includeInactive?: boolean): Promise<ProductSupplierDto[]>;
  getSupplierById(supplierId: string): Promise<ProductSupplierDto | null>;
  createSupplier(request: CreateProductSupplierRequestDto): Promise<ProductSupplierDto>;
  updateSupplier(supplierId: string, request: UpdateProductSupplierRequestDto): Promise<boolean>;
  deleteSupplier(supplierId: string): Promise<boolean>;

  getWarehouses(includeInactive?: boolean): Promise<WarehouseDto[]>;
  getWarehouseById(warehouseId: string): Promise<WarehouseDto | null>;
  createWarehouse(request: CreateWarehouseRequestDto): Promise<WarehouseDto>;
  updateWarehouse(warehouseId: string, request: UpdateWarehouseRequestDto): Promise<boolean>;
  deleteWarehouse(warehouseId: string): Promise<boolean>;

  getInventoryTransactions(filter?: InventoryTransactionFilterDto): Promise<InventoryTransactionDto[]>;
  getInventories(filter?: ProductInventoryFilterDto): Promise<ProductInventoryDto[]>;
  getInventoryById(inventoryId: string): Promise<ProductInventoryDto | null>;
  createInventory(request: CreateProductInventoryRequestDto): Promise<ProductInventoryDto>;
  updateInventory(inventoryId: string, request: UpdateProductInventoryRequestDto): Promise<boolean>;
  deleteInventory(inventoryId: string): Promise<boolean>;
  createInventoryTransaction(request: CreateInventoryTransactionRequestDto): Promise<InventoryTransactionDto>;
  getInventoryReservations(filter?: InventoryReservationFilterDto): Promise<InventoryReservationDto[]>;
  createInventoryReservation(request: CreateInventoryReservationRequestDto): Promise<InventoryReservationDto>;
  updateInventoryReservationStatus(
    reservationId: string,
    request: UpdateInventoryReservationStatusRequestDto
  ): Promise<boolean>;
  deleteInventoryReservation(reservationId: string): Promise<boolean>;

  getPriceLists(includeInactive?: boolean): Promise<ProductPriceListDto[]>;
  getPriceListById(priceListId: string): Promise<ProductPriceListDto | null>;
  createPriceList(request: CreateProductPriceListRequestDto): Promise<ProductPriceListDto>;
  updatePriceList(priceListId: string, request: UpdateProductPriceListRequestDto): Promise<boolean>;
  deletePriceList(priceListId: string): Promise<boolean>;

  getPriceListItems(priceListId: string): Promise<ProductPriceListItemDto[]>;
  getPriceListItemById(priceListItemId: string): Promise<ProductPriceListItemDto | null>;
  createPriceListItem(request: CreateProductPriceListItemRequestDto): Promise<ProductPriceListItemDto>;
  updatePriceListItem(priceListItemId: string, request: UpdateProductPriceListItemRequestDto): Promise<boolean>;
  deletePriceListItem(priceListItemId: string): Promise<boolean>;
}
