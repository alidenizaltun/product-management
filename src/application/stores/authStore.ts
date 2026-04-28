import {
  AuthResponse,
  ChangePasswordRequest,
  ForgotPasswordRequest,
  LoginRequest,
  RegisterRequest,
  ResetPasswordRequest,
  User,
} from "@/domain";
import { authRepository } from "@/infrastructure/api";
import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { AuthUseCases } from "../usecases";

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

const authUseCases = new AuthUseCases(authRepository);

const getErrorMessage = (error: any, fallback: string): string => {
  if (Array.isArray(error?.response?.data?.errors)) {
    return error.response.data.errors.join(", ");
  }

  if (typeof error?.response?.data?.message === "string") {
    return error.response.data.message;
  }

  if (typeof error?.message === "string") {
    return error.message;
  }

  return fallback;
};

export const useAuthStore = create<AuthState>()(
  devtools(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (request: LoginRequest) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authUseCases.login(request);

          if (response.succeeded && response.user) {
            set({
              user: response.user,
              isAuthenticated: true,
              isLoading: false,
            });
          } else {
            set({
              isLoading: false,
              error: response.errors?.join(", ") || "Giris basarisiz.",
            });
          }

          return response;
        } catch (error: any) {
          set({
            isLoading: false,
            error: getErrorMessage(error, "Giris basarisiz."),
          });
          throw error;
        }
      },

      register: async (request: RegisterRequest) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authUseCases.register(request);

          if (response.succeeded && response.user) {
            set({
              user: response.user,
              isAuthenticated: true,
              isLoading: false,
            });
          } else {
            set({
              isLoading: false,
              error: response.errors?.join(", ") || "Kayit islemi basarisiz.",
            });
          }

          return response;
        } catch (error: any) {
          set({
            isLoading: false,
            error: getErrorMessage(error, "Kayit islemi basarisiz."),
          });
          throw error;
        }
      },

      logout: async () => {
        set({ isLoading: true, error: null });
        try {
          await authUseCases.logout();
        } finally {
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
          });
        }
      },

      logoutAll: async () => {
        set({ isLoading: true, error: null });
        try {
          await authUseCases.logoutAll();
        } finally {
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
          });
        }
      },

      getCurrentUser: async () => {
        set({ isLoading: true, error: null });
        try {
          const user = await authUseCases.getCurrentUser();
          set({
            user,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch {
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
          });
        }
      },

      changePassword: async (request: ChangePasswordRequest) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authUseCases.changePassword(request);
          set({
            isLoading: false,
            error: response.succeeded ? null : response.errors.join(", "),
          });
          return response;
        } catch (error: any) {
          set({
            isLoading: false,
            error: getErrorMessage(error, "Sifre degistirme islemi basarisiz."),
          });
          throw error;
        }
      },

      forgotPassword: async (request: ForgotPasswordRequest) => {
        set({ isLoading: true, error: null });
        try {
          const result = await authUseCases.forgotPassword(request);
          set({ isLoading: false });
          return result;
        } catch (error: any) {
          set({
            isLoading: false,
            error: getErrorMessage(error, "Sifre sifirlama e-postasi gonderilemedi."),
          });
          throw error;
        }
      },

      resetPassword: async (request: ResetPasswordRequest) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authUseCases.resetPassword(request);
          set({
            isLoading: false,
            error: response.succeeded ? null : response.errors.join(", "),
          });
          return response;
        } catch (error: any) {
          set({
            isLoading: false,
            error: getErrorMessage(error, "Sifre sifirlama islemi basarisiz."),
          });
          throw error;
        }
      },

      confirmEmail: async (userId: string, token: string) => {
        set({ isLoading: true, error: null });
        try {
          const result = await authUseCases.confirmEmail(userId, token);
          set({ isLoading: false });
          return result;
        } catch (error: any) {
          set({
            isLoading: false,
            error: getErrorMessage(error, "E-posta onay islemi basarisiz."),
          });
          throw error;
        }
      },

      clearError: () => set({ error: null }),

      initialize: () => {
        const user = authUseCases.getCurrentUserFromStorage();
        const isAuthenticated = authUseCases.isAuthenticated();
        set({ user, isAuthenticated });
      },
    }),
    { name: "auth-store" }
  )
);

export const selectUser = (state: AuthState) => state.user;
export const selectIsAuthenticated = (state: AuthState) => state.isAuthenticated;
export const selectIsLoading = (state: AuthState) => state.isLoading;
export const selectError = (state: AuthState) => state.error;
