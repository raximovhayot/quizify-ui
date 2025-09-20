import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

import { useEffect } from 'react';

import { useTranslations } from 'next-intl';
import { useRouter, useSearchParams } from 'next/navigation';

import { useLoginMutation } from '@/components/features/auth/hooks/useAuthMutations';
import { useNextAuth } from '@/components/features/auth/hooks/useNextAuth';
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
  const { isAuthenticated, user } = useNextAuth();
  const loginMutation = useLoginMutation();
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
      const redirectTo = searchParams?.get('redirect') ?? '/';
      router.push(redirectTo);
    }
  }, [isAuthenticated, user, router, searchParams]);

  // Form submission handler using React Query mutation
  const onSubmit = async (data: SignInFormData) => {
    loginMutation.mutate({
      phone: data.phone,
      password: data.password,
    });
  };

  return {
    form,
    isSubmitting: loginMutation.isPending,
    isAuthenticated,
    onSubmit: form.handleSubmit(onSubmit),
  };
}
