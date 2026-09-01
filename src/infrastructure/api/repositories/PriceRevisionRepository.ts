import { IPriceRevisionRepository } from "@/domain/repositories/IPriceRevisionRepository";
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
} from "@/domain/types/productOperations.types";
import { apiClient } from "../apiClient";
import { apiEndpoints } from "../../config/apiEndpoints";

const revisions = apiEndpoints.priceRevisions;

const buildLineQuery = (filter?: PriceRevisionLineFilterDto) => {
  if (!filter) return "";
  const query = new URLSearchParams();
  if (filter.targetType != null) query.set("targetType", String(filter.targetType));
  if (filter.productId) query.set("productId", filter.productId);
  if (filter.isExcluded != null) query.set("isExcluded", String(filter.isExcluded));
  if (filter.skip != null) query.set("skip", String(filter.skip));
  if (filter.take != null) query.set("take", String(filter.take));
  const serialized = query.toString();
  return serialized ? `?${serialized}` : "";
};

export class PriceRevisionRepository implements IPriceRevisionRepository {
  async list(status?: number): Promise<PriceRevisionDto[]> {
    return apiClient.get<PriceRevisionDto[]>(
      status == null ? revisions.list : `${revisions.list}?status=${status}`
    );
  }

  async byId(id: string): Promise<PriceRevisionDto> {
    return apiClient.get<PriceRevisionDto>(revisions.byId(id));
  }

  async create(payload: CreatePriceRevisionRequestDto): Promise<PriceRevisionDto> {
    return apiClient.post<PriceRevisionDto>(revisions.list, payload);
  }

  async update(id: string, payload: UpdatePriceRevisionRequestDto): Promise<void> {
    await apiClient.put<void>(revisions.byId(id), payload);
  }

  async delete(id: string): Promise<void> {
    await apiClient.delete<void>(revisions.byId(id));
  }

  async addScope(id: string, payload: CreatePriceRevisionScopeRequestDto): Promise<PriceRevisionScopeDto> {
    return apiClient.post<PriceRevisionScopeDto>(revisions.scopes(id), payload);
  }

  async removeScope(id: string, scopeId: string): Promise<void> {
    await apiClient.delete<void>(revisions.scopeById(id, scopeId));
  }

  async preview(id: string): Promise<PriceRevisionSummaryDto> {
    return apiClient.post<PriceRevisionSummaryDto>(revisions.preview(id), {});
  }

  async lines(id: string, filter?: PriceRevisionLineFilterDto): Promise<PriceRevisionLinePageDto> {
    return apiClient.get<PriceRevisionLinePageDto>(`${revisions.lines(id)}${buildLineQuery(filter)}`);
  }

  async updateLine(id: string, lineId: string, payload: UpdatePriceRevisionLineRequestDto): Promise<void> {
    await apiClient.patch<void>(revisions.lineById(id, lineId), payload);
  }

  async submit(id: string): Promise<void> {
    await apiClient.post<void>(revisions.submit(id), {});
  }

  async approve(id: string, note?: string): Promise<void> {
    await apiClient.post<void>(revisions.approve(id), { note: note ?? null });
  }

  async reject(id: string, note: string): Promise<void> {
    await apiClient.post<void>(revisions.reject(id), { note });
  }

  async cancel(id: string): Promise<void> {
    await apiClient.post<void>(revisions.cancel(id), {});
  }

  async apply(id: string): Promise<PriceRevisionExecutionResultDto> {
    return apiClient.post<PriceRevisionExecutionResultDto>(revisions.apply(id), {});
  }

  async rollback(id: string): Promise<PriceRevisionExecutionResultDto> {
    return apiClient.post<PriceRevisionExecutionResultDto>(revisions.rollback(id), {});
  }
}

export const priceRevisionRepository = new PriceRevisionRepository();
