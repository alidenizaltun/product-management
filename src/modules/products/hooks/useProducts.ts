import { useQuery } from "@tanstack/react-query";
import { productsApi } from "@/modules/products/api/products.api";
import { queryKeys } from "@/services/query/queryKeys";
import { ProductFilterDto } from "@/domain";

export const useProducts = (params?: ProductFilterDto & { page?: number; pageSize?: number }) => {
  return useQuery({
    queryKey: queryKeys.products.list((params ?? {}) as Record<string, unknown>),
    queryFn: () => productsApi.getProducts(params),
  });
};
