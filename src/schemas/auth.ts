import * as z from 'zod';
import { PHONE_REGEX, PASSWORD_REGEX, PASSWORD_MIN_LENGTH } from '@/constants/validation';

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