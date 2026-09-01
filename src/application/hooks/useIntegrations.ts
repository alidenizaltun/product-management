import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/services/query/queryKeys";
import { integrationRepository } from "@/infrastructure/api/repositories";
import type { CreateIntegrationRequest, UpdateIntegrationRequest } from "@/domain/types/system.types";

export const useIntegrations = () =>
    useQuery({
        queryKey: queryKeys.system.integrations,
        queryFn: () => integrationRepository.getAll(),
    });

export const useIntegrationMutations = () => {
    const qc = useQueryClient();

    const invalidate = () => qc.invalidateQueries({ queryKey: queryKeys.system.integrations });

    const create = useMutation({
        mutationFn: (payload: CreateIntegrationRequest) => integrationRepository.create(payload),
        onSuccess: invalidate,
    });

    const update = useMutation({
        mutationFn: ({ id, payload }: { id: string; payload: UpdateIntegrationRequest }) =>
            integrationRepository.update(id, payload),
        onSuccess: invalidate,
    });

    const remove = useMutation({
        mutationFn: (id: string) => integrationRepository.delete(id),
        onSuccess: invalidate,
    });

    const test = useMutation({
        mutationFn: (id: string) => integrationRepository.test(id),
        onSuccess: invalidate,
    });

    return { create, update, remove, test };
};
