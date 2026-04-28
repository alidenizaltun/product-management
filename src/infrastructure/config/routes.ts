export const routes = {
  public: {
    login: "/login",
    register: "/register",
    forgotPassword: "/forgot-password",
    resetPassword: "/reset-password",
    confirmEmail: "/confirm-email",
    success: "/auth-success",
  },
  protected: {
    dashboard: "/dashboard",
    products: "/products",
  },
} as const;
