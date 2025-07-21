/**
 * Generic API response structure returned by the backend
 * Format: {data: T, errors: [ { code, message, field } ]}
 */

export interface ApiError {
    code: string;
    message: string;
    field?: string;
}

export interface ApiResponse<T = unknown> {
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
        throw new BackendError(response);
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

/**
 * Custom error class that preserves the original API errors
 * This allows pages to access individual error details while maintaining backward compatibility
 */
export class BackendError extends Error {
    public readonly errors: ApiError[];
    public readonly response: ApiResponse<unknown>;

    constructor(response: ApiResponse<unknown>) {
        const errorMessages = response.errors.map(error => error.message).join(', ');
        super(`API Error: ${errorMessages}`);
        this.name = 'BackendError';
        this.errors = response.errors;
        this.response = response;
    }

    /**
     * Get errors for a specific field
     */
    getFieldErrors(field: string): ApiError[] {
        return this.errors.filter(error => error.field === field);
    }

    /**
     * Get the first error
     */
    getFirstError(): ApiError | null {
        return this.errors.length > 0 ? this.errors[0] : null;
    }

    /**
     * Get errors by code
     */
    getErrorsByCode(code: string): ApiError[] {
        return this.errors.filter(error => error.code === code);
    }

    /**
     * Check if a specific error code exists
     */
    hasErrorCode(code: string): boolean {
        return this.errors.some(error => error.code === code);
    }

    /**
     * Check if a specific field has errors
     */
    hasFieldErrors(field: string): boolean {
        return this.errors.some(error => error.field === field);
    }
}