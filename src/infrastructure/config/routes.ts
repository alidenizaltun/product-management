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
    home: "/products",
    products: "/products",
  },
} as const;
