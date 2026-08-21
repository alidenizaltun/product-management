import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/services/query/queryKeys";
import { regionsApi } from "@/modules/catalog/api/catalog.api";
import type {
    CreateRegionRequestDto,
    UpdateRegionRequestDto,
} from "@/shared/types/productOperations.types";

export const useRegions = (includeInactive = false) =>
    useQuery({
        queryKey: [...queryKeys.catalog.regions, includeInactive],
        queryFn: () => regionsApi.list(includeInactive),
    });

export const useRegion = (id?: string) =>
    useQuery({
        queryKey: id ? queryKeys.catalog.region(id) : ["catalog", "regions", "missing"],
        queryFn: () => regionsApi.byId(id as string),
        enabled: Boolean(id),
    });

export const useRegionMutations = () => {
    const qc = useQueryClient();

    const invalidate = () => {
        qc.invalidateQueries({ queryKey: queryKeys.catalog.regions });
        qc.invalidateQueries({ queryKey: ["lookups", "regions"] });
    };

    const create = useMutation({
        mutationFn: (payload: CreateRegionRequestDto) => regionsApi.create(payload),
        onSuccess: invalidate,
    });

    const update = useMutation({
        mutationFn: ({ id, payload }: { id: string; payload: UpdateRegionRequestDto }) =>
            regionsApi.update(id, payload),
        onSuccess: invalidate,
    });

    const remove = useMutation({
        mutationFn: (id: string) => regionsApi.delete(id),
        onSuccess: invalidate,
    });

    return { create, update, remove };
};
