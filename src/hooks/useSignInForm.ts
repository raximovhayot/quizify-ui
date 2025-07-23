import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { createSignInSchema, SignInFormData, signInFormDefaults } from '@/schemas/auth';
import { handleAuthError, clearFormErrors } from '@/utils/auth-errors';

/**
 * Custom hook for sign-in form logic
 * Handles form state, validation, submission, and error handling
 */
export function useSignInForm() {
    const { login, isAuthenticated } = useAuth();
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

    // Handle authentication redirect
    useEffect(() => {
        if (isAuthenticated) {
            const redirectTo = searchParams.get('redirect') || '/';
            router.push(redirectTo);
        }
    }, [isAuthenticated, router, searchParams]);

    // Form submission handler
    const onSubmit = async (data: SignInFormData) => {
        setIsSubmitting(true);
        
        // Clear any previous errors
        clearFormErrors(form);

        try {
            await login(data.phone, data.password);

            // Get redirect URL from query params or default to home
            const redirectTo = searchParams.get('redirect') || '/';

            toast.success(t('auth.loginSuccess'));
            router.push(redirectTo);
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
        onSubmit: form.handleSubmit(onSubmit),
    };
}