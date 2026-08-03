import { useCallback, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { config } from "@/shared/config/appConfig";
import { useAuthStore } from "../stores/authStore";
import { LoginRequest, RegisterRequest } from "../types/auth.types";

export const useAuth = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const {
    user,
    isAuthenticated,
    isLoading,
    error,
    login: storeLogin,
    register: storeRegister,
    logout: storeLogout,
    logoutAll: storeLogoutAll,
    getCurrentUser,
    clearError,
    initialize,
  } = useAuthStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  const login = useCallback(
    async (request: LoginRequest) => {
      const response = await storeLogin(request);
      if (response.succeeded) {
        const from =
          (location.state as { from?: { pathname?: string } })?.from?.pathname ||
          config.routes.home;
        navigate(from, { replace: true });
      }
      return response;
    },
    [storeLogin, location.state, navigate]
  );

  const register = useCallback(
    async (request: RegisterRequest) => {
      const response = await storeRegister(request);
      if (response.succeeded) {
        navigate(config.routes.success, { replace: true });
      }
      return response;
    },
    [storeRegister, navigate]
  );

  const logout = useCallback(async () => {
    await storeLogout();
    navigate(config.routes.login, { replace: true });
  }, [storeLogout, navigate]);

  const logoutAll = useCallback(async () => {
    await storeLogoutAll();
    navigate(config.routes.login, { replace: true });
  }, [storeLogoutAll, navigate]);

  return {
    user,
    isAuthenticated,
    isLoading,
    error,
    login,
    register,
    logout,
    logoutAll,
    getCurrentUser,
    clearError,
  };
};
