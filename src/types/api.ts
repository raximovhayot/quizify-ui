/**
 * Generic API response structure returned by the backend
 * Format: {data: T, errors: [ { code, message, field } ]}
 */

export interface ApiError {
  code: string;
  message: string;
  field?: string;
}

export interface ApiResponse<T = any> {
  data: T;
  errors: ApiError[];
}

/**
 * Type guard to check if an API response has errors
 */
export function hasApiErrors<T>(response: ApiResponse<T>): boolean {
  return response.errors && response.errors.length > 0;
}

/**
 * Type guard to check if an API response is successful (no errors)
 */
export function isApiSuccess<T>(response: ApiResponse<T>): boolean {
  return !hasApiErrors(response);
}

/**
 * Extract data from API response if successful, otherwise throw error
 */
export function extractApiData<T>(response: ApiResponse<T>): T {
  if (hasApiErrors(response)) {
    const errorMessages = response.errors.map(error => error.message).join(', ');
    throw new Error(`API Error: ${errorMessages}`);
  }
  return response.data;
}

/**
 * Get the first error from API response
 */
export function getFirstApiError<T>(response: ApiResponse<T>): ApiError | null {
  return response.errors && response.errors.length > 0 ? response.errors[0] : null;
}

/**
 * Get errors for a specific field from API response
 */
export function getFieldErrors<T>(response: ApiResponse<T>, field: string): ApiError[] {
  return response.errors ? response.errors.filter(error => error.field === field) : [];
}