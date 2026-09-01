import { CreateRegionRequestDto, RegionDto, UpdateRegionRequestDto } from "../types/productOperations.types";

export interface IRegionRepository {
  list(includeInactive?: boolean): Promise<RegionDto[]>;
  byId(id: string): Promise<RegionDto>;
  create(payload: CreateRegionRequestDto): Promise<RegionDto>;
  update(id: string, payload: UpdateRegionRequestDto): Promise<void>;
  delete(id: string): Promise<void>;
}
