import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/services/query/queryKeys";
import { regionRepository } from "@/infrastructure/api/repositories";
import type {
    CreateRegionRequestDto,
    UpdateRegionRequestDto,
} from "@/domain/types/productOperations.types";

export const useRegions = (includeInactive = false) =>
    useQuery({
        queryKey: [...queryKeys.catalog.regions, includeInactive],
        queryFn: () => regionRepository.list(includeInactive),
    });

export const useRegion = (id?: string) =>
    useQuery({
        queryKey: id ? queryKeys.catalog.region(id) : ["catalog", "regions", "missing"],
        queryFn: () => regionRepository.byId(id as string),
        enabled: Boolean(id),
    });

export const useRegionMutations = () => {
    const qc = useQueryClient();

    const invalidate = () => {
        qc.invalidateQueries({ queryKey: queryKeys.catalog.regions });
        qc.invalidateQueries({ queryKey: ["lookups", "regions"] });
    };

    const create = useMutation({
        mutationFn: (payload: CreateRegionRequestDto) => regionRepository.create(payload),
        onSuccess: invalidate,
    });

    const update = useMutation({
        mutationFn: ({ id, payload }: { id: string; payload: UpdateRegionRequestDto }) =>
            regionRepository.update(id, payload),
        onSuccess: invalidate,
    });

    const remove = useMutation({
        mutationFn: (id: string) => regionRepository.delete(id),
        onSuccess: invalidate,
    });

    return { create, update, remove };
};
