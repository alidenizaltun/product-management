import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { pricingTemplatesApi } from "@/modules/pricing/api/pricingTemplates.api";
import type { PricingTemplateListParams } from "@/modules/pricing/api/pricingTemplates.api";
import { queryKeys } from "@/services/query/queryKeys";
import type {
  ApplyPricingTemplateBulkRequestDto,
  ApplyPricingTemplateRequestDto,
  CreatePricingTemplateRequestDto,
  SavePricingRuleAsTemplateRequestDto,
  UpdatePricingTemplateRequestDto,
} from "@/shared/types/productOperations.types";

export const pricingTemplateKeys = {
  all: ["pricing", "templates"] as const,
  list: (params?: PricingTemplateListParams) => ["pricing", "templates", "list", params ?? {}] as const,
  detail: (id: string) => ["pricing", "templates", id] as const,
  usages: (id: string) => ["pricing", "templates", id, "usages"] as const,
};

export const usePricingTemplates = (params?: PricingTemplateListParams) =>
  useQuery({
    queryKey: pricingTemplateKeys.list(params),
    queryFn: () => pricingTemplatesApi.list(params),
  });

export const usePricingTemplate = (id?: string) =>
  useQuery({
    queryKey: id ? pricingTemplateKeys.detail(id) : ["pricing", "templates", "missing"],
    queryFn: () => pricingTemplatesApi.byId(id as string),
    enabled: Boolean(id),
  });

export const usePricingTemplateUsages = (id?: string) =>
  useQuery({
    queryKey: id ? pricingTemplateKeys.usages(id) : ["pricing", "templates", "missing", "usages"],
    queryFn: () => pricingTemplatesApi.usages(id as string),
    enabled: Boolean(id),
  });

export const usePricingTemplateMutations = () => {
  const queryClient = useQueryClient();

  const invalidateTemplates = () =>
    queryClient.invalidateQueries({ queryKey: pricingTemplateKeys.all });

  /** Şablon uygulandığında hedef ürünün kuralları ve birimleri de değişir. */
  const invalidateProduct = (productId: string) => {
    queryClient.invalidateQueries({ queryKey: queryKeys.products.pricingRules(productId) });
    queryClient.invalidateQueries({ queryKey: queryKeys.products.units(productId) });
    queryClient.invalidateQueries({ queryKey: queryKeys.products.detail(productId) });
  };

  return {
    create: useMutation({
      mutationFn: (payload: CreatePricingTemplateRequestDto) => pricingTemplatesApi.create(payload),
      onSuccess: invalidateTemplates,
    }),
    update: useMutation({
      mutationFn: (vars: { id: string; payload: UpdatePricingTemplateRequestDto }) =>
        pricingTemplatesApi.update(vars.id, vars.payload),
      onSuccess: invalidateTemplates,
    }),
    remove: useMutation({
      mutationFn: (id: string) => pricingTemplatesApi.delete(id),
      onSuccess: invalidateTemplates,
    }),
    apply: useMutation({
      mutationFn: (vars: { id: string; payload: ApplyPricingTemplateRequestDto }) =>
        pricingTemplatesApi.apply(vars.id, vars.payload),
      onSuccess: (_data, vars) => {
        invalidateTemplates();
        invalidateProduct(vars.payload.productId);
      },
    }),
    applyBulk: useMutation({
      mutationFn: (vars: { id: string; payload: ApplyPricingTemplateBulkRequestDto }) =>
        pricingTemplatesApi.applyBulk(vars.id, vars.payload),
      onSuccess: (_data, vars) => {
        invalidateTemplates();
        vars.payload.productIds.forEach(invalidateProduct);
      },
    }),
    saveRuleAsTemplate: useMutation({
      mutationFn: (vars: { ruleId: string; payload: SavePricingRuleAsTemplateRequestDto }) =>
        pricingTemplatesApi.saveRuleAsTemplate(vars.ruleId, vars.payload),
      onSuccess: invalidateTemplates,
    }),
  };
};
