import type {
  ApplyPricingTemplateBulkRequestDto,
  ApplyPricingTemplateRequestDto,
  ApplyPricingTemplateResultDto,
  CreatePricingTemplateRequestDto,
  PricingTemplateDto,
  PricingTemplateUsageDto,
  SavePricingRuleAsTemplateRequestDto,
  UpdatePricingTemplateRequestDto,
} from "@/shared/types/productOperations.types";
import { apiClient } from "@/shared/api/apiClient";
import { apiEndpoints } from "@/shared/config/apiEndpoints";

const templates = apiEndpoints.pricingTemplates;

export interface PricingTemplateListParams {
  templateKind?: number;
  unitDefinitionId?: string;
  includeInactive?: boolean;
}

const buildQuery = (params?: PricingTemplateListParams) => {
  if (!params) return "";
  const query = new URLSearchParams();
  if (params.templateKind != null) query.set("templateKind", String(params.templateKind));
  if (params.unitDefinitionId) query.set("unitDefinitionId", params.unitDefinitionId);
  if (params.includeInactive) query.set("includeInactive", "true");
  const serialized = query.toString();
  return serialized ? `?${serialized}` : "";
};

export const pricingTemplatesApi = {
  list: (params?: PricingTemplateListParams) =>
    apiClient.get<PricingTemplateDto[]>(`${templates.list}${buildQuery(params)}`),

  byId: (id: string) => apiClient.get<PricingTemplateDto>(templates.byId(id)),

  usages: (id: string) => apiClient.get<PricingTemplateUsageDto[]>(templates.usages(id)),

  create: (payload: CreatePricingTemplateRequestDto) =>
    apiClient.post<PricingTemplateDto>(templates.list, payload),

  update: (id: string, payload: UpdatePricingTemplateRequestDto) =>
    apiClient.put<void>(templates.byId(id), payload),

  delete: (id: string) => apiClient.delete<void>(templates.byId(id)),

  apply: (id: string, payload: ApplyPricingTemplateRequestDto) =>
    apiClient.post<ApplyPricingTemplateResultDto>(templates.apply(id), payload),

  applyBulk: (id: string, payload: ApplyPricingTemplateBulkRequestDto) =>
    apiClient.post<ApplyPricingTemplateResultDto[]>(templates.applyBulk(id), payload),

  saveRuleAsTemplate: (ruleId: string, payload: SavePricingRuleAsTemplateRequestDto) =>
    apiClient.post<PricingTemplateDto>(templates.saveRuleAsTemplate(ruleId), payload),
};
