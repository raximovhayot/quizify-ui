import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { useNextAuth } from '@/hooks/useNextAuth';
import { UserState } from '@/types/account';
import { createSignInSchema, SignInFormData, signInFormDefaults } from '@/schemas/auth';
import { handleAuthError, clearFormErrors } from '@/utils/auth-errors';

/**
 * Custom hook for NextAuth sign-in form logic
 * Handles form state, validation, submission, and error handling
 */
export function useNextAuthSignIn() {
    const { login, isAuthenticated, user, isLoading } = useNextAuth();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const router = useRouter();
    const searchParams = useSearchParams();
    const t = useTranslations();

    // Create validation schema with localized messages
    const signInSchema = createSignInSchema(t);

    // Initialize form with validation schema
    const form = useForm<SignInFormData>({
        resolver: zodResolver(signInSchema),
        defaultValues: signInFormDefaults,
    });

    // Handle authentication redirect for completed users only
    // NEW users will be redirected by middleware to profile completion
    useEffect(() => {
        if (isAuthenticated && user && user.state !== UserState.NEW) {
            const redirectTo = searchParams.get('redirect') || '/';
            router.push(redirectTo);
        }
    }, [isAuthenticated, user, router, searchParams]);

    // Form submission handler
    const onSubmit = async (data: SignInFormData) => {
        setIsSubmitting(true);
        
        // Clear any previous errors
        clearFormErrors(form);

        try {
            await login(data.phone, data.password);

            toast.success(t('auth.loginSuccess'));
            
            // Don't redirect here - let the useEffect handle it based on user state
            // This ensures NEW users are handled by middleware redirect
        } catch (error: unknown) {
            handleAuthError(error, form, t);
        } finally {
            setIsSubmitting(false);
        }
    };

    return {
        form,
        isSubmitting,
        isAuthenticated,
        isLoading,
        onSubmit: form.handleSubmit(onSubmit),
    };
}