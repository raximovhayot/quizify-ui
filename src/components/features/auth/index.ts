/**
 * Auth feature barrel exports
 * Centralizes all auth-related exports for easier imports
 */

// Hooks
export * from './hooks/useAuthMutations';

// Schemas
export * from './schemas/auth';

// Types
export * from './types/auth';

// Re-export commonly used types for convenience
export type {
  SignInFormData,
  SignUpPhoneFormData,
  VerificationFormData,
  ForgotPasswordPhoneFormData,
  ForgotPasswordVerificationFormData,
  ForgotPasswordNewPasswordFormData,
} from './schemas/auth';

export type {
  JWTToken,
  SignInRequest,
  SignUpPrepareRequest,
  SignUpVerifyRequest,
  ForgotPasswordPrepareRequest,
  ForgotPasswordVerifyRequest,
  ForgotPasswordUpdateRequest,
  SignInPrepareResponse,
  ForgotPasswordVerifyResponse,
} from './types/auth';
