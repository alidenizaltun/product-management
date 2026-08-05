import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/services/query/queryKeys";
import { usersApi } from "@/modules/identity/api/identity.api";
import type { CreateUserRequest, UpdateUserRequest } from "@/shared/types/identity.types";

export const useUsers = (search?: string, includeInactive = false) =>
    useQuery({
        queryKey: queryKeys.identity.users({ search, includeInactive }),
        queryFn: () => usersApi.getAll(search, includeInactive),
    });

export const useUser = (id?: string) =>
    useQuery({
        queryKey: id ? queryKeys.identity.user(id) : ["identity", "users", "missing"],
        queryFn: () => usersApi.getById(id as string),
        enabled: Boolean(id),
    });

export const useUserMutations = () => {
    const qc = useQueryClient();

    const invalidate = () => {
        qc.invalidateQueries({ queryKey: ["identity", "users"] });
    };

    const create = useMutation({
        mutationFn: (payload: CreateUserRequest) => usersApi.create(payload),
        onSuccess: invalidate,
    });

    const update = useMutation({
        mutationFn: ({ id, payload }: { id: string; payload: UpdateUserRequest }) =>
            usersApi.update(id, payload),
        onSuccess: invalidate,
    });

    const deactivate = useMutation({
        mutationFn: (id: string) => usersApi.deactivate(id),
        onSuccess: invalidate,
    });

    const resendInvitation = useMutation({
        mutationFn: (id: string) => usersApi.resendInvitation(id),
    });

    return { create, update, deactivate, resendInvitation };
};
