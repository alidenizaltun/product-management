import { config } from "../config/appConfig";

export interface StoredUser {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  fullName: string;
  phoneNumber: string | null;
  emailConfirmed: boolean;
  isActive: boolean;
  roles: string[];
  createdAt: string;
}

export interface StoredTokens {
  accessToken: string;
  refreshToken: string;
}

class StorageService {
  private getStorage(persistent: boolean): Storage {
    return persistent ? localStorage : sessionStorage;
  }

  storeAuthData(tokens: StoredTokens, user: StoredUser, rememberMe = true): void {
    const storage = this.getStorage(rememberMe);
    storage.setItem(config.auth.tokenKey, tokens.accessToken);
    storage.setItem(config.auth.refreshTokenKey, tokens.refreshToken);
    storage.setItem(config.auth.userKey, JSON.stringify(user));
    if (rememberMe) {
      localStorage.setItem(config.auth.rememberMeKey, "true");
    }
  }

  clearAuthData(): void {
    [localStorage, sessionStorage].forEach((s) => {
      s.removeItem(config.auth.tokenKey);
      s.removeItem(config.auth.refreshTokenKey);
      s.removeItem(config.auth.userKey);
    });
    localStorage.removeItem(config.auth.rememberMeKey);
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

  getUser<T = StoredUser>(): T | null {
    const raw =
      localStorage.getItem(config.auth.userKey) ||
      sessionStorage.getItem(config.auth.userKey);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as T;
    } catch {
      return null;
    }
  }

  updateTokens(accessToken: string, refreshToken: string): void {
    const persistent = localStorage.getItem(config.auth.rememberMeKey) === "true";
    const storage = this.getStorage(persistent);
    storage.setItem(config.auth.tokenKey, accessToken);
    storage.setItem(config.auth.refreshTokenKey, refreshToken);
  }

  hasTokens(): boolean {
    return !!this.getAccessToken() && !!this.getRefreshToken();
  }
}

export const storageService = new StorageService();
