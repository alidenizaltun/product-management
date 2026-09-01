import { User } from "../entities/User";
import {
  AuthResponse,
  ChangePasswordRequest,
  ForgotPasswordRequest,
  LoginRequest,
  RegisterRequest,
  ResetPasswordRequest,
} from "../types/auth.types";

export interface IAuthRepository {
  login(request: LoginRequest): Promise<AuthResponse>;
  register(request: RegisterRequest): Promise<AuthResponse>;
  logout(): Promise<void>;
  logoutAll(): Promise<void>;
  getCurrentUser(): Promise<User>;
  changePassword(request: ChangePasswordRequest): Promise<AuthResponse>;
  forgotPassword(request: ForgotPasswordRequest): Promise<boolean>;
  resetPassword(request: ResetPasswordRequest): Promise<AuthResponse>;
  confirmEmail(userId: string, token: string): Promise<boolean>;
}
