import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { useState } from 'react';

import { signIn } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';

import { useNextAuth } from '@/components/features/auth/hooks/useNextAuth';
import {
  clearFormErrors,
  handleAuthError,
} from '@/components/features/auth/lib/auth-errors';
import {
  profileCompleteDetailsSchema,
  profileCompleteFormDefaults,
} from '@/components/features/profile/schemas/profile';
import type { ProfileCompleteFormData } from '@/components/features/profile/schemas/profile';
import { AccountService } from '@/components/features/profile/services/accountService';
import {
  AccountCompleteRequest,
  DashboardType,
} from '@/components/features/profile/types/account';
import { apiClient } from '@/lib/api';
import { handleApiResponse } from '@/lib/api-utils';

export type { ProfileCompleteFormData } from '@/components/features/profile/schemas/profile';

/**
 * Custom hook for profile completion form logic
 * Handles form state, validation, submission, and error handling
 */
export function useProfileComplete() {
  const { user, session } = useNextAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const t = useTranslations();

  // Create validation schema with localized messages
  const profileCompleteSchema = profileCompleteDetailsSchema(t);

  // Initialize form with validation schema
  const form = useForm<ProfileCompleteFormData>({
    resolver: zodResolver(profileCompleteSchema),
    defaultValues: profileCompleteFormDefaults,
  });

  // Form submission handler
  const onSubmit = async (data: ProfileCompleteFormData) => {
    setIsSubmitting(true);

    // Clear any previous errors
    clearFormErrors(form);

    try {
      let userPhone: string;
      let tempToken: string | null = null;

      // Check if we have a NextAuth session (existing user) or signup token (new user)
      if (session?.accessToken) {
        // Existing user with NextAuth session
        userPhone = session.user.phone;
      } else {
        // New user from signup flow - get token from sessionStorage
        const signupTokenData = sessionStorage.getItem('signupToken');
        if (!signupTokenData) {
          toast.error(
            t('auth.error.noSignupToken', {
              default:
                'No signup session found. Please start the signup process again.',
            })
          );
          router.push('/sign-up');
          return;
        }

        const signupToken = JSON.parse(signupTokenData);
        tempToken = signupToken.accessToken as string;
        userPhone = signupToken.user.phone as string;
      }

      // Prepare account completion request
      const accountCompleteRequest: AccountCompleteRequest = {
        firstName: data.firstName,
        lastName: data.lastName,
        password: data.password,
        dashboardType: data.dashboardType,
      };

      // Temporarily set auth token if needed (signup flow without session)
      const previousToken = apiClient.getAuthToken();
      if (tempToken) {
        apiClient.setAuthToken(tempToken);
      }

      // Complete account using AccountService (throws on error via handleApiResponse)
      const completeResp = await AccountService.completeAccount(
        accountCompleteRequest
      );
      handleApiResponse(completeResp);

      // Restore previous token
      if (tempToken) {
        apiClient.setAuthToken(previousToken ?? null);
      }

      // Clear the signup token from sessionStorage
      sessionStorage.removeItem('signupToken');

      // Create NextAuth session with the new credentials
      const signInResult = await signIn('credentials', {
        phone: userPhone,
        password: data.password,
        redirect: false,
      });

      if (signInResult?.error) {
        toast.error(
          t('auth.error.sessionCreation', {
            default:
              'Profile completed but failed to create session. Please sign in manually.',
          })
        );
        router.push('/sign-in');
        return;
      }

      toast.success(
        t('auth.profileComplete.success', {
          default: 'Profile completed successfully!',
        })
      );

      // Redirect based on dashboard type
      if (data.dashboardType === DashboardType.STUDENT) {
        router.push('/student');
      } else if (data.dashboardType === DashboardType.INSTRUCTOR) {
        router.push('/instructor');
      } else {
        router.push('/');
      }
    } catch (error: unknown) {
      handleAuthError(error, form, t);
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    form,
    isSubmitting,
    user,
    onSubmit: form.handleSubmit(onSubmit),
  };
}
