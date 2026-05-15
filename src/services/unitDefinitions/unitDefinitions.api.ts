import { apiClient } from "@/shared/api/apiClient";
import { apiEndpoints } from "@/shared/config/apiEndpoints";
import type {
    UnitDefinitionDto,
    CreateUnitDefinitionRequestDto,
    UpdateUnitDefinitionRequestDto,
} from "@/shared/types/productOperations.types";
import type { LookupItem } from "@/services/lookup/lookups.api";

const ep = apiEndpoints.unitDefinitions;
const lkEp = apiEndpoints.lookups.unitDefinitions;

export const unitDefinitionsApi = {
    getAll: (includeInactive = false): Promise<UnitDefinitionDto[]> => {
        const q = includeInactive ? "?includeInactive=true" : "";
        return apiClient.get<UnitDefinitionDto[]>(`${ep.list}${q}`);
    },

    getById: (id: string): Promise<UnitDefinitionDto> =>
        apiClient.get<UnitDefinitionDto>(ep.byId(id)),

    create: (payload: CreateUnitDefinitionRequestDto): Promise<UnitDefinitionDto> =>
        apiClient.post<UnitDefinitionDto>(ep.list, payload),

    update: (id: string, payload: UpdateUnitDefinitionRequestDto): Promise<void> =>
        apiClient.put<void>(ep.byId(id), payload),

    delete: (id: string): Promise<void> =>
        apiClient.delete<void>(ep.byId(id)),

    getLookup: (includeInactive = false): Promise<LookupItem[]> => {
        const q = includeInactive ? "?includeInactive=true" : "";
        return apiClient.get<LookupItem[]>(`${lkEp}${q}`);
    },
};