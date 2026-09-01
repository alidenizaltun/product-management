import { AllLookupsDto, LookupItem } from "../types/lookup.types";

export interface ILookupRepository {
  all(includeInactive?: boolean): Promise<AllLookupsDto>;
  products(includeInactive?: boolean): Promise<LookupItem[]>;
  categories(): Promise<LookupItem[]>;
  warehouses(includeInactive?: boolean): Promise<LookupItem[]>;
  suppliers(includeInactive?: boolean): Promise<LookupItem[]>;
  priceLists(includeInactive?: boolean): Promise<LookupItem[]>;
  unitDefinitions(includeInactive?: boolean): Promise<LookupItem[]>;
  regions(includeInactive?: boolean): Promise<LookupItem[]>;
}
