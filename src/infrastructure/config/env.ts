export const config = {
    api: {
        baseUrl: import.meta.env.VITE_API_BASE_URL || "https://localhost:7052/",
        timeout: 30000,
    },
    auth: {
        tokenKey: "pm_access_token",
        refreshTokenKey: "pm_refresh_token",
        userKey: "pm_user",
        rememberMeKey: "pm_remember_me",
    },
    app: {
        name: import.meta.env.VITE_APP_NAME || "Product Manager",
        version: import.meta.env.VITE_APP_VERSION || "1.0.0",
    },
    routes: {
        login: "/login",
        register: "/register",
        forgotPassword: "/forgot-password",
        resetPassword: "/reset-password",
        confirmEmail: "/confirm-email",
        success: "/auth-success",
        dashboard: "/",
    },
} as const;

export type Config = typeof config;
