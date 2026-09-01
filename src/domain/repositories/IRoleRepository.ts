import { CreateRoleRequest, PermissionDefinition, Role, UpdateRoleRequest } from "../types/identity.types";

export interface IRoleRepository {
  getAll(): Promise<Role[]>;
  getById(id: string): Promise<Role>;
  create(payload: CreateRoleRequest): Promise<Role>;
  update(id: string, payload: UpdateRoleRequest): Promise<void>;
  delete(id: string): Promise<void>;
  getPermissionCatalog(): Promise<PermissionDefinition[]>;
}
