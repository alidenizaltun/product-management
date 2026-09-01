import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/services/query/queryKeys";
import { roleRepository } from "@/infrastructure/api/repositories";
import type { CreateRoleRequest, UpdateRoleRequest } from "@/domain/types/identity.types";

export const useRoles = () =>
    useQuery({
        queryKey: queryKeys.identity.roles,
        queryFn: () => roleRepository.getAll(),
    });

export const useRole = (id?: string) =>
    useQuery({
        queryKey: id ? queryKeys.identity.role(id) : ["identity", "roles", "missing"],
        queryFn: () => roleRepository.getById(id as string),
        enabled: Boolean(id),
    });

export const usePermissionCatalog = () =>
    useQuery({
        queryKey: queryKeys.identity.permissionCatalog,
        queryFn: () => roleRepository.getPermissionCatalog(),
        staleTime: Infinity,
    });

export const useRoleMutations = () => {
    const qc = useQueryClient();

    const invalidate = () => {
        qc.invalidateQueries({ queryKey: queryKeys.identity.roles });
    };

    const create = useMutation({
        mutationFn: (payload: CreateRoleRequest) => roleRepository.create(payload),
        onSuccess: invalidate,
    });

    const update = useMutation({
        mutationFn: ({ id, payload }: { id: string; payload: UpdateRoleRequest }) =>
            roleRepository.update(id, payload),
        onSuccess: invalidate,
    });

    const remove = useMutation({
        mutationFn: (id: string) => roleRepository.delete(id),
        onSuccess: invalidate,
    });

    return { create, update, remove };
};
