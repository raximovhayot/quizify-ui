import { useEffect, useState } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { useNextAuth } from '@/components/features/auth/hooks/useNextAuth';
import {
  clearFormErrors,
  handleAuthError,
} from '@/components/features/auth/lib/auth-errors';
import {
  SignInFormData,
  createSignInSchema,
  signInFormDefaults,
} from '@/components/features/auth/schemas/auth';
import { UserState } from '@/components/features/profile/types/account';

/**
 * Custom hook for NextAuth sign-in form logic
 * Handles form state, validation, submission, and error handling
 */
export function useNextAuthSignIn() {
  const { login, isAuthenticated, user } = useNextAuth();
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
      const response = await login(data.phone, data.password);
      console.log(response);
      toast.success(t('auth.loginSuccess'));
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
