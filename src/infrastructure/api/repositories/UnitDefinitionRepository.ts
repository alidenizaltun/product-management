import { IUnitDefinitionRepository } from "@/domain/repositories/IUnitDefinitionRepository";
import { CreateUnitDefinitionRequestDto, UnitDefinitionDto, UpdateUnitDefinitionRequestDto } from "@/domain/types/productOperations.types";
import { LookupItem } from "@/domain/types/lookup.types";
import { apiClient } from "../apiClient";
import { apiEndpoints } from "../../config/apiEndpoints";

const ep = apiEndpoints.unitDefinitions;
const lkEp = apiEndpoints.lookups.unitDefinitions;

export class UnitDefinitionRepository implements IUnitDefinitionRepository {
  async getAll(includeInactive = false): Promise<UnitDefinitionDto[]> {
    const q = includeInactive ? "?includeInactive=true" : "";
    return apiClient.get<UnitDefinitionDto[]>(`${ep.list}${q}`);
  }

  async getById(id: string): Promise<UnitDefinitionDto> {
    return apiClient.get<UnitDefinitionDto>(ep.byId(id));
  }

  async create(payload: CreateUnitDefinitionRequestDto): Promise<UnitDefinitionDto> {
    return apiClient.post<UnitDefinitionDto>(ep.list, payload);
  }

  async update(id: string, payload: UpdateUnitDefinitionRequestDto): Promise<void> {
    await apiClient.put<void>(ep.byId(id), payload);
  }

  async delete(id: string): Promise<void> {
    await apiClient.delete<void>(ep.byId(id));
  }

  async getLookup(includeInactive = false): Promise<LookupItem[]> {
    const q = includeInactive ? "?includeInactive=true" : "";
    return apiClient.get<LookupItem[]>(`${lkEp}${q}`);
  }
}

export const unitDefinitionRepository = new UnitDefinitionRepository();
