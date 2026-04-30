import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { authApi } from "../api/auth.api";
import { storageService } from "@/shared/storage/storageService";
import {
  AuthResponse,
  ChangePasswordRequest,
  ForgotPasswordRequest,
  LoginRequest,
  RegisterRequest,
  ResetPasswordRequest,
  User,
} from "../types/auth.types";

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  login: (request: LoginRequest) => Promise<AuthResponse>;
  register: (request: RegisterRequest) => Promise<AuthResponse>;
  logout: () => Promise<void>;
  logoutAll: () => Promise<void>;
  getCurrentUser: () => Promise<void>;
  changePassword: (request: ChangePasswordRequest) => Promise<AuthResponse>;
  forgotPassword: (request: ForgotPasswordRequest) => Promise<boolean>;
  resetPassword: (request: ResetPasswordRequest) => Promise<AuthResponse>;
  confirmEmail: (userId: string, token: string) => Promise<boolean>;
  clearError: () => void;
  initialize: () => void;
}

const extractErrorMessage = (error: unknown, fallback: string): string => {
  const err = error as { response?: { data?: { errors?: string[]; message?: string } }; message?: string };
  if (Array.isArray(err?.response?.data?.errors)) return err.response!.data!.errors!.join(", ");
  if (typeof err?.response?.data?.message === "string") return err.response!.data!.message!;
  if (typeof err?.message === "string") return err.message;
  return fallback;
};

export const useAuthStore = create<AuthState>()(
  devtools(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (request) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authApi.login(request);
          if (response.succeeded && response.token && response.user) {
            storageService.storeAuthData(response.token, response.user, request.rememberMe ?? false);
            set({ user: response.user, isAuthenticated: true, isLoading: false });
          } else {
            set({ isLoading: false, error: response.errors?.join(", ") || "Giriş başarısız." });
          }
          return response;
        } catch (error) {
          set({ isLoading: false, error: extractErrorMessage(error, "Giriş başarısız.") });
          throw error;
        }
      },

      register: async (request) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authApi.register(request);
          if (response.succeeded && response.token && response.user) {
            storageService.storeAuthData(response.token, response.user, false);
            set({ user: response.user, isAuthenticated: true, isLoading: false });
          } else {
            set({ isLoading: false, error: response.errors?.join(", ") || "Kayıt işlemi başarısız." });
          }
          return response;
        } catch (error) {
          set({ isLoading: false, error: extractErrorMessage(error, "Kayıt işlemi başarısız.") });
          throw error;
        }
      },

      logout: async () => {
        set({ isLoading: true, error: null });
        try {
          await authApi.logout();
        } finally {
          storageService.clearAuthData();
          set({ user: null, isAuthenticated: false, isLoading: false });
        }
      },

      logoutAll: async () => {
        set({ isLoading: true, error: null });
        try {
          await authApi.logoutAll();
        } finally {
          storageService.clearAuthData();
          set({ user: null, isAuthenticated: false, isLoading: false });
        }
      },

      getCurrentUser: async () => {
        set({ isLoading: true, error: null });
        try {
          const user = await authApi.getCurrentUser();
          set({ user, isAuthenticated: true, isLoading: false });
        } catch {
          set({ user: null, isAuthenticated: false, isLoading: false });
        }
      },

      changePassword: async (request) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authApi.changePassword(request);
          set({ isLoading: false, error: response.succeeded ? null : response.errors.join(", ") });
          return response;
        } catch (error) {
          set({ isLoading: false, error: extractErrorMessage(error, "Şifre değiştirme işlemi başarısız.") });
          throw error;
        }
      },

      forgotPassword: async (request) => {
        set({ isLoading: true, error: null });
        try {
          const result = await authApi.forgotPassword(request);
          set({ isLoading: false });
          return result;
        } catch (error) {
          set({ isLoading: false, error: extractErrorMessage(error, "Şifre sıfırlama e-postası gönderilemedi.") });
          throw error;
        }
      },

      resetPassword: async (request) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authApi.resetPassword(request);
          set({ isLoading: false, error: response.succeeded ? null : response.errors.join(", ") });
          return response;
        } catch (error) {
          set({ isLoading: false, error: extractErrorMessage(error, "Şifre sıfırlama işlemi başarısız.") });
          throw error;
        }
      },

      confirmEmail: async (userId, token) => {
        set({ isLoading: true, error: null });
        try {
          const result = await authApi.confirmEmail(userId, token);
          set({ isLoading: false });
          return result;
        } catch (error) {
          set({ isLoading: false, error: extractErrorMessage(error, "E-posta onay işlemi başarısız.") });
          throw error;
        }
      },

      clearError: () => set({ error: null }),

      initialize: () => {
        const user = storageService.getUser<User>();
        const isAuthenticated = storageService.hasTokens() && !!user;
        set({ user, isAuthenticated });
      },
    }),
    { name: "auth-store" }
  )
);
