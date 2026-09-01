import { IPricingTemplateRepository, PricingTemplateListParams } from "@/domain/repositories/IPricingTemplateRepository";
import {
  ApplyPricingTemplateBulkRequestDto,
  ApplyPricingTemplateRequestDto,
  ApplyPricingTemplateResultDto,
  CreatePricingTemplateRequestDto,
  PricingTemplateDto,
  PricingTemplateUsageDto,
  SavePricingRuleAsTemplateRequestDto,
  UpdatePricingTemplateRequestDto,
} from "@/domain/types/productOperations.types";
import { apiClient } from "../apiClient";
import { apiEndpoints } from "../../config/apiEndpoints";

const templates = apiEndpoints.pricingTemplates;

const buildQuery = (params?: PricingTemplateListParams) => {
  if (!params) return "";
  const query = new URLSearchParams();
  if (params.templateKind != null) query.set("templateKind", String(params.templateKind));
  if (params.unitDefinitionId) query.set("unitDefinitionId", params.unitDefinitionId);
  if (params.includeInactive) query.set("includeInactive", "true");
  const serialized = query.toString();
  return serialized ? `?${serialized}` : "";
};

export class PricingTemplateRepository implements IPricingTemplateRepository {
  async list(params?: PricingTemplateListParams): Promise<PricingTemplateDto[]> {
    return apiClient.get<PricingTemplateDto[]>(`${templates.list}${buildQuery(params)}`);
  }

  async byId(id: string): Promise<PricingTemplateDto> {
    return apiClient.get<PricingTemplateDto>(templates.byId(id));
  }

  async usages(id: string): Promise<PricingTemplateUsageDto[]> {
    return apiClient.get<PricingTemplateUsageDto[]>(templates.usages(id));
  }

  async create(payload: CreatePricingTemplateRequestDto): Promise<PricingTemplateDto> {
    return apiClient.post<PricingTemplateDto>(templates.list, payload);
  }

  async update(id: string, payload: UpdatePricingTemplateRequestDto): Promise<void> {
    await apiClient.put<void>(templates.byId(id), payload);
  }

  async delete(id: string): Promise<void> {
    await apiClient.delete<void>(templates.byId(id));
  }

  async apply(id: string, payload: ApplyPricingTemplateRequestDto): Promise<ApplyPricingTemplateResultDto> {
    return apiClient.post<ApplyPricingTemplateResultDto>(templates.apply(id), payload);
  }

  async applyBulk(id: string, payload: ApplyPricingTemplateBulkRequestDto): Promise<ApplyPricingTemplateResultDto[]> {
    return apiClient.post<ApplyPricingTemplateResultDto[]>(templates.applyBulk(id), payload);
  }

  async saveRuleAsTemplate(ruleId: string, payload: SavePricingRuleAsTemplateRequestDto): Promise<PricingTemplateDto> {
    return apiClient.post<PricingTemplateDto>(templates.saveRuleAsTemplate(ruleId), payload);
  }
}

export const pricingTemplateRepository = new PricingTemplateRepository();
