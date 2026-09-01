import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { productRepository } from "@/infrastructure/api/repositories";
import { queryKeys } from "@/services/query/queryKeys";
import type {
    CreateProductModuleOfferingPriceRequest,
    UpdateProductModuleOfferingPriceRequest,
    ProductModuleOfferingPriceDto,
} from "@/domain/types/productOperations.types";

export const useModuleOfferingPrices = (
    productId: string,
    moduleId: string,
    initialData?: ProductModuleOfferingPriceDto[]
) => {
    const queryClient = useQueryClient();
    const qk = queryKeys.products.moduleOfferingPrices(productId, moduleId);

    const query = useQuery({
        queryKey: qk,
        queryFn: () => productRepository.getModuleOfferingPrices(productId, moduleId),
        enabled: Boolean(productId && moduleId),
        initialData: initialData,
    });

    const invalidate = () => queryClient.invalidateQueries({ queryKey: qk });

    const create = useMutation({
        mutationFn: (payload: CreateProductModuleOfferingPriceRequest) =>
            productRepository.createModuleOfferingPrice(productId, moduleId, payload),
        onSuccess: invalidate,
    });

    const update = useMutation({
        mutationFn: ({ priceId, payload }: { priceId: string; payload: UpdateProductModuleOfferingPriceRequest }) =>
            productRepository.updateModuleOfferingPrice(productId, moduleId, priceId, payload),
        onSuccess: invalidate,
    });

    const remove = useMutation({
        mutationFn: (priceId: string) =>
            productRepository.deleteModuleOfferingPrice(productId, moduleId, priceId),
        onSuccess: invalidate,
    });

    return { query, create, update, remove };
};
