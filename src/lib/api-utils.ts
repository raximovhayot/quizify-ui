import { NextResponse } from 'next/server';
import { ApiResponse, ApiError } from '@/types/api';

/**
 * Create a successful API response
 */
export function createSuccessResponse<T>(data: T, status: number = 200): NextResponse<ApiResponse<T>> {
  const response: ApiResponse<T> = {
    data,
    errors: []
  };
  
  return NextResponse.json(response, { status });
}

/**
 * Create an error API response
 */
export function createErrorResponse(
  errors: ApiError | ApiError[], 
  status: number = 400
): NextResponse<ApiResponse<null>> {
  const errorArray = Array.isArray(errors) ? errors : [errors];
  
  const response: ApiResponse<null> = {
    data: null,
    errors: errorArray
  };
  
  return NextResponse.json(response, { status });
}

/**
 * Create a validation error response
 */
export function createValidationErrorResponse(
  field: string, 
  message: string
): NextResponse<ApiResponse<null>> {
  const error: ApiError = {
    code: 'VALIDATION_ERROR',
    message,
    field
  };
  
  return createErrorResponse(error, 400);
}

/**
 * Create an authentication error response
 */
export function createAuthErrorResponse(
  message: string = 'Authentication required'
): NextResponse<ApiResponse<null>> {
  const error: ApiError = {
    code: 'AUTH_ERROR',
    message
  };
  
  return createErrorResponse(error, 401);
}

/**
 * Create an authorization error response
 */
export function createAuthorizationErrorResponse(
  message: string = 'Insufficient permissions'
): NextResponse<ApiResponse<null>> {
  const error: ApiError = {
    code: 'AUTHORIZATION_ERROR',
    message
  };
  
  return createErrorResponse(error, 403);
}

/**
 * Create a not found error response
 */
export function createNotFoundErrorResponse(
  resource: string = 'Resource'
): NextResponse<ApiResponse<null>> {
  const error: ApiError = {
    code: 'NOT_FOUND',
    message: `${resource} not found`
  };
  
  return createErrorResponse(error, 404);
}

/**
 * Create an internal server error response
 */
export function createInternalErrorResponse(
  message: string = 'Internal server error'
): NextResponse<ApiResponse<null>> {
  const error: ApiError = {
    code: 'INTERNAL_ERROR',
    message
  };
  
  return createErrorResponse(error, 500);
}

/**
 * Handle async API route with error catching
 */
export function withErrorHandling<T>(
  handler: () => Promise<NextResponse<ApiResponse<T>>>
): Promise<NextResponse<ApiResponse<T | null>>> {
  return handler().catch((error) => {
    console.error('API Error:', error);
    
    if (error.name === 'ValidationError') {
      return createValidationErrorResponse('general', error.message);
    }
    
    if (error.name === 'AuthenticationError') {
      return createAuthErrorResponse(error.message);
    }
    
    if (error.name === 'AuthorizationError') {
      return createAuthorizationErrorResponse(error.message);
    }
    
    if (error.name === 'NotFoundError') {
      return createNotFoundErrorResponse(error.message);
    }
    
    return createInternalErrorResponse(
      process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    );
  });
}

/**
 * Parse and validate JSON request body
 */
export async function parseRequestBody<T>(request: Request): Promise<T> {
  try {
    const body = await request.json();
    return body as T;
  } catch {
    throw new Error('Invalid JSON in request body');
  }
}

/**
 * Extract query parameters from URL
 */
export function getQueryParams(url: string): URLSearchParams {
  const urlObj = new URL(url);
  return urlObj.searchParams;
}

/**
 * Validate required fields in request body
 */
export function validateRequiredFields<T extends Record<string, unknown>>(
  data: T,
  requiredFields: (keyof T)[]
): void {
  for (const field of requiredFields) {
    if (!data[field] || (typeof data[field] === 'string' && data[field].trim() === '')) {
      throw new ValidationError(`${String(field)} is required`);
    }
  }
}

/**
 * Custom error classes
 */
export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class AuthenticationError extends Error {
  constructor(message: string = 'Authentication required') {
    super(message);
    this.name = 'AuthenticationError';
  }
}

export class AuthorizationError extends Error {
  constructor(message: string = 'Insufficient permissions') {
    super(message);
    this.name = 'AuthorizationError';
  }
}

export class NotFoundError extends Error {
  constructor(message: string = 'Resource not found') {
    super(message);
    this.name = 'NotFoundError';
  }
}