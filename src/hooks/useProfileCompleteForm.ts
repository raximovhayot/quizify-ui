import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { useNextAuth } from '@/hooks/useNextAuth';
import { AuthService } from '@/lib/auth-service';
import { AccountCompleteRequest, DashboardType } from '@/types/auth';
import { handleAuthError, clearFormErrors } from '@/utils/auth-errors';
import {
  createProfileCompleteSchema,
  ProfileCompleteFormData,
  profileCompleteFormDefaults,
} from '@/schemas/profile';

/**
 * Custom hook for profile complete form logic
 * Handles form state, validation, submission, and error handling
 */
export function useProfileCompleteForm() {
  const { user } = useNextAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const t = useTranslations();

  // Create validation schema with localized messages
  const profileCompleteSchema = createProfileCompleteSchema(t);

  // Initialize form with validation schema
  const form = useForm<ProfileCompleteFormData>({
    resolver: zodResolver(profileCompleteSchema),
    defaultValues: profileCompleteFormDefaults,
  });

  // Handle redirects based on user state
  useEffect(() => {
    // Redirect if user is not authenticated
    if (!user) {
      router.push('/sign-in');
      return;
    }

    // Check if user already has completed profile
    if (user.firstName && user.lastName) {
      router.push('/dashboard');
      return;
    }
  }, [user, router]);

  // Form submission handler
  const onSubmit = useCallback(async (data: ProfileCompleteFormData) => {
    setIsSubmitting(true);

    // Clear any previous errors
    clearFormErrors(form);

    try {
      // Get access token from localStorage
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) {
        toast.error(t('auth.error.noToken', { 
          default: 'Authentication token not found. Please sign in again.' 
        }));
        router.push('/sign-in');
        return;
      }

      const completeRequest: AccountCompleteRequest = {
        firstName: data.firstName,
        lastName: data.lastName,
        password: data.password,
        dashboardType: data.dashboardType,
      };

      const updatedAccount = await AuthService.completeAccount(completeRequest, accessToken);

      // Update user context with completed profile
      const currentTokens = {
        accessToken,
        refreshToken: localStorage.getItem('refreshToken') || '',
        user: updatedAccount,
      };
      setUserFromToken(currentTokens);

      toast.success(t('profile.complete.success', {
        default: 'Profile completed successfully! Welcome to Quizify!',
      }));

      // Redirect to appropriate dashboard based on role
      const redirectPath = data.dashboardType === DashboardType.INSTRUCTOR ? '/instructor' : '/student';
      router.push(redirectPath);

    } catch (error: unknown) {
      handleAuthError(error, form, t);
    } finally {
      setIsSubmitting(false);
    }
  }, [form, setUserFromToken, router, t]);

  return {
    form,
    isSubmitting,
    onSubmit: form.handleSubmit(onSubmit),
  };
}