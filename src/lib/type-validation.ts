/**
 * Runtime type validation utilities
 * Provides runtime type checking for critical data flows and API responses
 */

import { z } from 'zod';
import { ApiResponse, ApiError } from '@/types/api';

/**
 * Generic type validator interface
 */
export interface TypeValidator<T> {
  validate: (data: unknown) => T;
  safeParse: (data: unknown) => { success: true; data: T } | { success: false; error: string };
  isValid: (data: unknown) => data is T;
}

/**
 * Create a type validator from a Zod schema
 */
export function createValidator<T>(schema: z.ZodSchema<T>): TypeValidator<T> {
  return {
    validate: (data: unknown): T => {
      try {
        return schema.parse(data);
      } catch (error) {
        if (error instanceof z.ZodError) {
          throw new Error(`Validation failed: ${error.errors.map(e => e.message).join(', ')}`);
        }
        throw error;
      }
    },
    safeParse: (data: unknown) => {
      const result = schema.safeParse(data);
      if (result.success) {
        return { success: true, data: result.data };
      }
      return {
        success: false,
        error: result.error.errors.map(e => e.message).join(', '),
      };
    },
    isValid: (data: unknown): data is T => {
      return schema.safeParse(data).success;
    },
  };
}

/**
 * API Response validator
 */
export const apiResponseValidator = <T>(dataValidator: TypeValidator<T>) =>
  createValidator(
    z.object({
      data: z.unknown().refine((data) => dataValidator.isValid(data), {
        message: 'Invalid data format',
      }),
      errors: z.array(
        z.object({
          code: z.string(),
          message: z.string(),
          field: z.string().optional(),
        })
      ),
    })
  );

/**
 * Common validation schemas
 */
export const commonValidators = {
  // String validators
  nonEmptyString: createValidator(z.string().min(1)),
  email: createValidator(z.string().email()),
  phone: createValidator(z.string().regex(/^(?:\+?998|0)?\d{9}$/)),
  url: createValidator(z.string().url()),
  
  // Number validators
  positiveNumber: createValidator(z.number().positive()),
  nonNegativeNumber: createValidator(z.number().min(0)),
  
  // Date validators
  isoDateString: createValidator(z.string().datetime()),
  
  // ID validators
  entityId: createValidator(z.string().uuid().or(z.string().min(1))),
  
  // Array validators
  nonEmptyArray: <T>(itemValidator: TypeValidator<T>) =>
    createValidator(z.array(z.unknown().refine((item) => itemValidator.isValid(item))).min(1)),
  
  // Object validators
  record: <T>(valueValidator: TypeValidator<T>) =>
    createValidator(z.record(z.unknown().refine((value) => valueValidator.isValid(value)))),
};

/**
 * Authentication data validators
 */
export const authValidators = {
  jwtToken: createValidator(
    z.object({
      accessToken: z.string().min(1),
      refreshToken: z.string().min(1),
      user: z.object({
        id: z.string(),
        phone: z.string(),
        email: z.string().email().optional(),
        firstName: z.string().optional(),
        lastName: z.string().optional(),
        role: z.enum(['STUDENT', 'INSTRUCTOR', 'ADMIN']).optional(),
        profileCompleted: z.boolean().optional(),
      }),
    })
  ),
  
  signInRequest: createValidator(
    z.object({
      phone: z.string().regex(/^(?:\+?998|0)?\d{9}$/),
      password: z.string().min(1),
    })
  ),
  
  signUpPrepareRequest: createValidator(
    z.object({
      phone: z.string().regex(/^(?:\+?998|0)?\d{9}$/),
    })
  ),
  
  signUpVerifyRequest: createValidator(
    z.object({
      phone: z.string().regex(/^(?:\+?998|0)?\d{9}$/),
      otp: z.string().length(6).regex(/^\d{6}$/),
    })
  ),
  
  forgotPasswordPrepareRequest: createValidator(
    z.object({
      phone: z.string().regex(/^(?:\+?998|0)?\d{9}$/),
    })
  ),
  
  forgotPasswordVerifyRequest: createValidator(
    z.object({
      phone: z.string().regex(/^(?:\+?998|0)?\d{9}$/),
      otp: z.string().length(6).regex(/^\d{6}$/),
    })
  ),
  
  forgotPasswordUpdateRequest: createValidator(
    z.object({
      token: z.string().min(1),
      newPassword: z.string().min(8),
    })
  ),
};

/**
 * Profile data validators
 */
export const profileValidators = {
  accountDTO: createValidator(
    z.object({
      id: z.string(),
      phone: z.string(),
      email: z.string().email().optional(),
      firstName: z.string().optional(),
      lastName: z.string().optional(),
      role: z.enum(['STUDENT', 'INSTRUCTOR', 'ADMIN']).optional(),
      profileCompleted: z.boolean().optional(),
      avatarUrl: z.string().url().optional(),
      createdAt: z.string().datetime().optional(),
      updatedAt: z.string().datetime().optional(),
    })
  ),
};

/**
 * Pageable list validator
 */
export const pageableListValidator = <T>(itemValidator: TypeValidator<T>) =>
  createValidator(
    z.object({
      content: z.array(z.unknown().refine((item) => itemValidator.isValid(item))),
      totalElements: z.number().min(0),
      totalPages: z.number().min(0),
      size: z.number().min(0),
      page: z.number().min(0),
      first: z.boolean(),
      last: z.boolean(),
      empty: z.boolean(),
    })
  );

/**
 * Runtime type assertion utility
 */
export function assertType<T>(
  data: unknown,
  validator: TypeValidator<T>,
  errorMessage?: string
): asserts data is T {
  if (!validator.isValid(data)) {
    throw new Error(errorMessage || 'Type assertion failed');
  }
}

/**
 * Safe type casting utility
 */
export function safeCast<T>(
  data: unknown,
  validator: TypeValidator<T>
): T | null {
  const result = validator.safeParse(data);
  return result.success ? result.data : null;
}

/**
 * Type guard factory
 */
export function createTypeGuard<T>(
  validator: TypeValidator<T>
): (data: unknown) => data is T {
  return (data: unknown): data is T => validator.isValid(data);
}

/**
 * Validate API response with proper error handling
 */
export function validateApiResponse<T>(
  response: unknown,
  dataValidator: TypeValidator<T>
): ApiResponse<T> {
  const validator = apiResponseValidator(dataValidator);
  
  try {
    const validatedResponse = validator.validate(response);
    return {
      data: dataValidator.validate(validatedResponse.data),
      errors: validatedResponse.errors,
    };
  } catch (error) {
    // If validation fails, return an error response
    const apiError: ApiError = {
      code: 'VALIDATION_ERROR',
      message: error instanceof Error ? error.message : 'Response validation failed',
    };
    
    return {
      data: null as T,
      errors: [apiError],
    };
  }
}

/**
 * Development mode type checking
 */
export const devTypeCheck = {
  /**
   * Log type validation errors in development
   */
  logValidationError: (data: unknown, validator: TypeValidator<unknown>, context?: string) => {
    // Only log in development mode (check for production build)
    if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
      const result = validator.safeParse(data);
      if (!result.success) {
        console.warn(`Type validation failed${context ? ` in ${context}` : ''}:`, result.error);
        console.warn('Data:', data);
      }
    }
  },
  
  /**
   * Assert type in development mode only
   */
  assertInDev: <T>(data: unknown, validator: TypeValidator<T>, context?: string) => {
    // Only assert in development mode (check for production build)
    if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
      devTypeCheck.logValidationError(data, validator, context);
    }
  },
};