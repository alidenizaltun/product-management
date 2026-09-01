import {
  CreatePriceRevisionRequestDto,
  CreatePriceRevisionScopeRequestDto,
  PriceRevisionDto,
  PriceRevisionExecutionResultDto,
  PriceRevisionLineFilterDto,
  PriceRevisionLinePageDto,
  PriceRevisionScopeDto,
  PriceRevisionSummaryDto,
  UpdatePriceRevisionLineRequestDto,
  UpdatePriceRevisionRequestDto,
} from "../types/productOperations.types";

export interface IPriceRevisionRepository {
  list(status?: number): Promise<PriceRevisionDto[]>;
  byId(id: string): Promise<PriceRevisionDto>;
  create(payload: CreatePriceRevisionRequestDto): Promise<PriceRevisionDto>;
  update(id: string, payload: UpdatePriceRevisionRequestDto): Promise<void>;
  delete(id: string): Promise<void>;
  addScope(id: string, payload: CreatePriceRevisionScopeRequestDto): Promise<PriceRevisionScopeDto>;
  removeScope(id: string, scopeId: string): Promise<void>;
  preview(id: string): Promise<PriceRevisionSummaryDto>;
  lines(id: string, filter?: PriceRevisionLineFilterDto): Promise<PriceRevisionLinePageDto>;
  updateLine(id: string, lineId: string, payload: UpdatePriceRevisionLineRequestDto): Promise<void>;
  submit(id: string): Promise<void>;
  approve(id: string, note?: string): Promise<void>;
  reject(id: string, note: string): Promise<void>;
  cancel(id: string): Promise<void>;
  apply(id: string): Promise<PriceRevisionExecutionResultDto>;
  rollback(id: string): Promise<PriceRevisionExecutionResultDto>;
}
