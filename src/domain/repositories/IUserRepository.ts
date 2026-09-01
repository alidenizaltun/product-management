import { AdminUser, CreateUserRequest, UpdateUserRequest } from "../types/identity.types";

export interface IUserRepository {
  getAll(search?: string, includeInactive?: boolean): Promise<AdminUser[]>;
  getById(id: string): Promise<AdminUser>;
  create(payload: CreateUserRequest): Promise<AdminUser>;
  update(id: string, payload: UpdateUserRequest): Promise<void>;
  deactivate(id: string): Promise<void>;
  resendInvitation(id: string): Promise<void>;
}
