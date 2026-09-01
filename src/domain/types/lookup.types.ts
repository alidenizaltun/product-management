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
