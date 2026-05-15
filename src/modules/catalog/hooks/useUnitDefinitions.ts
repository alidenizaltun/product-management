import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/services/query/queryKeys";
import { unitDefinitionsApi } from "@/services/unitDefinitions/unitDefinitions.api";
import type {
    CreateUnitDefinitionRequestDto,
    UpdateUnitDefinitionRequestDto,
} from "@/shared/types/productOperations.types";

export const useUnitDefinitions = (includeInactive = false) =>
    useQuery({
        queryKey: queryKeys.catalog.unitDefinitions,
        queryFn: () => unitDefinitionsApi.getAll(includeInactive),
    });

export const useUnitDefinition = (id?: string) =>
    useQuery({
        queryKey: id ? queryKeys.catalog.unitDefinition(id) : ["catalog", "unitDefinitions", "missing"],
        queryFn: () => unitDefinitionsApi.getById(id as string),
        enabled: Boolean(id),
    });

export const useUnitDefinitionMutations = () => {
    const qc = useQueryClient();

    const invalidate = () => {
        qc.invalidateQueries({ queryKey: queryKeys.catalog.unitDefinitions });
    };

    const create = useMutation({
        mutationFn: (payload: CreateUnitDefinitionRequestDto) => unitDefinitionsApi.create(payload),
        onSuccess: invalidate,
    });

    const update = useMutation({
        mutationFn: ({ id, payload }: { id: string; payload: UpdateUnitDefinitionRequestDto }) =>
            unitDefinitionsApi.update(id, payload),
        onSuccess: invalidate,
    });

    const remove = useMutation({
        mutationFn: (id: string) => unitDefinitionsApi.delete(id),
        onSuccess: invalidate,
    });

    return { create, update, remove };
};
