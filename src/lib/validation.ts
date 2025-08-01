import * as z from 'zod';

import {
  PASSWORD_MIN_LENGTH,
  PASSWORD_REGEX,
  PHONE_REGEX,
} from '@/constants/validation';

/**
 * Base phone validation schema factory
 * Creates a reusable phone validation schema with localized error messages
 */
export const createPhoneSchema = (t: (key: string) => string) => {
  return z.object({
    phone: z
      .string()
      .min(1, t('auth.validation.phoneRequired'))
      .regex(PHONE_REGEX, t('auth.validation.phoneInvalid')),
  });
};

/**
 * Base OTP validation schema factory
 * Creates a reusable OTP validation schema with localized error messages
 */
export const createOTPSchema = (t: (key: string) => string) => {
  return z.object({
    otp: z
      .string()
      .min(1, t('auth.validation.otpRequired'))
      .length(6, t('auth.validation.otpLength'))
      .regex(/^\d{6}$/, t('auth.validation.otpPattern')),
  });
};

/**
 * Base password validation schema factory
 * Creates a reusable password validation schema with localized error messages
 */
export const createPasswordSchema = (t: (key: string) => string) => {
  return z.object({
    password: z
      .string()
      .min(1, t('auth.validation.passwordRequired'))
      .min(PASSWORD_MIN_LENGTH, t('auth.validation.passwordMinLength'))
      .regex(PASSWORD_REGEX, t('auth.validation.passwordPattern')),
  });
};

/**
 * Password with confirmation validation schema factory
 * Creates a password schema with confirmation field and matching validation
 */
export const createPasswordWithConfirmationSchema = (
  t: (key: string) => string
) => {
  return z
    .object({
      password: z
        .string()
        .min(1, t('auth.validation.passwordRequired'))
        .min(PASSWORD_MIN_LENGTH, t('auth.validation.passwordMinLength'))
        .regex(PASSWORD_REGEX, t('auth.validation.passwordPattern')),
      confirmPassword: z
        .string()
        .min(1, t('auth.validation.confirmPasswordRequired')),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: t('auth.validation.passwordsNotMatch'),
      path: ['confirmPassword'],
    });
};

/**
 * Schema composition utility
 * Combines multiple Zod schemas into a single schema
 */
export const composeSchemas = <
  T extends z.ZodRawShape,
  U extends z.ZodRawShape,
>(
  schema1: z.ZodObject<T>,
  schema2: z.ZodObject<U>
) => {
  return schema1.merge(schema2);
};

/**
 * Utility to add confirm password validation to an existing password schema
 */
export const withConfirmPassword = (
  schema: z.ZodObject<z.ZodRawShape>,
  t: (key: string) => string
) => {
  return schema
    .extend({
      confirmPassword: z
        .string()
        .min(1, t('auth.validation.confirmPasswordRequired')),
    })
    .refine(
      (data: Record<string, unknown>) => data.password === data.confirmPassword,
      {
        message: t('auth.validation.passwordsNotMatch'),
        path: ['confirmPassword'],
      }
    );
};

// Common form data types
export type PhoneFormData = z.infer<ReturnType<typeof createPhoneSchema>>;
export type OTPFormData = z.infer<ReturnType<typeof createOTPSchema>>;
export type PasswordFormData = z.infer<ReturnType<typeof createPasswordSchema>>;
export type PasswordWithConfirmationFormData = z.infer<
  ReturnType<typeof createPasswordWithConfirmationSchema>
>;

// Default values for common forms
export const phoneFormDefaults: PhoneFormData = {
  phone: '',
};

export const otpFormDefaults: OTPFormData = {
  otp: '',
};

export const passwordFormDefaults: PasswordFormData = {
  password: '',
};

export const passwordWithConfirmationFormDefaults: PasswordWithConfirmationFormData =
  {
    password: '',
    confirmPassword: '',
  };
