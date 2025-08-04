/**
 * Generic API response structure returned by the backend
 * Format: {data: T, errors: [ { code, message, field } ]}
 */

export interface IApiError {
  code: string;
  message: string;
  field?: string;
}

export interface IApiResponse<T = unknown> {
  data: T;
  errors: IApiError[];
}

/**
 * Type guard to check if an API response has errors
 */
export function hasApiErrors<T>(response: IApiResponse<T>): boolean {
  return response.errors && response.errors.length > 0;
}

/**
 * Type guard to check if an API response is successful (no errors)
 */
export function isApiSuccess<T>(response: IApiResponse<T>): boolean {
  return !hasApiErrors(response);
}

/**
 * Extract data from API response if successful, otherwise throw error
 */
export function extractApiData<T>(response: IApiResponse<T>): T {
  if (hasApiErrors(response)) {
    throw new BackendError(response);
  }
  return response.data;
}

/**
 * Get the first error from API response
 */
export function getFirstApiError<T>(
  response: IApiResponse<T>
): IApiError | null {
  return response.errors && response.errors.length > 0
    ? response.errors[0]!
    : null;
}

/**
 * Get errors for a specific field from API response
 */
export function getFieldErrors<T>(
  response: IApiResponse<T>,
  field: string
): IApiError[] {
  return response.errors
    ? response.errors.filter((error) => error.field === field)
    : [];
}

/**
 * Custom error class that preserves the original API errors
 * This allows pages to access individual error details while maintaining backward compatibility
 */
export class BackendError extends Error {
  public readonly errors: IApiError[];
  public readonly response: IApiResponse<unknown>;

  constructor(response: IApiResponse<unknown>) {
    const errorMessages = response.errors
      .map((error) => error.message)
      .join(', ');
    super(`API Error: ${errorMessages}`);
    this.name = 'BackendError';
    this.errors = response.errors;
    this.response = response;
  }

  /**
   * Get errors for a specific field
   */
  getFieldErrors(field: string): IApiError[] {
    return this.errors.filter((error) => error.field === field);
  }

  /**
   * Get the first error
   */
  getFirstError(): IApiError | null {
    return this.errors.length > 0 ? this.errors[0]! : null;
  }

  /**
   * Get errors by code
   */
  getErrorsByCode(code: string): IApiError[] {
    return this.errors.filter((error) => error.code === code);
  }

  /**
   * Check if a specific error code exists
   */
  hasErrorCode(code: string): boolean {
    return this.errors.some((error) => error.code === code);
  }

  /**
   * Check if a specific field has errors
   */
  hasFieldErrors(field: string): boolean {
    return this.errors.some((error) => error.field === field);
  }
}
