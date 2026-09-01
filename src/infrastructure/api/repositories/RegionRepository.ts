import { IRegionRepository } from "@/domain/repositories/IRegionRepository";
import { CreateRegionRequestDto, RegionDto, UpdateRegionRequestDto } from "@/domain/types/productOperations.types";
import { apiClient } from "../apiClient";
import { apiEndpoints } from "../../config/apiEndpoints";

const reg = apiEndpoints.regions;

export class RegionRepository implements IRegionRepository {
  async list(includeInactive = false): Promise<RegionDto[]> {
    return apiClient.get<RegionDto[]>(`${reg.list}${includeInactive ? "?includeInactive=true" : ""}`);
  }

  async byId(id: string): Promise<RegionDto> {
    return apiClient.get<RegionDto>(reg.byId(id));
  }

  async create(payload: CreateRegionRequestDto): Promise<RegionDto> {
    return apiClient.post<RegionDto>(reg.list, payload);
  }

  async update(id: string, payload: UpdateRegionRequestDto): Promise<void> {
    await apiClient.put<void>(reg.byId(id), payload);
  }

  async delete(id: string): Promise<void> {
    await apiClient.delete<void>(reg.byId(id));
  }
}

export const regionRepository = new RegionRepository();
