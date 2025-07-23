import * as z from 'zod';
import {PASSWORD_MIN_LENGTH, PASSWORD_REGEX} from "@/constants/validation";
import {DashboardType} from "@/types/auth";

// ============================================================================
// PROFILE COMPLETE SCHEMAS
// ============================================================================

/**
 * Profile complete validation schema factory
 * Creates a validation schema for completing user profile after sign-up
 */
export const createProfileCompleteSchema = (t: (key: string) => string) => {
    return z.object({
        firstName: z.string()
            .min(1, t('auth.validation.firstNameRequired'))
            .min(2, t('auth.validation.firstNameMinLength'))
            .max(50, t('auth.validation.firstNameMaxLength')),
        lastName: z.string()
            .min(1, t('auth.validation.lastNameRequired'))
            .min(2, t('auth.validation.lastNameMinLength'))
            .max(50, t('auth.validation.lastNameMaxLength')),
        password: z.string()
            .min(1, t('auth.validation.passwordRequired'))
            .min(PASSWORD_MIN_LENGTH, t('auth.validation.passwordMinLength'))
            .regex(PASSWORD_REGEX, t('auth.validation.passwordPattern')),
        confirmPassword: z.string()
            .min(1, t('auth.validation.confirmPasswordRequired')),
        dashboardType: z.enum(DashboardType, t('auth.validation.dashboardTypeRequired'))
    }).refine((data) => data.password === data.confirmPassword, {
        message: t('auth.validation.passwordsNotMatch'),
        path: ['confirmPassword']
    });
};

/**
 * Profile complete form data type
 */
export type ProfileCompleteFormData = z.infer<ReturnType<typeof createProfileCompleteSchema>>;

/**
 * Default values for profile complete form
 */
export const profileCompleteFormDefaults: Partial<ProfileCompleteFormData> = {
    firstName: '',
    lastName: '',
    password: '',
    confirmPassword: '',
    dashboardType: undefined, // Will be set by user selection
};