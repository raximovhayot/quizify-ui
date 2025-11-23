import axios, {
  AxiosError,
  AxiosInstance,
  InternalAxiosRequestConfig,
} from 'axios';

// Extend Axios instance with helper methods used by client-only providers
export interface ApiClient extends AxiosInstance {
  setAuthToken: (token: string | null) => void;
  setTokenRefreshHandler: (handler: () => Promise<string | null>) => void;
}

let tokenRefreshHandler: null | (() => Promise<string | null>) = null;

// Create axios instance
export const apiClient: ApiClient = axios.create({
  baseURL:
    (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080') + '/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
}) as ApiClient;

// Attach helper methods so other parts of the app (e.g., TokenSyncProvider)
// can push tokens into the transport layer and provide a refresh function.
apiClient.setAuthToken = (token: string | null) => {
  if (token) {
    apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('accessToken', token);
      } catch {}
    }
  } else {
    delete apiClient.defaults.headers.common['Authorization'];
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem('accessToken');
      } catch {}
    }
  }
};

apiClient.setTokenRefreshHandler = (handler: () => Promise<string | null>) => {
  tokenRefreshHandler = handler;
};

// Request interceptor - add auth token
apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    // If no Authorization header present yet, try to hydrate from defaults or localStorage
    const hasAuthHeader = !!config.headers?.Authorization;
    const defaultAuth = apiClient.defaults.headers.common['Authorization'] as
      | string
      | undefined;

    if (!hasAuthHeader && defaultAuth) {
      config.headers.Authorization = defaultAuth;
    } else if (!hasAuthHeader && typeof window !== 'undefined') {
      try {
        const accessToken = localStorage.getItem('accessToken');
        if (accessToken) {
          apiClient.setAuthToken(accessToken);
          config.headers.Authorization = `Bearer ${accessToken}`;
        }
      } catch {}
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handle errors and token refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // If 401 and not already retried, try to refresh token via provided handler
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      // Prefer app-provided refresh handler
      if (tokenRefreshHandler) {
        try {
          const newAccess = await tokenRefreshHandler();
          if (newAccess) {
            apiClient.setAuthToken(newAccess);
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${newAccess}`;
            }
            return apiClient(originalRequest);
          }
        } catch (refreshError) {
          // Fall through to cleanup below
        }
      } else if (typeof window !== 'undefined') {
        // Fallback: try legacy localStorage-based refresh if available
        try {
          const refreshToken = localStorage.getItem('refreshToken');
          if (refreshToken) {
            const response = await axios.post(
              `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/v1/auth/refresh-token`,
              { refreshToken }
            );
            const { accessToken: newAccessToken } = response.data as {
              accessToken?: string;
            };
            if (newAccessToken) {
              apiClient.setAuthToken(newAccessToken);
              if (originalRequest.headers) {
                originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
              }
              return apiClient(originalRequest);
            }
          }
        } catch {
          // ignore; proceed to cleanup
        }
      }

      // Refresh failed — clear tokens and redirect to login (client-side)
      try {
        apiClient.setAuthToken(null);
        if (typeof window !== 'undefined') {
          localStorage.removeItem('refreshToken');
          window.location.href = '/sign-in';
        }
      } catch {}

      return Promise.reject(error);
    }

    return Promise.reject(error);
  }
);
