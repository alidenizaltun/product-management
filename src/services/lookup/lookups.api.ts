import { apiClient } from "@/shared/api/apiClient";
import { apiEndpoints } from "@/shared/config/apiEndpoints";

export interface LookupItem {
  id: string;
  name: string;
}

export interface AllLookupsDto {
  products: LookupItem[];
  categories: LookupItem[];
  warehouses: LookupItem[];
  suppliers: LookupItem[];
  priceLists: LookupItem[];
  unitDefinitions: LookupItem[];
  regions: LookupItem[];
}

const lk = apiEndpoints.lookups;

export const lookupsApi = {
  all: (includeInactive = false): Promise<AllLookupsDto> => {
    const q = includeInactive ? "?includeInactive=true" : "";
    return apiClient.get<AllLookupsDto>(`${lk.all}${q}`);
  },

  products: (includeInactive = false): Promise<LookupItem[]> => {
    const q = includeInactive ? "?includeInactive=true" : "";
    return apiClient.get<LookupItem[]>(`${lk.products}${q}`);
  },

  categories: (): Promise<LookupItem[]> =>
    apiClient.get<LookupItem[]>(lk.categories),

  warehouses: (includeInactive = false): Promise<LookupItem[]> => {
    const q = includeInactive ? "?includeInactive=true" : "";
    return apiClient.get<LookupItem[]>(`${lk.warehouses}${q}`);
  },

  suppliers: (includeInactive = false): Promise<LookupItem[]> => {
    const q = includeInactive ? "?includeInactive=true" : "";
    return apiClient.get<LookupItem[]>(`${lk.suppliers}${q}`);
  },

  priceLists: (includeInactive = false): Promise<LookupItem[]> => {
    const q = includeInactive ? "?includeInactive=true" : "";
    return apiClient.get<LookupItem[]>(`${lk.priceLists}${q}`);
  },

  unitDefinitions: (includeInactive = false): Promise<LookupItem[]> => {
    const q = includeInactive ? "?includeInactive=true" : "";
    return apiClient.get<LookupItem[]>(`${lk.unitDefinitions}${q}`);
  },

  regions: (includeInactive = false): Promise<LookupItem[]> => {
    const q = includeInactive ? "?includeInactive=true" : "";
    return apiClient.get<LookupItem[]>(`${lk.regions}${q}`);
  },
};
