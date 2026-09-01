import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/services/query/queryKeys";
import { unitDefinitionRepository } from "@/infrastructure/api/repositories";
import type {
    CreateUnitDefinitionRequestDto,
    UpdateUnitDefinitionRequestDto,
} from "@/domain/types/productOperations.types";

export const useUnitDefinitions = (includeInactive = false) =>
    useQuery({
        queryKey: queryKeys.catalog.unitDefinitions,
        queryFn: () => unitDefinitionRepository.getAll(includeInactive),
    });

export const useUnitDefinition = (id?: string) =>
    useQuery({
        queryKey: id ? queryKeys.catalog.unitDefinition(id) : ["catalog", "unitDefinitions", "missing"],
        queryFn: () => unitDefinitionRepository.getById(id as string),
        enabled: Boolean(id),
    });

export const useUnitDefinitionMutations = () => {
    const qc = useQueryClient();

    const invalidate = () => {
        qc.invalidateQueries({ queryKey: queryKeys.catalog.unitDefinitions });
    };

    const create = useMutation({
        mutationFn: (payload: CreateUnitDefinitionRequestDto) => unitDefinitionRepository.create(payload),
        onSuccess: invalidate,
    });

    const update = useMutation({
        mutationFn: ({ id, payload }: { id: string; payload: UpdateUnitDefinitionRequestDto }) =>
            unitDefinitionRepository.update(id, payload),
        onSuccess: invalidate,
    });

    const remove = useMutation({
        mutationFn: (id: string) => unitDefinitionRepository.delete(id),
        onSuccess: invalidate,
    });

    return { create, update, remove };
};
