import * as z from 'zod';
import { PHONE_REGEX, PASSWORD_REGEX, PASSWORD_MIN_LENGTH } from '@/constants/validation';
import { DashboardType } from '@/types/auth';

/**
 * Sign-in form validation schema factory
 * Creates a validation schema with localized error messages
 */
export const createSignInSchema = (t: (key: string) => string) => {
    return z.object({
        phone: z.string()
            .min(1, t('auth.validation.phoneRequired'))
            .regex(PHONE_REGEX, t('auth.validation.phoneInvalid')),
        password: z.string()
            .min(1, t('auth.validation.passwordRequired'))
            .min(PASSWORD_MIN_LENGTH, t('auth.validation.passwordMinLength'))
            .regex(PASSWORD_REGEX, t('auth.validation.passwordPattern')),
    });
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
 * Uses more restrictive phone regex for SMS verification
 */
export const createSignUpPhoneSchema = (t: (key: string) => string) => {
    return z.object({
        phone: z.string()
            .min(1, t('auth.validation.phoneRequired'))
            .regex(/^\+998(90|91|93|94|95|97|98|99|77|88|33|55|61|62|65|66|67|69|71|73|74|75|76|78|79)[0-9]{7}$/, t('auth.validation.phoneInvalid')),
    });
};

/**
 * Sign-up phone form data type
 */
export type SignUpPhoneFormData = z.infer<ReturnType<typeof createSignUpPhoneSchema>>;

/**
 * Default values for sign-up phone form
 */
export const signUpPhoneFormDefaults: SignUpPhoneFormData = {
    phone: '',
};

/**
 * OTP verification schema factory
 */
export const createVerificationSchema = (t: (key: string) => string) => {
    return z.object({
        otp: z.string()
            .min(1, t('auth.validation.otpRequired'))
            .length(6, t('auth.validation.otpLength'))
            .regex(/^\d{6}$/, t('auth.validation.otpPattern')),
    });
};

/**
 * OTP verification form data type
 */
export type VerificationFormData = z.infer<ReturnType<typeof createVerificationSchema>>;

/**
 * Default values for OTP verification form
 */
export const verificationFormDefaults: VerificationFormData = {
    otp: '',
};

/**
 * User details schema factory for sign-up completion
 */
export const createUserDetailsSchema = (t: (key: string) => string) => {
    return z.object({
        firstName: z.string()
            .min(1, t('auth.validation.firstNameRequired'))
            .min(2, t('auth.validation.firstNameMinLength')),
        lastName: z.string()
            .min(1, t('auth.validation.lastNameRequired'))
            .min(2, t('auth.validation.lastNameMinLength')),
        password: z.string()
            .min(1, t('auth.validation.passwordRequired'))
            .min(PASSWORD_MIN_LENGTH, t('auth.validation.passwordMinLength'))
            .regex(PASSWORD_REGEX, t('auth.validation.passwordPattern')),
        confirmPassword: z.string()
            .min(1, t('auth.validation.confirmPasswordRequired')),
        dashboardType: z.nativeEnum(DashboardType, {
            required_error: t('auth.validation.dashboardTypeRequired', { default: 'Please select your role' }),
        }),
    }).refine((data) => data.password === data.confirmPassword, {
        message: t('auth.validation.passwordsNotMatch'),
        path: ["confirmPassword"],
    });
};

/**
 * User details form data type
 */
export type UserDetailsFormData = z.infer<ReturnType<typeof createUserDetailsSchema>>;

/**
 * Default values for user details form
 */
export const userDetailsFormDefaults: UserDetailsFormData = {
    firstName: '',
    lastName: '',
    password: '',
    confirmPassword: '',
    dashboardType: DashboardType.STUDENT,
};

// ============================================================================
// FORGOT PASSWORD SCHEMAS
// ============================================================================

/**
 * Forgot password phone validation schema factory
 * Uses the same phone validation as sign-up for SMS verification
 */
export const createForgotPasswordPhoneSchema = (t: (key: string) => string) => {
    return z.object({
        phone: z.string()
            .min(1, t('auth.validation.phoneRequired'))
            .regex(/^\+998(90|91|93|94|95|97|98|99|77|88|33|55|61|62|65|66|67|69|71|73|74|75|76|78|79)[0-9]{7}$/, t('auth.validation.phoneInvalid')),
    });
};

/**
 * Forgot password phone form data type
 */
export type ForgotPasswordPhoneFormData = z.infer<ReturnType<typeof createForgotPasswordPhoneSchema>>;

/**
 * Default values for forgot password phone form
 */
export const forgotPasswordPhoneFormDefaults: ForgotPasswordPhoneFormData = {
    phone: '',
};

/**
 * Forgot password verification schema factory
 * Uses the same OTP validation as other flows
 */
export const createForgotPasswordVerificationSchema = (t: (key: string) => string) => {
    return z.object({
        verificationCode: z.string()
            .min(1, t('auth.validation.otpRequired'))
            .length(6, t('auth.validation.otpLength'))
            .regex(/^\d{6}$/, t('auth.validation.otpPattern')),
    });
};

/**
 * Forgot password verification form data type
 */
export type ForgotPasswordVerificationFormData = z.infer<ReturnType<typeof createForgotPasswordVerificationSchema>>;

/**
 * Default values for forgot password verification form
 */
export const forgotPasswordVerificationFormDefaults: ForgotPasswordVerificationFormData = {
    verificationCode: '',
};

/**
 * Forgot password new password schema factory
 */
export const createForgotPasswordNewPasswordSchema = (t: (key: string) => string) => {
    return z.object({
        password: z.string()
            .min(1, t('auth.validation.passwordRequired'))
            .min(PASSWORD_MIN_LENGTH, t('auth.validation.passwordMinLength'))
            .regex(PASSWORD_REGEX, t('auth.validation.passwordPattern')),
        confirmPassword: z.string()
            .min(1, t('auth.validation.confirmPasswordRequired')),
    }).refine((data) => data.password === data.confirmPassword, {
        message: t('auth.validation.passwordsNotMatch'),
        path: ["confirmPassword"],
    });
};

/**
 * Forgot password new password form data type
 */
export type ForgotPasswordNewPasswordFormData = z.infer<ReturnType<typeof createForgotPasswordNewPasswordSchema>>;

/**
 * Default values for forgot password new password form
 */
export const forgotPasswordNewPasswordFormDefaults: ForgotPasswordNewPasswordFormData = {
    password: '',
    confirmPassword: '',
};