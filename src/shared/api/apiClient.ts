import axios, {
  AxiosError,
  AxiosInstance,
  AxiosRequestConfig,
  InternalAxiosRequestConfig,
} from "axios";
import { config } from "../config/appConfig";
import { apiEndpoints } from "../config/apiEndpoints";
import { navigateTo } from "../navigation/navigationService";
import { storageService } from "../storage/storageService";

interface RefreshTokenResponse {
  succeeded: boolean;
  token?: { accessToken: string; refreshToken: string };
  errors?: string[];
}

class ApiClient {
  private instance: AxiosInstance;
  private isRefreshing = false;
  private failedQueue: Array<{
    resolve: (value?: unknown) => void;
    reject: (reason?: unknown) => void;
  }> = [];

  constructor() {
    this.instance = axios.create({
      baseURL: config.api.baseUrl,
      timeout: config.api.timeout,
      headers: { "Content-Type": "application/json" },
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    this.instance.interceptors.request.use(
      (requestConfig: InternalAxiosRequestConfig) => {
        const token = storageService.getAccessToken();
        if (token && requestConfig.headers) {
          requestConfig.headers.Authorization = `Bearer ${token}`;
        }
        return requestConfig;
      },
      (error) => Promise.reject(error)
    );

    this.instance.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & {
          _retry?: boolean;
        };

        const isAuthEndpoint =
          originalRequest?.url?.includes(apiEndpoints.auth.login) ||
          originalRequest?.url?.includes(apiEndpoints.auth.register) ||
          originalRequest?.url?.includes(apiEndpoints.auth.refreshToken);

        if (
          error.response?.status === 401 &&
          !originalRequest?._retry &&
          !isAuthEndpoint
        ) {
          if (this.isRefreshing) {
            return new Promise((resolve, reject) => {
              this.failedQueue.push({ resolve, reject });
            })
              .then(() => this.instance(originalRequest))
              .catch((err) => Promise.reject(err));
          }

          originalRequest._retry = true;
          this.isRefreshing = true;

          try {
            await this.refreshToken();
            this.processQueue(null);
            return this.instance(originalRequest);
          } catch (refreshError) {
            this.processQueue(refreshError);
            this.handleLogout();
            return Promise.reject(refreshError);
          } finally {
            this.isRefreshing = false;
          }
        }

        return Promise.reject({
          ...error,
          message: this.extractErrorMessage(error),
        });
      }
    );
  }

  private processQueue(error: unknown): void {
    this.failedQueue.forEach((item) => {
      if (error) item.reject(error);
      else item.resolve();
    });
    this.failedQueue = [];
  }

  private async refreshToken(): Promise<void> {
    const refreshToken = storageService.getRefreshToken();
    const accessToken = storageService.getAccessToken();

    if (!refreshToken || !accessToken) {
      throw new Error("Token bilgisi bulunamadı.");
    }

    const response = await axios.post<RefreshTokenResponse>(
      `${config.api.baseUrl}${apiEndpoints.auth.refreshToken}`,
      { accessToken, refreshToken }
    );

    if (response.data.succeeded && response.data.token) {
      storageService.updateTokens(
        response.data.token.accessToken,
        response.data.token.refreshToken
      );
      return;
    }

    const message =
      response.data.errors?.length
        ? response.data.errors.join(", ")
        : "Token yenileme başarısız.";

    throw new Error(message);
  }

  private extractErrorMessage(error: AxiosError | unknown): string {
    const err = error as AxiosError<{ errors?: string[]; message?: string; title?: string }>;

    if (Array.isArray(err?.response?.data?.errors)) {
      return err.response!.data!.errors!.join(", ");
    }
    if (typeof err?.response?.data?.message === "string") {
      return err.response!.data!.message!;
    }
    if (typeof err?.response?.data?.title === "string") {
      return err.response!.data!.title!;
    }
    if (err?.message) return err.message;

    return "Bir hata oluştu. Lütfen tekrar deneyin.";
  }

  private handleLogout(): void {
    storageService.clearAuthData();
    navigateTo(config.routes.login);
  }

  async get<T>(url: string, requestConfig?: AxiosRequestConfig): Promise<T> {
    const response = await this.instance.get<T>(url, requestConfig);
    return response.data;
  }

  async post<T>(url: string, data?: unknown, requestConfig?: AxiosRequestConfig): Promise<T> {
    const response = await this.instance.post<T>(url, data, requestConfig);
    return response.data;
  }

  async put<T>(url: string, data?: unknown, requestConfig?: AxiosRequestConfig): Promise<T> {
    const response = await this.instance.put<T>(url, data, requestConfig);
    return response.data;
  }

  async patch<T>(url: string, data?: unknown, requestConfig?: AxiosRequestConfig): Promise<T> {
    const response = await this.instance.patch<T>(url, data, requestConfig);
    return response.data;
  }

  async delete<T>(url: string, requestConfig?: AxiosRequestConfig): Promise<T> {
    const response = await this.instance.delete<T>(url, requestConfig);
    return response.data;
  }
}

export const apiClient = new ApiClient();
