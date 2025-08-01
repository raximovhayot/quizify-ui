/**
 * Base API configuration
 */
import { env } from '@/env.mjs';
import { ApiError, ApiResponse } from '@/types/api';

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
  response: ApiResponse<T>
) => Promise<ApiResponse<T>> | ApiResponse<T>;

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
  private createTimeoutController(timeout: number): AbortController {
    const controller = new AbortController();
    setTimeout(() => controller.abort(), timeout);
    return controller;
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
  ): Promise<ApiResponse<T>> {
    const {
      method = 'GET',
      headers = {},
      body,
      token,
      timeout = this.defaultTimeout,
    } = options;

    let url = `${this.baseUrl}${endpoint}`;

    const requestHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      ...headers,
    };

    // Add authorization header if token is provided
    if (token) {
      requestHeaders.Authorization = `Bearer ${token}`;
    }

    // Create timeout controller
    const timeoutController = this.createTimeoutController(timeout);

    let requestOptions: RequestInit = {
      method,
      headers: requestHeaders,
      signal: timeoutController.signal,
    };

    // Add body for non-GET requests
    if (body && method !== 'GET') {
      requestOptions.body = JSON.stringify(body);
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
        const httpError: ApiError = {
          code: `HTTP_${response.status}`,
          message:
            errorMessage || `HTTP ${response.status}: ${response.statusText}`,
        };

        return {
          data: null as T,
          errors: [httpError],
        };
      }

      // Parse JSON response
      let jsonResponse = await response.json();

      // Apply response interceptors
      for (const interceptor of this.responseInterceptors) {
        jsonResponse = await interceptor(jsonResponse);
      }

      // Return the standardized response structure
      return jsonResponse;
    } catch (error) {
      // Handle different types of errors
      let errorCode = 'NETWORK_ERROR';
      let errorMessage = 'Network request failed';

      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          errorCode = 'TIMEOUT_ERROR';
          errorMessage = 'Request timeout';
        } else {
          errorMessage = error.message;
        }
      }

      const networkError: ApiError = {
        code: errorCode,
        message: errorMessage,
      };

      return {
        data: null as T,
        errors: [networkError],
      };
    }
  }

  /**
   * GET request
   */
  async get<T>(endpoint: string, token?: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET', token });
  }

  /**
   * POST request
   */
  async post<T>(
    endpoint: string,
    body?: unknown,
    token?: string
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'POST', body, token });
  }

  /**
   * PUT request
   */
  async put<T>(
    endpoint: string,
    body?: unknown,
    token?: string
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'PUT', body, token });
  }

  /**
   * DELETE request
   */
  async delete<T>(endpoint: string, token?: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE', token });
  }

  /**
   * PATCH request
   */
  async patch<T>(
    endpoint: string,
    body?: unknown,
    token?: string
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'PATCH', body, token });
  }
}

// Export a singleton instance
export const apiClient = new ApiClient();
