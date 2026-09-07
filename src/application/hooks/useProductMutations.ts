import { useMutation, useQueryClient } from "@tanstack/react-query";
import { productRepository } from "@/infrastructure/api/repositories";
import { queryKeys } from "@/services/query/queryKeys";
import { invalidateLookups } from "./useLookups";
import { forgetRecentProduct } from "@/pages/products/utils/recentProducts";
import { CreateFullProductRequestDto, UpdateFullProductRequestDto } from "@/domain/types/productOperations.types";

export const useProductMutations = () => {
  const queryClient = useQueryClient();

  const createFullMutation = useMutation({
    mutationFn: (payload: CreateFullProductRequestDto) => productRepository.createFullProduct(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.products.all });
      invalidateLookups(queryClient);
    },
  });

  const updateFullMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateFullProductRequestDto }) =>
      productRepository.updateFullProduct(id, payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.products.all });
      invalidateLookups(queryClient);
      queryClient.invalidateQueries({ queryKey: queryKeys.products.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.products.pricingRules(variables.id) });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => productRepository.deleteProduct(id),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.products.all });
      invalidateLookups(queryClient);
      forgetRecentProduct(id);
    },
  });

  return {
    createFullMutation,
    updateFullMutation,
    deleteMutation,
  };
};
