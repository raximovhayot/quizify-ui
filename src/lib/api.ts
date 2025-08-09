/**
 * Base API configuration
 */
import { env } from '@/env.mjs';
import { IApiError, IApiResponse } from '@/types/api';

const API_BASE_URL = env.NEXT_PUBLIC_API_BASE_URL;

/**
 * HTTP methods supported by the API client
 */
type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

/**
 * API request options
 */
interface ApiRequestOptions {
  method?: HttpMethod;
  headers?: Record<string, string>;
  body?: unknown;
  token?: string;
  timeout?: number;
  signal?: AbortSignal;
  credentials?: RequestCredentials;
  parseAs?: 'json' | 'blob' | 'text' | 'auto';
}

/**
 * Request interceptor function type
 */
type RequestInterceptor = (config: {
  url: string;
  options: RequestInit;
}) =>
  | Promise<{ url: string; options: RequestInit }>
  | { url: string; options: RequestInit };

/**
 * Response interceptor function type
 */
type ResponseInterceptor = <T>(
  response: IApiResponse<T>
) => Promise<IApiResponse<T>> | IApiResponse<T>;

/**
 * API client class for making requests to the backend
 */
class ApiClient {
  private readonly baseUrl: string;
  private requestInterceptors: RequestInterceptor[] = [];
  private responseInterceptors: ResponseInterceptor[] = [];
  private readonly defaultTimeout = 30000; // 30 seconds

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  /**
   * Add a request interceptor
   */
  addRequestInterceptor(interceptor: RequestInterceptor): void {
    this.requestInterceptors.push(interceptor);
  }

  /**
   * Add a response interceptor
   */
  addResponseInterceptor(interceptor: ResponseInterceptor): void {
    this.responseInterceptors.push(interceptor);
  }

  /**
   * Create an AbortController with timeout
   */
  private createTimeoutController(timeout: number): {
    controller: AbortController;
    timerId: ReturnType<typeof setTimeout>;
    wasTimedOut: () => boolean;
  } {
    let timedOut = false;
    const controller = new AbortController();
    const timerId = setTimeout(() => {
      timedOut = true;
      controller.abort();
    }, timeout);
    return { controller, timerId, wasTimedOut: () => timedOut };
  }

