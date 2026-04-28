import {
  AuthResponse,
  ChangePasswordRequest,
  ForgotPasswordRequest,
  LoginRequest,
  RefreshTokenRequest,
  RegisterRequest,
  ResetPasswordRequest,
} from "../types";
import { User } from "../entities";

export interface IAuthRepository {
  login(request: LoginRequest): Promise<AuthResponse>;
  register(request: RegisterRequest): Promise<AuthResponse>;
  refreshToken(request: RefreshTokenRequest): Promise<AuthResponse>;
  logout(): Promise<void>;
  logoutAll(): Promise<void>;
  getCurrentUser(): Promise<User>;
  changePassword(request: ChangePasswordRequest): Promise<AuthResponse>;
  forgotPassword(request: ForgotPasswordRequest): Promise<boolean>;
  resetPassword(request: ResetPasswordRequest): Promise<AuthResponse>;
  confirmEmail(userId: string, token: string): Promise<boolean>;
}
