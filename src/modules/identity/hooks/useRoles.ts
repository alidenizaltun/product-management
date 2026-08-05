import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/services/query/queryKeys";
import { rolesApi } from "@/modules/identity/api/identity.api";
import type { CreateRoleRequest, UpdateRoleRequest } from "@/shared/types/identity.types";

export const useRoles = () =>
    useQuery({
        queryKey: queryKeys.identity.roles,
        queryFn: () => rolesApi.getAll(),
    });

export const useRole = (id?: string) =>
    useQuery({
        queryKey: id ? queryKeys.identity.role(id) : ["identity", "roles", "missing"],
        queryFn: () => rolesApi.getById(id as string),
        enabled: Boolean(id),
    });

export const usePermissionCatalog = () =>
    useQuery({
        queryKey: queryKeys.identity.permissionCatalog,
        queryFn: () => rolesApi.getPermissionCatalog(),
        staleTime: Infinity,
    });

export const useRoleMutations = () => {
    const qc = useQueryClient();

    const invalidate = () => {
        qc.invalidateQueries({ queryKey: queryKeys.identity.roles });
    };

    const create = useMutation({
        mutationFn: (payload: CreateRoleRequest) => rolesApi.create(payload),
        onSuccess: invalidate,
    });

    const update = useMutation({
        mutationFn: ({ id, payload }: { id: string; payload: UpdateRoleRequest }) =>
            rolesApi.update(id, payload),
        onSuccess: invalidate,
    });

    const remove = useMutation({
        mutationFn: (id: string) => rolesApi.delete(id),
        onSuccess: invalidate,
    });

    return { create, update, remove };
};