  /**
   * Extract error message from HTTP response
   */
  private async getErrorMessage(response: Response): Promise<string | null> {
    try {
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const errorResponse = await response.json();
        // Try to extract error message from various possible structures
        if (errorResponse.errors && errorResponse.errors.length > 0) {
          return errorResponse.errors[0].message;
        }
        if (errorResponse.message) {
          return errorResponse.message;
        }
        if (errorResponse.error) {
          return errorResponse.error;
        }
      }
      return null;
    } catch {
      return null;
    }
  }

  /**
   * Make an API request and return the standardized response
   */
  async request<T = unknown>(
    endpoint: string,
    options: ApiRequestOptions = {}
  ): Promise<IApiResponse<T>> {
    const {
      method = 'GET',
      headers = {},
      body,
      token,
      timeout = this.defaultTimeout,
      signal,
      credentials,
      parseAs = 'auto',
    } = options;

    let url = `${this.baseUrl}${endpoint}`;

    const requestHeaders: Record<string, string> = {
      ...headers,
    };

    // Set Content-Type only if not FormData (FormData sets its own boundary)
    if (!(body instanceof FormData)) {
      requestHeaders['Content-Type'] = 'application/json';
    }

    // Add authorization header if token is provided
    if (token) {
      requestHeaders.Authorization = `Bearer ${token}`;
    }

    // Create timeout controller
    const timeoutCtrl = this.createTimeoutController(timeout);

    // If external signal provided, abort timeout controller when it aborts
    let removeAbortListener: (() => void) | undefined;
    if (signal) {
      if (signal.aborted) {
        timeoutCtrl.controller.abort();
      } else {
        const onAbort = () => timeoutCtrl.controller.abort();
        signal.addEventListener('abort', onAbort, { once: true });
        removeAbortListener = () =>
          signal.removeEventListener('abort', onAbort);
      }
    }

    let requestOptions: RequestInit = {
      method,
      headers: requestHeaders,
      signal: timeoutCtrl.controller.signal,
      credentials: credentials,
    } as RequestInit;

    // Add body for non-GET requests
    if (body && method !== 'GET') {
      if (body instanceof FormData) {
        requestOptions.body = body;
      } else {
        requestOptions.body = JSON.stringify(body);
      }
    }

    // Apply request interceptors
    for (const interceptor of this.requestInterceptors) {
      const result = await interceptor({ url, options: requestOptions });
      url = result.url;
      requestOptions = result.options;
    }

    try {
      const response = await fetch(url, requestOptions);

      // Check if response is ok (status 200-299)
      if (!response.ok) {
        // Handle HTTP error status codes
        const errorMessage = await this.getErrorMessage(response);
        const httpError: IApiError = {
          code: `HTTP_${response.status}`,
          message:
            errorMessage || `HTTP ${response.status}: ${response.statusText}`,
        };

        return {
          data: null as T,
          errors: [httpError],
        };
      }

      // Safe parsing based on parseAs/content-type/status
      const contentType = response.headers.get('content-type') || '';
      const contentLength = response.headers.get('content-length');

      const noContent =
        response.status === 204 ||
        response.status === 205 ||
        contentLength === '0';

      let apiResponse: IApiResponse<T>;

      if (noContent) {
        apiResponse = { data: null as T, errors: [] };
      } else if (parseAs === 'blob') {
        const data = (await response.blob()) as unknown as T;
        apiResponse = { data, errors: [] };
      } else if (parseAs === 'text') {
        const data = (await response.text()) as unknown as T;
        apiResponse = { data, errors: [] };
      } else if (
        parseAs === 'json' ||
        (parseAs === 'auto' && contentType.includes('application/json'))
      ) {
        let jsonResp: IApiResponse<T> =
          (await response.json()) as IApiResponse<T>;
        // Apply response interceptors
        for (const interceptor of this.responseInterceptors) {
          jsonResp = await interceptor(jsonResp);
        }
        return jsonResp;
      } else {
        // Non-JSON success with auto mode: return an empty standardized payload
        apiResponse = { data: null as T, errors: [] };
      }

      // Apply response interceptors to non-JSON/empty responses too
      for (const interceptor of this.responseInterceptors) {
        apiResponse = await interceptor(apiResponse);
      }
      return apiResponse;
    } catch (error) {
      // Handle different types of errors
      let errorCode = 'NETWORK_ERROR';
      let errorMessage = 'Network request failed';

      if (error instanceof Error && error.name === 'AbortError') {
        if (timeoutCtrl.wasTimedOut()) {
          errorCode = 'TIMEOUT_ERROR';
          errorMessage = 'Request timeout';
        } else {
          errorCode = 'CANCELED';
          errorMessage = 'Request canceled';
        }
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }

      const networkError: IApiError = {
        code: errorCode,
        message: errorMessage,
      };

      return {
        data: null as T,
        errors: [networkError],
      };
    } finally {
      clearTimeout(timeoutCtrl.timerId);
      if (removeAbortListener) removeAbortListener();
    }
  }

  /**
   * GET request
   */
  async get<T>(
    endpoint: string,
    token?: string,
    signal?: AbortSignal
  ): Promise<IApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET', token, signal });
  }

  /**
   * POST request
   */
  async post<T>(
    endpoint: string,
    body?: unknown,
    token?: string
  ): Promise<IApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'POST', body, token });
  }

  /**
   * PUT request
   */
  async put<T>(
    endpoint: string,
    body?: unknown,
    token?: string
  ): Promise<IApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'PUT', body, token });
  }

  /**
   * DELETE request
   */
  async delete<T>(endpoint: string, token?: string): Promise<IApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE', token });
  }

  /**
   * PATCH request
   */
  async patch<T>(
    endpoint: string,
    body?: unknown,
    token?: string
  ): Promise<IApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'PATCH', body, token });
  }

  /**
   * GET as Blob helper (e.g., downloads)
   */
  async getBlob(
    endpoint: string,
    token?: string,
    signal?: AbortSignal,
    credentials?: RequestCredentials
  ): Promise<IApiResponse<Blob>> {
    return this.request<Blob>(endpoint, {
      method: 'GET',
      token,
      signal,
      credentials,
      parseAs: 'blob',
    });
  }

  /**
   * GET as Text helper
   */
  async getText(
    endpoint: string,
    token?: string,
    signal?: AbortSignal,
    credentials?: RequestCredentials
  ): Promise<IApiResponse<string>> {
    return this.request<string>(endpoint, {
      method: 'GET',
      token,
      signal,
      credentials,
      parseAs: 'text',
    });
  }
}

// Export a singleton instance
export const apiClient = new ApiClient();
