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
            .min(1, t('auth.validation.firstNameRequired', { default: 'First name is required' }))
            .min(2, t('auth.validation.firstNameMinLength', { default: 'First name must be at least 2 characters' }))
            .max(50, t('auth.validation.firstNameMaxLength', { default: 'First name must be less than 50 characters' })),
        lastName: z.string()
            .min(1, t('auth.validation.lastNameRequired', { default: 'Last name is required' }))
            .min(2, t('auth.validation.lastNameMinLength', { default: 'Last name must be at least 2 characters' }))
            .max(50, t('auth.validation.lastNameMaxLength', { default: 'Last name must be less than 50 characters' })),
        password: z.string()
            .min(1, t('auth.validation.passwordRequired', { default: 'Password is required' }))
            .min(PASSWORD_MIN_LENGTH, t('auth.validation.passwordMinLength', { default: 'Password must be at least 8 characters' }))
            .regex(PASSWORD_REGEX, t('auth.validation.passwordPattern', { default: 'Password must contain at least one uppercase letter, one lowercase letter, and one number' })),
        dashboardType: z.nativeEnum(DashboardType, {
            errorMap: () => ({ message: t('auth.validation.dashboardTypeRequired', { default: 'Please select your role' }) })
        })
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
    dashboardType: DashboardType.STUDENT, // Default to student
};