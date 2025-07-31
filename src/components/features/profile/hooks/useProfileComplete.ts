import { useState } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { signIn } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import { useNextAuth } from '@/components/features/auth/hooks/useNextAuth';
import {
  clearFormErrors,
  handleAuthError,
} from '@/components/features/auth/lib/auth-errors';
import { AccountService } from '@/components/features/profile/services/account-service';
import {
  AccountCompleteRequest,
  DashboardType,
} from '@/components/features/profile/types/account';

// Types for helper functions
interface TranslationFunction {
  (key: string, options?: { default?: string }): string;
}

// Profile completion form schema
const createProfileCompleteSchema = (t: TranslationFunction) =>
  z.object({
    firstName: z
      .string()
      .min(
        1,
        t('auth.validation.firstNameRequired', {
          default: 'First name is required',
        })
      ),
    lastName: z
      .string()
      .min(
        1,
        t('auth.validation.lastNameRequired', {
          default: 'Last name is required',
        })
      ),
    password: z
      .string()
      .min(
        8,
        t('auth.validation.passwordMinLength', {
          default: 'Password must be at least 8 characters',
        })
      )
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        t('auth.validation.passwordPattern', {
          default:
            'Password must contain at least one uppercase letter, one lowercase letter, and one number',
        })
      ),
    dashboardType: z.enum(DashboardType, {
      message: t('auth.validation.dashboardTypeRequired', {
        default: 'Please select your role',
      }),
    }),
  });

export type ProfileCompleteFormData = z.infer<
  ReturnType<typeof createProfileCompleteSchema>
>;

const profileCompleteDefaults: ProfileCompleteFormData = {
  firstName: '',
  lastName: '',
  password: '',
  dashboardType: DashboardType.STUDENT,
};

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
  const profileCompleteSchema = createProfileCompleteSchema(t);

  // Initialize form with validation schema
  const form = useForm<ProfileCompleteFormData>({
    resolver: zodResolver(profileCompleteSchema),
    defaultValues: profileCompleteDefaults,
  });

  // Form submission handler
  const onSubmit = async (data: ProfileCompleteFormData) => {
    setIsSubmitting(true);

    // Clear any previous errors
    clearFormErrors(form);

    try {
      let accessToken: string;
      let userPhone: string;

      // Check if we have a NextAuth session (existing user) or signup token (new user)
      if (session?.accessToken) {
        // Existing user with NextAuth session
        accessToken = session.accessToken;
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
        accessToken = signupToken.accessToken;
        userPhone = signupToken.user.phone;
      }

      // Prepare account completion request
      const accountCompleteRequest: AccountCompleteRequest = {
        firstName: data.firstName,
        lastName: data.lastName,
        password: data.password,
        dashboardType: data.dashboardType,
      };

      // Complete account using AccountService
      await AccountService.completeAccount(accountCompleteRequest, accessToken);

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
