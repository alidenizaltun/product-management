import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/services/query/queryKeys";
import { integrationsApi } from "@/modules/system/api/system.api";
import type { CreateIntegrationRequest, UpdateIntegrationRequest } from "@/shared/types/system.types";

export const useIntegrations = () =>
    useQuery({
        queryKey: queryKeys.system.integrations,
        queryFn: () => integrationsApi.getAll(),
    });

export const useIntegrationMutations = () => {
    const qc = useQueryClient();

    const invalidate = () => qc.invalidateQueries({ queryKey: queryKeys.system.integrations });

    const create = useMutation({
        mutationFn: (payload: CreateIntegrationRequest) => integrationsApi.create(payload),
        onSuccess: invalidate,
    });

    const update = useMutation({
        mutationFn: ({ id, payload }: { id: string; payload: UpdateIntegrationRequest }) =>
            integrationsApi.update(id, payload),
        onSuccess: invalidate,
    });

    const remove = useMutation({
        mutationFn: (id: string) => integrationsApi.delete(id),
        onSuccess: invalidate,
    });

    const test = useMutation({
        mutationFn: (id: string) => integrationsApi.test(id),
        onSuccess: invalidate,
    });

    return { create, update, remove, test };
};
