import { ILookupRepository } from "@/domain/repositories/ILookupRepository";
import { AllLookupsDto, LookupItem } from "@/domain/types/lookup.types";
import { apiClient } from "../apiClient";
import { apiEndpoints } from "../../config/apiEndpoints";

const lk = apiEndpoints.lookups;

export class LookupRepository implements ILookupRepository {
  async all(includeInactive = false): Promise<AllLookupsDto> {
    const q = includeInactive ? "?includeInactive=true" : "";
    return apiClient.get<AllLookupsDto>(`${lk.all}${q}`);
  }

  async products(includeInactive = false): Promise<LookupItem[]> {
    const q = includeInactive ? "?includeInactive=true" : "";
    return apiClient.get<LookupItem[]>(`${lk.products}${q}`);
  }

  async categories(): Promise<LookupItem[]> {
    return apiClient.get<LookupItem[]>(lk.categories);
  }

  async warehouses(includeInactive = false): Promise<LookupItem[]> {
    const q = includeInactive ? "?includeInactive=true" : "";
    return apiClient.get<LookupItem[]>(`${lk.warehouses}${q}`);
  }

  async suppliers(includeInactive = false): Promise<LookupItem[]> {
    const q = includeInactive ? "?includeInactive=true" : "";
    return apiClient.get<LookupItem[]>(`${lk.suppliers}${q}`);
  }

  async priceLists(includeInactive = false): Promise<LookupItem[]> {
    const q = includeInactive ? "?includeInactive=true" : "";
    return apiClient.get<LookupItem[]>(`${lk.priceLists}${q}`);
  }

  async unitDefinitions(includeInactive = false): Promise<LookupItem[]> {
    const q = includeInactive ? "?includeInactive=true" : "";
    return apiClient.get<LookupItem[]>(`${lk.unitDefinitions}${q}`);
  }

  async regions(includeInactive = false): Promise<LookupItem[]> {
    const q = includeInactive ? "?includeInactive=true" : "";
    return apiClient.get<LookupItem[]>(`${lk.regions}${q}`);
  }
}

export const lookupRepository = new LookupRepository();
