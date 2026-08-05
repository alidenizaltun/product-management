import { apiClient } from "@/shared/api/apiClient";
import { apiEndpoints } from "@/shared/config/apiEndpoints";
import type {
    AdminUser,
    CreateRoleRequest,
    CreateUserRequest,
    PermissionDefinition,
    Role,
    UpdateRoleRequest,
    UpdateUserRequest,
} from "@/shared/types/identity.types";

const usersEp = apiEndpoints.identity;

export const usersApi = {
    getAll: (search?: string, includeInactive = false): Promise<AdminUser[]> => {
        const params = new URLSearchParams();
        if (search) params.set("search", search);
        if (includeInactive) params.set("includeInactive", "true");
        const qs = params.toString();
        return apiClient.get<AdminUser[]>(`${usersEp.users}${qs ? `?${qs}` : ""}`);
    },

    getById: (id: string): Promise<AdminUser> =>
        apiClient.get<AdminUser>(usersEp.userById(id)),

    create: (payload: CreateUserRequest): Promise<AdminUser> =>
        apiClient.post<AdminUser>(usersEp.users, payload),

    update: (id: string, payload: UpdateUserRequest): Promise<void> =>
        apiClient.put<void>(usersEp.userById(id), payload),

    deactivate: (id: string): Promise<void> =>
        apiClient.delete<void>(usersEp.userById(id)),

    resendInvitation: (id: string): Promise<void> =>
        apiClient.post<void>(usersEp.resendInvitation(id)),
};

export const rolesApi = {
    getAll: (): Promise<Role[]> =>
        apiClient.get<Role[]>(usersEp.roles),

    getById: (id: string): Promise<Role> =>
        apiClient.get<Role>(usersEp.roleById(id)),

    create: (payload: CreateRoleRequest): Promise<Role> =>
        apiClient.post<Role>(usersEp.roles, payload),

    update: (id: string, payload: UpdateRoleRequest): Promise<void> =>
        apiClient.put<void>(usersEp.roleById(id), payload),

    delete: (id: string): Promise<void> =>
        apiClient.delete<void>(usersEp.roleById(id)),

    getPermissionCatalog: (): Promise<PermissionDefinition[]> =>
        apiClient.get<PermissionDefinition[]>(usersEp.permissionCatalog),
};
