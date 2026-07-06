import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { productsApi } from "@/modules/products/api/products.api";
import { queryKeys } from "@/services/query/queryKeys";
import type { CreateProductUnitRequestDto, UpdateProductUnitRequestDto } from "@/shared/types/productOperations.types";

export const useProductUnits = (productId?: string) =>
  useQuery({
    queryKey: productId ? queryKeys.products.units(productId) : ["products", "missing", "units"],
    queryFn: () => productsApi.getProductUnits(productId as string),
    enabled: Boolean(productId),
  });

export const useProductUnitMutations = (productId?: string) => {
  const queryClient = useQueryClient();

  const invalidate = () => {
    if (!productId) return;
    queryClient.invalidateQueries({ queryKey: queryKeys.products.detail(productId) });
    queryClient.invalidateQueries({ queryKey: queryKeys.products.units(productId) });
    queryClient.invalidateQueries({ queryKey: queryKeys.products.all });
  };

  const createMutation = useMutation({
    mutationFn: (payload: CreateProductUnitRequestDto) =>
      productsApi.createProductUnit(productId as string, payload),
    onSuccess: invalidate,
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateProductUnitRequestDto }) =>
      productsApi.updateProductUnit(id, payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.products.unit(variables.id) });
      invalidate();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => productsApi.deleteProductUnit(id),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.products.unit(id) });
      invalidate();
    },
  });

  return {
    createMutation,
    updateMutation,
    deleteMutation,
  };
};
