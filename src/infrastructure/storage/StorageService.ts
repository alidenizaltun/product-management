import { TokenResponse, User } from "@/domain";
import { config } from "../config";

class StorageService {
  private getStorage(persistent: boolean): Storage {
    return persistent ? localStorage : sessionStorage;
  }

  storeAuthData(token: TokenResponse, user: User, rememberMe = true): void {
    const storage = this.getStorage(rememberMe);

    storage.setItem(config.auth.tokenKey, token.accessToken);
    storage.setItem(config.auth.refreshTokenKey, token.refreshToken);
    storage.setItem(config.auth.userKey, JSON.stringify(user));

    if (rememberMe) {
      localStorage.setItem(config.auth.rememberMeKey, "true");
    }
  }

  clearAuthData(): void {
    localStorage.removeItem(config.auth.tokenKey);
    localStorage.removeItem(config.auth.refreshTokenKey);
    localStorage.removeItem(config.auth.userKey);
    localStorage.removeItem(config.auth.rememberMeKey);

    sessionStorage.removeItem(config.auth.tokenKey);
    sessionStorage.removeItem(config.auth.refreshTokenKey);
    sessionStorage.removeItem(config.auth.userKey);
  }

  getAccessToken(): string | null {
    return (
      localStorage.getItem(config.auth.tokenKey) ||
      sessionStorage.getItem(config.auth.tokenKey)
    );
  }

  getRefreshToken(): string | null {
    return (
      localStorage.getItem(config.auth.refreshTokenKey) ||
      sessionStorage.getItem(config.auth.refreshTokenKey)
    );
  }

  getUser(): User | null {
    const userStr =
      localStorage.getItem(config.auth.userKey) ||
      sessionStorage.getItem(config.auth.userKey);

    if (!userStr) {
      return null;
    }

    try {
      return JSON.parse(userStr) as User;
    } catch {
      return null;
    }
  }

  updateTokens(accessToken: string, refreshToken: string): void {
    const isRememberMe = localStorage.getItem(config.auth.rememberMeKey) === "true";
    const storage = this.getStorage(isRememberMe);
    storage.setItem(config.auth.tokenKey, accessToken);
    storage.setItem(config.auth.refreshTokenKey, refreshToken);
  }

  hasTokens(): boolean {
    return !!this.getAccessToken() && !!this.getRefreshToken();
  }
}

export const storageService = new StorageService();
