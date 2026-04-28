/**
 * API endpoint mappings for Product Manager backend.
 */
export const apiEndpoints = {
    auth: {
        login: "/api/auth/login",
        register: "/api/auth/register",
        refreshToken: "/api/auth/refresh",
        forgotPassword: "/api/auth/forgot-password",
        resetPassword: "/api/auth/reset-password",
        changePassword: "/api/auth/change-password",
        logout: "/api/auth/logout",
        logoutAll: "/api/auth/logout-all",
        getCurrentUser: "/api/auth/me",
        confirmEmail: "/api/auth/confirm-email",
    },
    productOperations: {
        products: {
            list: "/api/products",
            byId: (productId: string) => `/api/products/${productId}`,
            categoryMapsByProductId: (productId: string) => `/api/products/${productId}/category-maps`,
        },
        attributes: {
            list: "/api/attributes",
            byId: (attributeDefinitionId: string) => `/api/attributes/${attributeDefinitionId}`,
        },
        catalog: {
            categories: "/api/catalog/categories",
            categoryById: (categoryId: string) => `/api/catalog/categories/${categoryId}`,
            suppliers: "/api/catalog/suppliers",
            supplierById: (supplierId: string) => `/api/catalog/suppliers/${supplierId}`,
            warehouses: "/api/catalog/warehouses",
            warehouseById: (warehouseId: string) => `/api/catalog/warehouses/${warehouseId}`,
        },
        inventory: {
            inventories: "/api/inventory/inventories",
            inventoryById: (inventoryId: string) => `/api/inventory/inventories/${inventoryId}`,
            transactions: "/api/inventory/transactions",
            reservations: "/api/inventory/reservations",
            reservationStatus: (reservationId: string) => `/api/inventory/reservations/${reservationId}/status`,
            reservationById: (reservationId: string) => `/api/inventory/reservations/${reservationId}`,
        },
        priceLists: {
            list: "/api/pricelists",
            byId: (priceListId: string) => `/api/pricelists/${priceListId}`,
            itemsByPriceListId: (priceListId: string) => `/api/pricelists/${priceListId}/items`,
            itemById: (priceListItemId: string) => `/api/pricelists/items/${priceListItemId}`,
            items: "/api/pricelists/items",
        },
    },
} as const;
