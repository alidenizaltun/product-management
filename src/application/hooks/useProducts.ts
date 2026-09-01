import { useQuery } from "@tanstack/react-query";
import { productRepository } from "@/infrastructure/api/repositories";
import { queryKeys } from "@/services/query/queryKeys";
import { ProductFilterDto } from "@/domain/types/productOperations.types";

export const useProducts = (params?: ProductFilterDto & { page?: number; pageSize?: number }) => {
  return useQuery({
    queryKey: queryKeys.products.list((params ?? {}) as Record<string, unknown>),
    queryFn: () => productRepository.getProducts(params),
  });
};
