export const queryKeys = {
  products: {
    all: ["products"] as const,
    list: (params?: Record<string, unknown>) => ["products", "list", params ?? {}] as const,
    detail: (id: string) => ["products", "detail", id] as const,
    variants: (id: string) => ["products", id, "variants"] as const,
    prices: (id: string) => ["products", id, "prices"] as const,
    pricingRules: (id: string) => ["products", id, "pricing-rules"] as const,
    pricingRule: (id: string) => ["products", "pricing-rules", id] as const,
    units: (id: string) => ["products", id, "units"] as const,
    unit: (id: string) => ["products", "units", id] as const,
    media: (id: string) => ["products", id, "media"] as const,
    profile: (id: string) => ["products", id, "profile"] as const,
    moduleOfferingPrices: (productId: string, moduleId: string) =>
      ["products", productId, "modules", moduleId, "offering-prices"] as const,
  },
  catalog: {
    categories: ["catalog", "categories"] as const,
    suppliers: ["catalog", "suppliers"] as const,
    warehouses: ["catalog", "warehouses"] as const,
    unitDefinitions: ["catalog", "unitDefinitions"] as const,
    unitDefinition: (id: string) => ["catalog", "unitDefinitions", id] as const,
  },
  identity: {
    users: (params?: Record<string, unknown>) => ["identity", "users", params ?? {}] as const,
    user: (id: string) => ["identity", "users", id] as const,
    roles: ["identity", "roles"] as const,
    role: (id: string) => ["identity", "roles", id] as const,
    permissionCatalog: ["identity", "permissionCatalog"] as const,
  },
  system: {
    settings: ["system", "settings"] as const,
    integrations: ["system", "integrations"] as const,
    integration: (id: string) => ["system", "integrations", id] as const,
  },
};
