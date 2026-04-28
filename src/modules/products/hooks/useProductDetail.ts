import { useQuery } from "@tanstack/react-query";
import { productsApi } from "@/modules/products/api/products.api";
import { queryKeys } from "@/services/query/queryKeys";

export const useProductDetail = (id?: string) => {
  return useQuery({
    queryKey: id ? queryKeys.products.detail(id) : ["products", "detail", "missing"],
    queryFn: () => productsApi.getProductById(id as string),
    enabled: Boolean(id),
  });
};
