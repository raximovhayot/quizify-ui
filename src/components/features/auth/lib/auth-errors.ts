import { UseFormReturn, FieldPath } from 'react-hook-form';
import { toast } from 'sonner';
import { BackendError } from '@/types/api';

/**
 * Handles authentication errors by setting field-specific errors or showing toast notifications
 * @param error - The error object (BackendError or unknown)
 * @param form - React Hook Form instance
 * @param t - Translation function
 * @returns boolean indicating if field-specific errors were handled
 */
export function handleAuthError<T extends Record<string, unknown>>(
    error: unknown,
    form: UseFormReturn<T>,
    t: (key: string, options?: { default?: string }) => string
): boolean {
    if (error instanceof BackendError) {
        let hasFieldErrors = false;
        
        // Handle phone field errors
        if (error.hasFieldErrors('phone') && 'phone' in form.getValues()) {
            const phoneErrors = error.getFieldErrors('phone');
            form.setError('phone' as FieldPath<T>, {
                type: 'server',
                message: phoneErrors[0].message
            });
            hasFieldErrors = true;
        }
        
        // Handle password field errors
        if (error.hasFieldErrors('password') && 'password' in form.getValues()) {
            const passwordErrors = error.getFieldErrors('password');
            form.setError('password' as FieldPath<T>, {
                type: 'server',
                message: passwordErrors[0].message
            });
            hasFieldErrors = true;
        }
        
        // Handle OTP field errors
        if (error.hasFieldErrors('otp') && 'otp' in form.getValues()) {
            const otpErrors = error.getFieldErrors('otp');
            form.setError('otp' as FieldPath<T>, {
                type: 'server',
                message: otpErrors[0].message
            });
            hasFieldErrors = true;
        }
        
        // If no field-specific errors, show general error as toast
        if (!hasFieldErrors) {
            console.error(error);
            const firstError = error.getFirstError();
            if (firstError) {
                toast.error(firstError.message);
            } else {
                const genericError = t('common.unexpectedError', { default: 'An unexpected error occurred.' });
                toast.error(genericError);
            }
        }
        
        return hasFieldErrors;
    } else {
        // Handle unexpected errors
        const unexpectedError = t('common.unexpectedError', { default: 'An unexpected error occurred.' });
        toast.error(unexpectedError);
        return false;
    }
}

/**
 * Clears form errors before submission
 * @param form - React Hook Form instance
 */
export function clearFormErrors<T extends Record<string, unknown>>(form: UseFormReturn<T>): void {
    form.clearErrors();
}