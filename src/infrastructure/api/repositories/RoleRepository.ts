import { IRoleRepository } from "@/domain/repositories/IRoleRepository";
import { CreateRoleRequest, PermissionDefinition, Role, UpdateRoleRequest } from "@/domain/types/identity.types";
import { apiClient } from "../apiClient";
import { apiEndpoints } from "../../config/apiEndpoints";

const ep = apiEndpoints.identity;

export class RoleRepository implements IRoleRepository {
  async getAll(): Promise<Role[]> {
    return apiClient.get<Role[]>(ep.roles);
  }

  async getById(id: string): Promise<Role> {
    return apiClient.get<Role>(ep.roleById(id));
  }

  async create(payload: CreateRoleRequest): Promise<Role> {
    return apiClient.post<Role>(ep.roles, payload);
  }

  async update(id: string, payload: UpdateRoleRequest): Promise<void> {
    await apiClient.put<void>(ep.roleById(id), payload);
  }

  async delete(id: string): Promise<void> {
    await apiClient.delete<void>(ep.roleById(id));
  }

  async getPermissionCatalog(): Promise<PermissionDefinition[]> {
    return apiClient.get<PermissionDefinition[]>(ep.permissionCatalog);
  }
}

export const roleRepository = new RoleRepository();
