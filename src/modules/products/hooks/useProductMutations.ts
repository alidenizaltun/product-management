import { useMutation, useQueryClient } from "@tanstack/react-query";
import { productsApi } from "@/modules/products/api/products.api";
import { queryKeys } from "@/services/query/queryKeys";
import { CreateFullProductRequestDto, UpdateFullProductRequestDto } from "@/shared/types/productOperations.types";

export const useProductMutations = () => {
  const queryClient = useQueryClient();

  const createFullMutation = useMutation({
    mutationFn: (payload: CreateFullProductRequestDto) => productsApi.createFullProduct(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.products.all });
    },
  });

  const updateFullMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateFullProductRequestDto }) =>
      productsApi.updateFullProduct(id, payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.products.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.products.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.products.pricingRules(variables.id) });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => productsApi.deleteProduct(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.products.all });
    },
  });

  return {
    createFullMutation,
    updateFullMutation,
    deleteMutation,
  };
};
