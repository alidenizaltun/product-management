import { useQuery } from "@tanstack/react-query";
import type { QueryClient } from "@tanstack/react-query";
import { lookupRepository } from "@/infrastructure/api/repositories";
import type { LookupItem } from "@/domain/types/lookup.types";

const STALE_TIME = 5 * 60 * 1000; // 5 min

// ─── individual hooks ─────────────────────────────────────────────────────────

export const useCategoryLookups = () =>
  useQuery<LookupItem[]>({
    queryKey: ["lookups", "categories"],
    queryFn: () => lookupRepository.categories(),
    staleTime: STALE_TIME,
  });

export const useWarehouseLookups = (includeInactive = false) =>
  useQuery<LookupItem[]>({
    queryKey: ["lookups", "warehouses", includeInactive],
    queryFn: () => lookupRepository.warehouses(includeInactive),
    staleTime: STALE_TIME,
  });

export const useSupplierLookups = (includeInactive = false) =>
  useQuery<LookupItem[]>({
    queryKey: ["lookups", "suppliers", includeInactive],
    queryFn: () => lookupRepository.suppliers(includeInactive),
    staleTime: STALE_TIME,
  });

export const usePriceListLookups = (includeInactive = false) =>
  useQuery<LookupItem[]>({
    queryKey: ["lookups", "priceLists", includeInactive],
    queryFn: () => lookupRepository.priceLists(includeInactive),
    staleTime: STALE_TIME,
  });

export const useProductLookups = (includeInactive = false) =>
  useQuery<LookupItem[]>({
    queryKey: ["lookups", "products", includeInactive],
    queryFn: () => lookupRepository.products(includeInactive),
    staleTime: STALE_TIME,
  });

export const useRegionLookups = (includeInactive = false) =>
  useQuery<LookupItem[]>({
    queryKey: ["lookups", "regions", includeInactive],
    queryFn: () => lookupRepository.regions(includeInactive),
    staleTime: STALE_TIME,
  });

export const useUnitDefinitionLookups = (includeInactive = false) =>
  useQuery<LookupItem[]>({
    queryKey: ["lookups", "unitDefinitions", includeInactive],
    queryFn: () => lookupRepository.unitDefinitions(includeInactive),
    staleTime: STALE_TIME,
  });

// ─── bulk hook (fetches everything in one request) ────────────────────────────

export const useAllLookups = (includeInactive = false) =>
  useQuery({
    queryKey: ["lookups", "all", includeInactive],
    queryFn: () => lookupRepository.all(includeInactive),
    staleTime: STALE_TIME,
  });

// ─── cache invalidation ───────────────────────────────────────────────────────

/**
 * Lookup cache'i 5 dakika taze sayıldığı için, bir sözlük kaydı (kategori,
 * depo, tedarikçi, birim, fiyat listesi, ürün) eklendiğinde/güncellendiğinde
 * ilgili mutation'ın bunu çağırması şart. Aksi halde yeni kayıt, ürün formundaki
 * seçim kutularında 5 dakika boyunca görünmez.
 *
 * Bileşik ["lookups", "all"] sorgusu da her listeyi içerdiğinden, prefix
 * eşleşmesiyle tüm lookup sorguları birlikte tazelenir.
 */
export const invalidateLookups = (qc: QueryClient) =>
  qc.invalidateQueries({ queryKey: ["lookups"] });
