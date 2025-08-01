/**
 * Lib utilities barrel exports
 * Centralizes all shared utility exports for easier imports
 */

// API utilities
export * from './api';
export * from './api-utils';

// Form utilities
export * from './form-utils';

// Validation utilities
export * from './validation';

// Mutation utilities
export * from './mutation-utils';

// Common utilities
export * from './utils';

// Re-export commonly used utilities for convenience
export { apiClient } from './api';
export {
  handleApiResponse,
  showSuccessToast,
  showErrorToast,
  showInfoToast,
  getErrorMessage,
  formatFieldErrors,
} from './api-utils';

export {
  createMutation,
  createAuthMutation,
  createSimpleMutation,
  type MutationOptions,
  type MutationResult,
} from './mutation-utils';

export {
  createPhoneSchema,
  createOTPSchema,
  createPasswordSchema,
  createPasswordWithConfirmationSchema,
  composeSchemas,
  withConfirmPassword,
  phoneFormDefaults,
  otpFormDefaults,
  passwordFormDefaults,
  passwordWithConfirmationFormDefaults,
  type PhoneFormData,
  type OTPFormData,
  type PasswordFormData,
  type PasswordWithConfirmationFormData,
} from './validation';

export {
  getFieldError,
  hasFieldError,
  getAllFieldErrors,
  clearFieldErrors,
  setBackendErrors,
  handleFormSubmission,
  getFormFieldProps,
  formStateHelpers,
  formValidationHelpers,
  type FormConfig,
  type FormFieldProps,
} from './form-utils';
