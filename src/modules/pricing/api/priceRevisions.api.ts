import type {
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
} from "@/shared/types/productOperations.types";
import { apiClient } from "@/shared/api/apiClient";
import { apiEndpoints } from "@/shared/config/apiEndpoints";

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

export const priceRevisionsApi = {
  list: (status?: number) =>
    apiClient.get<PriceRevisionDto[]>(
      status == null ? revisions.list : `${revisions.list}?status=${status}`
    ),

  byId: (id: string) => apiClient.get<PriceRevisionDto>(revisions.byId(id)),

  create: (payload: CreatePriceRevisionRequestDto) =>
    apiClient.post<PriceRevisionDto>(revisions.list, payload),

  update: (id: string, payload: UpdatePriceRevisionRequestDto) =>
    apiClient.put<void>(revisions.byId(id), payload),

  delete: (id: string) => apiClient.delete<void>(revisions.byId(id)),

  addScope: (id: string, payload: CreatePriceRevisionScopeRequestDto) =>
    apiClient.post<PriceRevisionScopeDto>(revisions.scopes(id), payload),

  removeScope: (id: string, scopeId: string) =>
    apiClient.delete<void>(revisions.scopeById(id, scopeId)),

  preview: (id: string) => apiClient.post<PriceRevisionSummaryDto>(revisions.preview(id), {}),

  lines: (id: string, filter?: PriceRevisionLineFilterDto) =>
    apiClient.get<PriceRevisionLinePageDto>(`${revisions.lines(id)}${buildLineQuery(filter)}`),

  updateLine: (id: string, lineId: string, payload: UpdatePriceRevisionLineRequestDto) =>
    apiClient.patch<void>(revisions.lineById(id, lineId), payload),

  submit: (id: string) => apiClient.post<void>(revisions.submit(id), {}),

  approve: (id: string, note?: string) =>
    apiClient.post<void>(revisions.approve(id), { note: note ?? null }),

  reject: (id: string, note: string) => apiClient.post<void>(revisions.reject(id), { note }),

  cancel: (id: string) => apiClient.post<void>(revisions.cancel(id), {}),

  apply: (id: string) =>
    apiClient.post<PriceRevisionExecutionResultDto>(revisions.apply(id), {}),

  rollback: (id: string) =>
    apiClient.post<PriceRevisionExecutionResultDto>(revisions.rollback(id), {}),
};
