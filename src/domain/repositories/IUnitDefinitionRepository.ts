import { CreateUnitDefinitionRequestDto, UnitDefinitionDto, UpdateUnitDefinitionRequestDto } from "../types/productOperations.types";
import { LookupItem } from "../types/lookup.types";

export interface IUnitDefinitionRepository {
  getAll(includeInactive?: boolean): Promise<UnitDefinitionDto[]>;
  getById(id: string): Promise<UnitDefinitionDto>;
  create(payload: CreateUnitDefinitionRequestDto): Promise<UnitDefinitionDto>;
  update(id: string, payload: UpdateUnitDefinitionRequestDto): Promise<void>;
  delete(id: string): Promise<void>;
  getLookup(includeInactive?: boolean): Promise<LookupItem[]>;
}
