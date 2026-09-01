import {
  ApplyPricingTemplateBulkRequestDto,
  ApplyPricingTemplateRequestDto,
  ApplyPricingTemplateResultDto,
  CreatePricingTemplateRequestDto,
  PricingTemplateDto,
  PricingTemplateUsageDto,
  SavePricingRuleAsTemplateRequestDto,
  UpdatePricingTemplateRequestDto,
} from "../types/productOperations.types";

export interface PricingTemplateListParams {
  templateKind?: number;
  unitDefinitionId?: string;
  includeInactive?: boolean;
}

export interface IPricingTemplateRepository {
  list(params?: PricingTemplateListParams): Promise<PricingTemplateDto[]>;
  byId(id: string): Promise<PricingTemplateDto>;
  usages(id: string): Promise<PricingTemplateUsageDto[]>;
  create(payload: CreatePricingTemplateRequestDto): Promise<PricingTemplateDto>;
  update(id: string, payload: UpdatePricingTemplateRequestDto): Promise<void>;
  delete(id: string): Promise<void>;
  apply(id: string, payload: ApplyPricingTemplateRequestDto): Promise<ApplyPricingTemplateResultDto>;
  applyBulk(id: string, payload: ApplyPricingTemplateBulkRequestDto): Promise<ApplyPricingTemplateResultDto[]>;
  saveRuleAsTemplate(ruleId: string, payload: SavePricingRuleAsTemplateRequestDto): Promise<PricingTemplateDto>;
}
