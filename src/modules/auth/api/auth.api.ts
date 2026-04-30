import { apiClient } from "@/shared/api/apiClient";
import { apiEndpoints } from "@/shared/config/apiEndpoints";
import {
  AuthResponse,
  ChangePasswordRequest,
  ForgotPasswordRequest,
  LoginRequest,
  RegisterRequest,
  ResetPasswordRequest,
  User,
} from "../types/auth.types";

export const authApi = {
  login: (request: LoginRequest): Promise<AuthResponse> =>
    apiClient.post<AuthResponse>(apiEndpoints.auth.login, request),

  register: (request: RegisterRequest): Promise<AuthResponse> =>
    apiClient.post<AuthResponse>(apiEndpoints.auth.register, request),

  logout: (): Promise<void> =>
    apiClient.post<void>(apiEndpoints.auth.logout),

  logoutAll: (): Promise<void> =>
    apiClient.post<void>(apiEndpoints.auth.logoutAll),

  getCurrentUser: (): Promise<User> =>
    apiClient.get<User>(apiEndpoints.auth.getCurrentUser),

  changePassword: (request: ChangePasswordRequest): Promise<AuthResponse> =>
    apiClient.post<AuthResponse>(apiEndpoints.auth.changePassword, request),

  forgotPassword: async (request: ForgotPasswordRequest): Promise<boolean> => {
    await apiClient.post(apiEndpoints.auth.forgotPassword, request);
    return true;
  },

  resetPassword: (request: ResetPasswordRequest): Promise<AuthResponse> =>
    apiClient.post<AuthResponse>(apiEndpoints.auth.resetPassword, request),

  confirmEmail: async (userId: string, token: string): Promise<boolean> => {
    const params = new URLSearchParams({ userId, token });
    await apiClient.get(`${apiEndpoints.auth.confirmEmail}?${params}`);
    return true;
  },
};
