import {
  AuthResponse,
  ChangePasswordRequest,
  ForgotPasswordRequest,
  IAuthRepository,
  LoginRequest,
  RegisterRequest,
  ResetPasswordRequest,
  User,
} from "@/domain";
import { storageService } from "@/infrastructure/storage";

export class AuthUseCases {
  constructor(private authRepository: IAuthRepository) {}

  async login(request: LoginRequest): Promise<AuthResponse> {
    const response = await this.authRepository.login(request);

    if (response.succeeded && response.token && response.user) {
      this.storeAuthData(response.token, response.user, request.rememberMe ?? false);
    }

    return response;
  }

  async register(request: RegisterRequest): Promise<AuthResponse> {
    const response = await this.authRepository.register(request);

    if (response.succeeded && response.token && response.user) {
      this.storeAuthData(response.token, response.user, false);
    }

    return response;
  }

  async logout(): Promise<void> {
    try {
      await this.authRepository.logout();
    } finally {
      this.clearAuthData();
    }
  }

  async logoutAll(): Promise<void> {
    try {
      await this.authRepository.logoutAll();
    } finally {
      this.clearAuthData();
    }
  }

  async getCurrentUser(): Promise<User> {
    return this.authRepository.getCurrentUser();
  }

  async changePassword(request: ChangePasswordRequest): Promise<AuthResponse> {
    return this.authRepository.changePassword(request);
  }

  async forgotPassword(request: ForgotPasswordRequest): Promise<boolean> {
    return this.authRepository.forgotPassword(request);
  }

  async resetPassword(request: ResetPasswordRequest): Promise<AuthResponse> {
    return this.authRepository.resetPassword(request);
  }

  async confirmEmail(userId: string, token: string): Promise<boolean> {
    return this.authRepository.confirmEmail(userId, token);
  }

  isAuthenticated(): boolean {
    return storageService.hasTokens() && !!storageService.getUser();
  }

  getCurrentUserFromStorage(): User | null {
    return storageService.getUser();
  }

  private storeAuthData(token: AuthResponse["token"], user: User, rememberMe = false): void {
    if (!token) {
      return;
    }

    storageService.storeAuthData(token, user, rememberMe);
  }

  private clearAuthData(): void {
    storageService.clearAuthData();
  }
}
