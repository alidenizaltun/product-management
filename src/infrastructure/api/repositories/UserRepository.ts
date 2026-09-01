import { IUserRepository } from "@/domain/repositories/IUserRepository";
import { AdminUser, CreateUserRequest, UpdateUserRequest } from "@/domain/types/identity.types";
import { apiClient } from "../apiClient";
import { apiEndpoints } from "../../config/apiEndpoints";

const ep = apiEndpoints.identity;

export class UserRepository implements IUserRepository {
  async getAll(search?: string, includeInactive = false): Promise<AdminUser[]> {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (includeInactive) params.set("includeInactive", "true");
    const qs = params.toString();
    return apiClient.get<AdminUser[]>(`${ep.users}${qs ? `?${qs}` : ""}`);
  }

  async getById(id: string): Promise<AdminUser> {
    return apiClient.get<AdminUser>(ep.userById(id));
  }

  async create(payload: CreateUserRequest): Promise<AdminUser> {
    return apiClient.post<AdminUser>(ep.users, payload);
  }

  async update(id: string, payload: UpdateUserRequest): Promise<void> {
    await apiClient.put<void>(ep.userById(id), payload);
  }

  async deactivate(id: string): Promise<void> {
    await apiClient.delete<void>(ep.userById(id));
  }

  async resendInvitation(id: string): Promise<void> {
    await apiClient.post<void>(ep.resendInvitation(id));
  }
}

export const userRepository = new UserRepository();
