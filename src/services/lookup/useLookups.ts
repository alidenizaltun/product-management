import { useQuery } from "@tanstack/react-query";
import { lookupsApi, type LookupItem } from "./lookups.api";

const STALE_TIME = 5 * 60 * 1000; // 5 min

// ─── individual hooks ─────────────────────────────────────────────────────────

export const useCategoryLookups = () =>
  useQuery<LookupItem[]>({
    queryKey: ["lookups", "categories"],
    queryFn: () => lookupsApi.categories(),
    staleTime: STALE_TIME,
  });

export const useWarehouseLookups = (includeInactive = false) =>
  useQuery<LookupItem[]>({
    queryKey: ["lookups", "warehouses", includeInactive],
    queryFn: () => lookupsApi.warehouses(includeInactive),
    staleTime: STALE_TIME,
  });

export const useSupplierLookups = (includeInactive = false) =>
  useQuery<LookupItem[]>({
    queryKey: ["lookups", "suppliers", includeInactive],
    queryFn: () => lookupsApi.suppliers(includeInactive),
    staleTime: STALE_TIME,
  });

export const usePriceListLookups = (includeInactive = false) =>
  useQuery<LookupItem[]>({
    queryKey: ["lookups", "priceLists", includeInactive],
    queryFn: () => lookupsApi.priceLists(includeInactive),
    staleTime: STALE_TIME,
  });

export const useProductLookups = (includeInactive = false) =>
  useQuery<LookupItem[]>({
    queryKey: ["lookups", "products", includeInactive],
    queryFn: () => lookupsApi.products(includeInactive),
    staleTime: STALE_TIME,
  });

export const useRegionLookups = (includeInactive = false) =>
  useQuery<LookupItem[]>({
    queryKey: ["lookups", "regions", includeInactive],
    queryFn: () => lookupsApi.regions(includeInactive),
    staleTime: STALE_TIME,
  });

// ─── bulk hook (fetches everything in one request) ────────────────────────────

export const useAllLookups = (includeInactive = false) =>
  useQuery({
    queryKey: ["lookups", "all", includeInactive],
    queryFn: () => lookupsApi.all(includeInactive),
    staleTime: STALE_TIME,
  });
