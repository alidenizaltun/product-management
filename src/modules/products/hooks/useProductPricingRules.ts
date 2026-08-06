import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { productsApi } from "@/modules/products/api/products.api";
import { queryKeys } from "@/services/query/queryKeys";
import type { ProductPricingRuleDto, UpsertProductPricingRuleRequestDto } from "@/shared/types/productOperations.types";

export const useProductPricingRules = (productId?: string) =>
  useQuery({
    queryKey: productId ? queryKeys.products.pricingRules(productId) : ["products", "missing", "pricing-rules"],
    queryFn: () => productsApi.getPricingRules(productId as string),
    enabled: Boolean(productId),
  });

export const useProductPricingRuleMutations = (productId?: string) => {
  const queryClient = useQueryClient();
  const pricingRulesKey = productId ? queryKeys.products.pricingRules(productId) : undefined;

  const invalidate = () => {
    if (!productId) return;
    queryClient.invalidateQueries({ queryKey: queryKeys.products.pricingRules(productId) });
    queryClient.invalidateQueries({ queryKey: queryKeys.products.detail(productId) });
  };

  const createMutation = useMutation({
    mutationFn: (payload: UpsertProductPricingRuleRequestDto) =>
      productsApi.createPricingRule(productId as string, payload),
    onSuccess: (created) => {
      if (pricingRulesKey) {
        queryClient.setQueryData<ProductPricingRuleDto[]>(pricingRulesKey, (current = []) => [
          ...current.filter((rule) => rule.id !== created.id),
          created,
        ]);
      }
      invalidate();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpsertProductPricingRuleRequestDto }) =>
      productsApi.updatePricingRule(id, payload),
    onSuccess: (_data, variables) => {
      if (pricingRulesKey) {
        queryClient.setQueryData<ProductPricingRuleDto[]>(pricingRulesKey, (current = []) =>
          current.map((rule) => (rule.id === variables.id ? { ...rule, ...variables.payload } : rule))
        );
      }
      queryClient.invalidateQueries({ queryKey: queryKeys.products.pricingRule(variables.id) });
      invalidate();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => productsApi.deletePricingRule(id),
    onSuccess: (_data, id) => {
      if (pricingRulesKey) {
        queryClient.setQueryData<ProductPricingRuleDto[]>(pricingRulesKey, (current = []) =>
          current.filter((rule) => rule.id !== id)
        );
      }
      queryClient.invalidateQueries({ queryKey: queryKeys.products.pricingRule(id) });
      invalidate();
    },
  });

  const reorderMutation = useMutation({
    mutationFn: (orderedPricingRuleIds: string[]) =>
      productsApi.reorderPricingRules(productId as string, orderedPricingRuleIds),
    onMutate: (orderedPricingRuleIds: string[]) => {
      if (!pricingRulesKey) return;
      queryClient.setQueryData<ProductPricingRuleDto[]>(pricingRulesKey, (current = []) => {
        const byId = new Map(current.map((rule) => [rule.id, rule]));
        return orderedPricingRuleIds
          .map((id, index) => {
            const rule = byId.get(id);
            return rule ? { ...rule, priority: (index + 1) * 10 } : undefined;
          })
          .filter((rule): rule is ProductPricingRuleDto => Boolean(rule));
      });
    },
    onSettled: () => invalidate(),
  });

  return {
    createMutation,
    updateMutation,
    deleteMutation,
    reorderMutation,
  };
};
