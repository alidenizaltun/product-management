import { useQuery } from "@tanstack/react-query";
import { productRepository } from "@/infrastructure/api/repositories";
import { queryKeys } from "@/services/query/queryKeys";

export const useProductDetail = (id?: string) => {
  return useQuery({
    queryKey: id ? queryKeys.products.detail(id) : ["products", "detail", "missing"],
    queryFn: () => productRepository.getProductDetail(id as string),
    enabled: Boolean(id),
  });
};
