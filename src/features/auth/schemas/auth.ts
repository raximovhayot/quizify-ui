import { z } from 'zod';

import {
  type OTPFormData,
  type PasswordWithConfirmationFormData,
  type PhoneFormData,
  composeSchemas,
  createOTPSchema,
  createPasswordSchema,
  createPasswordWithConfirmationSchema,
  createPhoneSchema,
  otpFormDefaults,
  passwordWithConfirmationFormDefaults,
  phoneFormDefaults,
} from '@/lib/validation';

/**
 * Sign-in form validation schema factory
 * Creates a validation schema with localized error messages
 */
export const createSignInSchema = (t: (key: string) => string) => {
  return composeSchemas(createPhoneSchema(t), createPasswordSchema(t));
};

/**
 * Sign-in form data type
 */
export type SignInFormData = z.infer<ReturnType<typeof createSignInSchema>>;

/**
 * Default values for sign-in form
 */
export const signInFormDefaults: SignInFormData = {
  phone: '',
  password: '',
};

/**
 * Sign-up phone validation schema factory
 * Uses phone validation for SMS verification
 */
export const createSignUpPhoneSchema = createPhoneSchema;

/**
 * Sign-up phone form data type
 */
export type SignUpPhoneFormData = PhoneFormData;

/**
 * Default values for sign-up phone form
 */
export const signUpPhoneFormDefaults = phoneFormDefaults;

/**
 * OTP verification schema factory
 */
export const createVerificationSchema = createOTPSchema;

/**
 * OTP verification form data type
 */
export type VerificationFormData = OTPFormData;

/**
 * Default values for OTP verification form
 */
export const verificationFormDefaults = otpFormDefaults;

// ============================================================================
// FORGOT PASSWORD SCHEMAS
// ============================================================================

/**
 * Forgot password phone validation schema factory
 * Uses the same phone validation as sign-up for SMS verification
 */
export const createForgotPasswordPhoneSchema = createPhoneSchema;

/**
 * Forgot password phone form data type
 */
export type ForgotPasswordPhoneFormData = PhoneFormData;

/**
 * Default values for forgot password phone form
 */
export const forgotPasswordPhoneFormDefaults = phoneFormDefaults;

/**
 * Forgot password verification schema factory
 * Uses the same OTP validation as other flows
 */
export const createForgotPasswordVerificationSchema = createOTPSchema;

/**
 * Forgot password verification form data type
 */
export type ForgotPasswordVerificationFormData = OTPFormData;

/**
 * Default values for forgot password verification form
 */
export const forgotPasswordVerificationFormDefaults = otpFormDefaults;

/**
 * Forgot password new password schema factory
 */
export const createForgotPasswordNewPasswordSchema =
  createPasswordWithConfirmationSchema;

/**
 * Forgot password new password form data type
 */
export type ForgotPasswordNewPasswordFormData =
  PasswordWithConfirmationFormData;

/**
 * Default values for forgot password new password form
 */
export const forgotPasswordNewPasswordFormDefaults =
  passwordWithConfirmationFormDefaults;
