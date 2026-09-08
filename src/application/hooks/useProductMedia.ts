import { useMutation, useQueryClient } from "@tanstack/react-query";
import { productRepository } from "@/infrastructure/api/repositories";
import { queryKeys } from "@/services/query/queryKeys";
import { invalidateLookups } from "./useLookups";

export const useProductMedia = () => {
  const queryClient = useQueryClient();

  const uploadImagesMutation = useMutation({
    mutationFn: ({ productId, files }: { productId: string; files: File[] }) =>
      productRepository.uploadProductImages(productId, files),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["products", "list"] });
      queryClient.invalidateQueries({ queryKey: queryKeys.products.media(variables.productId) });
      invalidateLookups(queryClient);
    },
  });

  return { uploadImagesMutation };
};
