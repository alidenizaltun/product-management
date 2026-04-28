import { useMutation, useQueryClient } from "@tanstack/react-query";
import { productsApi } from "@/modules/products/api/products.api";
import { queryKeys } from "@/services/query/queryKeys";
import { CreateProductRequestDto, UpdateProductRequestDto } from "@/domain";

export const useProductMutations = () => {
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: (payload: CreateProductRequestDto) => productsApi.createProduct(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.products.all });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateProductRequestDto }) =>
      productsApi.updateProduct(id, payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.products.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.products.detail(variables.id) });
    },
  });

  return {
    createMutation,
    updateMutation,
  };
};
