import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { productsApi } from "@/modules/products/api/products.api";
import { queryKeys } from "@/services/query/queryKeys";
import type { UpsertProductPricingRuleRequestDto } from "@/shared/types/productOperations.types";

export const useProductPricingRules = (productId?: string) =>
  useQuery({
    queryKey: productId ? queryKeys.products.pricingRules(productId) : ["products", "missing", "pricing-rules"],
    queryFn: () => productsApi.getPricingRules(productId as string),
    enabled: Boolean(productId),
  });

export const useProductPricingRuleMutations = (productId?: string) => {
  const queryClient = useQueryClient();

  const invalidate = () => {
    if (!productId) return;
    queryClient.invalidateQueries({ queryKey: queryKeys.products.pricingRules(productId) });
    queryClient.invalidateQueries({ queryKey: queryKeys.products.detail(productId) });
  };

  const createMutation = useMutation({
    mutationFn: (payload: UpsertProductPricingRuleRequestDto) =>
      productsApi.createPricingRule(productId as string, payload),
    onSuccess: invalidate,
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpsertProductPricingRuleRequestDto }) =>
      productsApi.updatePricingRule(id, payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.products.pricingRule(variables.id) });
      invalidate();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => productsApi.deletePricingRule(id),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.products.pricingRule(id) });
      invalidate();
    },
  });

  return {
    createMutation,
    updateMutation,
    deleteMutation,
  };
};
