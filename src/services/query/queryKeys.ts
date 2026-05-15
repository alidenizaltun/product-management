export const queryKeys = {
  products: {
    all: ["products"] as const,
    list: (params?: Record<string, unknown>) => ["products", "list", params ?? {}] as const,
    detail: (id: string) => ["products", "detail", id] as const,
    variants: (id: string) => ["products", id, "variants"] as const,
    prices: (id: string) => ["products", id, "prices"] as const,
    media: (id: string) => ["products", id, "media"] as const,
    profile: (id: string) => ["products", id, "profile"] as const,
  },
  catalog: {
    categories: ["catalog", "categories"] as const,
    suppliers: ["catalog", "suppliers"] as const,
    warehouses: ["catalog", "warehouses"] as const,
    unitDefinitions: ["catalog", "unitDefinitions"] as const,
    unitDefinition: (id: string) => ["catalog", "unitDefinitions", id] as const,
  },
};
