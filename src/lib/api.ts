import { ApiResponse, ApiError, extractApiData, hasApiErrors } from '@/types/api';

/**
 * Base API configuration
 */
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080/api';

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
}

/**
 * API client class for making requests to the backend
 */
class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  /**
   * Make an API request and return the standardized response
   */
  async request<T>(endpoint: string, options: ApiRequestOptions = {}): Promise<ApiResponse<T>> {
    const {
      method = 'GET',
      headers = {},
      body,
      token
    } = options;

    const url = `${this.baseUrl}${endpoint}`;
    
    const requestHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      ...headers
    };

    // Add authorization header if token is provided
    if (token) {
      requestHeaders.Authorization = `Bearer ${token}`;
    }

    const requestOptions: RequestInit = {
      method,
      headers: requestHeaders,
    };

    // Add body for non-GET requests
    if (body && method !== 'GET') {
      requestOptions.body = JSON.stringify(body);
    }

    try {
      const response = await fetch(url, requestOptions);
      
      // Parse JSON response
      const data: ApiResponse<T> = await response.json();
      
      // Return the standardized response structure
      return data;
    } catch (error) {
      // Handle network errors or JSON parsing errors
      const networkError: ApiError = {
        code: 'NETWORK_ERROR',
        message: error instanceof Error ? error.message : 'Network request failed'
      };

      return {
        data: null as T,
        errors: [networkError]
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
  async post<T>(endpoint: string, body?: unknown, token?: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'POST', body, token });
  }

  /**
   * PUT request
   */
  async put<T>(endpoint: string, body?: unknown, token?: string): Promise<ApiResponse<T>> {
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
  async patch<T>(endpoint: string, body?: unknown, token?: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'PATCH', body, token });
  }
}

// Export a singleton instance
export const apiClient = new ApiClient();

/**
 * Convenience function to make API requests with automatic data extraction
 * Throws an error if the API response contains errors
 */
export async function apiRequest<T>(
  endpoint: string, 
  options: ApiRequestOptions = {}
): Promise<T> {
  const response = await apiClient.request<T>(endpoint, options);
  return extractApiData(response);
}

/**
 * Convenience function to make API requests and handle errors gracefully
 * Returns null if there are errors, otherwise returns the data
 */
export async function safeApiRequest<T>(
  endpoint: string, 
  options: ApiRequestOptions = {}
): Promise<T | null> {
  const response = await apiClient.request<T>(endpoint, options);
  return hasApiErrors(response) ? null : response.data;
}