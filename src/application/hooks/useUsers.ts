import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/services/query/queryKeys";
import { userRepository } from "@/infrastructure/api/repositories";
import type { CreateUserRequest, UpdateUserRequest } from "@/domain/types/identity.types";

export const useUsers = (search?: string, includeInactive = false) =>
    useQuery({
        queryKey: queryKeys.identity.users({ search, includeInactive }),
        queryFn: () => userRepository.getAll(search, includeInactive),
    });

export const useUser = (id?: string) =>
    useQuery({
        queryKey: id ? queryKeys.identity.user(id) : ["identity", "users", "missing"],
        queryFn: () => userRepository.getById(id as string),
        enabled: Boolean(id),
    });

export const useUserMutations = () => {
    const qc = useQueryClient();

    const invalidate = () => {
        qc.invalidateQueries({ queryKey: ["identity", "users"] });
    };

    const create = useMutation({
        mutationFn: (payload: CreateUserRequest) => userRepository.create(payload),
        onSuccess: invalidate,
    });

    const update = useMutation({
        mutationFn: ({ id, payload }: { id: string; payload: UpdateUserRequest }) =>
            userRepository.update(id, payload),
        onSuccess: invalidate,
    });

    const deactivate = useMutation({
        mutationFn: (id: string) => userRepository.deactivate(id),
        onSuccess: invalidate,
    });

    const resendInvitation = useMutation({
        mutationFn: (id: string) => userRepository.resendInvitation(id),
    });

    return { create, update, deactivate, resendInvitation };
};
