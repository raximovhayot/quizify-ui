import * as z from 'zod';

import { DashboardType } from '@/components/features/profile/types/account';
import { PASSWORD_MIN_LENGTH, PASSWORD_REGEX } from '@/constants/validation';
import { Language } from '@/types/common';

// ============================================================================
// PROFILE COMPLETE SCHEMAS
// ============================================================================

/**
 * Profile complete validation schema factory
 * Creates a validation schema for completing user profile after sign-up
 */
export const profileCompleteDetailsSchema = (
  t: (key: string, p: { default: string }) => string
) => {
  return z.object({
    firstName: z
      .string()
      .min(
        1,
        t('auth.validation.firstNameRequired', {
          default: 'First name is required',
        })
      )
      .min(
        2,
        t('auth.validation.firstNameMinLength', {
          default: 'First name must be at least 2 characters',
        })
      )
      .max(
        50,
        t('auth.validation.firstNameMaxLength', {
          default: 'First name must be less than 50 characters',
        })
      ),
    lastName: z
      .string()
      .min(
        1,
        t('auth.validation.lastNameRequired', {
          default: 'Last name is required',
        })
      )
      .min(
        2,
        t('auth.validation.lastNameMinLength', {
          default: 'Last name must be at least 2 characters',
        })
      )
      .max(
        50,
        t('auth.validation.lastNameMaxLength', {
          default: 'Last name must be less than 50 characters',
        })
      ),
    password: z
      .string()
      .min(
        1,
        t('auth.validation.passwordRequired', {
          default: 'Password is required',
        })
      )
      .min(
        PASSWORD_MIN_LENGTH,
        t('auth.validation.passwordMinLength', {
          default: 'Password must be at least 8 characters',
        })
      )
      .regex(
        PASSWORD_REGEX,
        t('auth.validation.passwordPattern', {
          default:
            'Password must contain at least one uppercase letter, one lowercase letter, and one number',
        })
      ),
    dashboardType: z.enum(DashboardType, {
      message: t('auth.validation.dashboardTypeRequired', {
        default: 'Please select your role',
      }),
    }),
  });
};

/**
 * Profile details update schema factory
 * Creates a validation schema for updating profile details in settings page
 */
export const profileDetailsUpdateSchema = (
  t: (k: string, o: { fallback: string }) => string
) =>
  z.object({
    firstName: z
      .string()
      .min(
        1,
        t('auth.validation.firstNameRequired', {
          fallback: 'First name is required',
        })
      )
      .min(2)
      .max(50),
    lastName: z
      .string()
      .min(
        1,
        t('auth.validation.lastNameRequired', {
          fallback: 'Last name is required',
        })
      )
      .min(2)
      .max(50),
    language: z.enum(Language, {
      message: t('profile.validation.languageRequired', {
        fallback: 'Language is required',
      }),
    }),
    dashboardType: z.enum(DashboardType, {
      message: t('auth.validation.dashboardTypeRequired', {
        fallback: 'Please select your role',
      }),
    }),
  });

export const profilePasswordUpdateSchema = (
  t: (k: string, o: { fallback: string }) => string
) =>
  z
    .object({
      currentPassword: z
        .string()
        .min(
          1,
          t('auth.validation.passwordRequired', {
            fallback: 'Password is required',
          })
        ),
      newPassword: z
        .string()
        .min(
          PASSWORD_MIN_LENGTH,
          t('auth.validation.passwordMinLength', {
            fallback: 'Password must be at least 8 characters',
          })
        )
        .regex(
          PASSWORD_REGEX,
          t('auth.validation.passwordPattern', {
            fallback:
              'Password must contain at least one uppercase letter, one lowercase letter, and one number',
          })
        ),
      confirmPassword: z
        .string()
        .min(
          1,
          t('auth.validation.confirmPasswordRequired', {
            fallback: 'Please confirm your password',
          })
        ),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
      path: ['confirmPassword'],
      message: t('auth.validation.passwordsNotMatch', {
        fallback: 'Passwords do not match',
      }),
    });

/**
 * Profile complete form data type
 */
export type ProfileCompleteFormData = z.infer<
  ReturnType<typeof profileCompleteDetailsSchema>
>;

/**
 * Default values for profile complete form
 */
export const profileCompleteFormDefaults: Partial<ProfileCompleteFormData> = {
  firstName: '',
  lastName: '',
  password: '',
  dashboardType: DashboardType.STUDENT, // Default to student
};
