import { IAuthRepository } from "@/domain/repositories/IAuthRepository";
import { User } from "@/domain/entities/User";
import {
  AuthResponse,
  ChangePasswordRequest,
  ForgotPasswordRequest,
  LoginRequest,
  RegisterRequest,
  ResetPasswordRequest,
} from "@/domain/types/auth.types";
import { apiClient } from "../apiClient";
import { apiEndpoints } from "../../config/apiEndpoints";

export class AuthRepository implements IAuthRepository {
  async login(request: LoginRequest): Promise<AuthResponse> {
    return apiClient.post<AuthResponse>(apiEndpoints.auth.login, request);
  }

  async register(request: RegisterRequest): Promise<AuthResponse> {
    return apiClient.post<AuthResponse>(apiEndpoints.auth.register, request);
  }

  async logout(): Promise<void> {
    await apiClient.post<void>(apiEndpoints.auth.logout);
  }

  async logoutAll(): Promise<void> {
    await apiClient.post<void>(apiEndpoints.auth.logoutAll);
  }

  async getCurrentUser(): Promise<User> {
    return apiClient.get<User>(apiEndpoints.auth.getCurrentUser);
  }

  async changePassword(request: ChangePasswordRequest): Promise<AuthResponse> {
    return apiClient.post<AuthResponse>(apiEndpoints.auth.changePassword, request);
  }

  async forgotPassword(request: ForgotPasswordRequest): Promise<boolean> {
    await apiClient.post(apiEndpoints.auth.forgotPassword, request);
    return true;
  }

  async resetPassword(request: ResetPasswordRequest): Promise<AuthResponse> {
    return apiClient.post<AuthResponse>(apiEndpoints.auth.resetPassword, request);
  }

  async confirmEmail(userId: string, token: string): Promise<boolean> {
    const params = new URLSearchParams({ userId, token });
    await apiClient.get(`${apiEndpoints.auth.confirmEmail}?${params}`);
    return true;
  }
}

export const authRepository = new AuthRepository();
