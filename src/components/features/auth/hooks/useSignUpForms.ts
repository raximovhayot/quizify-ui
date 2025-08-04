import { zodResolver } from '@hookform/resolvers/zod';
import { UseFormReturn, useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { useCallback, useEffect, useState } from 'react';

import { useTranslations } from 'next-intl';
import { useRouter, useSearchParams } from 'next/navigation';

import {
  useSignUpPrepareMutation,
  useSignUpVerifyMutation,
} from '@/components/features/auth/hooks/useAuthMutations';
import { useNextAuth } from '@/components/features/auth/hooks/useNextAuth';
import { ROUTES_AUTH } from '@/components/features/auth/routes';
import {
  SignUpPhoneFormData,
  VerificationFormData,
  createSignUpPhoneSchema,
  createVerificationSchema,
  signUpPhoneFormDefaults,
  verificationFormDefaults,
} from '@/components/features/auth/schemas/auth';
import { BackendError } from '@/types/api';

export type SignUpStep = 'phone' | 'verification';

// Hook return type for better type safety
export interface UseSignUpFormsReturn {
  // State
  isSubmitting: boolean;
  phoneNumber: string;
  resendCooldown: number;
  isAuthenticated: boolean;

  // Forms
  phoneForm: UseFormReturn<SignUpPhoneFormData>;
  verificationForm: UseFormReturn<VerificationFormData>;

  // Handlers
  onPhoneSubmit: () => void;
  onVerificationSubmit: () => void;
  handleResendOTP: () => void;
}

/**
 * Custom hook for managing sign-up form state and logic
 * Handles all three steps of the sign-up process: phone, verification, and user details
 */
export function useSignUpForms(): UseSignUpFormsReturn {
  const { isAuthenticated, user } = useNextAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const t = useTranslations();

  // React Query mutations
  const signUpPrepareMutation = useSignUpPrepareMutation();
  const signUpVerifyMutation = useSignUpVerifyMutation();

  // State management for sign-up flow - using URL params like forgot password
  const [phoneNumber, setPhoneNumber] = useState(
    searchParams.get('phone') || ''
  );
  const [resendCooldown, setResendCooldown] = useState(
    Number(searchParams.get('resendTime')) || 0
  );

  // Derive isSubmitting from mutations
  const isSubmitting =
    signUpPrepareMutation.isPending || signUpVerifyMutation.isPending;

  // Create validation schemas with localized messages
  const phoneSchema = createSignUpPhoneSchema(t);

  // Initialize forms with validation schemas
  const phoneForm = useForm<SignUpPhoneFormData>({
    resolver: zodResolver(phoneSchema),
    defaultValues: signUpPhoneFormDefaults,
  });

  // Create verification schema and form
  const verificationSchema = createVerificationSchema(t);
  const verificationForm = useForm<VerificationFormData>({
    resolver: zodResolver(verificationSchema),
    defaultValues: verificationFormDefaults,
  });

  // Handle authentication redirect for authenticated users
  useEffect(() => {
    if (isAuthenticated && user) {
      const redirectTo = searchParams.get('redirect') || '/';
      router.push(redirectTo);
    }
  }, [isAuthenticated, user, router, searchParams]);

  // Countdown timer for resend button
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(
        () => setResendCooldown(resendCooldown - 1),
        1000
      );
      return () => clearTimeout(timer);
    }
  }, [resendCooldown, setResendCooldown]);

  // Phone submission handler
  const onPhoneSubmit = useCallback(
    async (data: SignUpPhoneFormData) => {
      signUpPrepareMutation.mutate(
        { phone: data.phone },
        {
          onSuccess: (prepareResponse) => {
            // Update phone number state
            setPhoneNumber(data.phone);

            // Set the initial cooldown timer
            setResendCooldown(prepareResponse.waitingTime);

            // Reset verification form to ensure clean state
            verificationForm.reset(verificationFormDefaults);

            toast.success(
              t('auth.signUp.codeSent', {
                default: 'Verification code sent to your phone',
              })
            );

            // Navigate to verification page with phone number and waiting time as query params
            router.push(
              ROUTES_AUTH.registerVerify({
                phone: prepareResponse.phoneNumber,
                resendTime: prepareResponse.waitingTime,
              })
            );
          },
        }
      );
    },
    [signUpPrepareMutation, setResendCooldown, router, verificationForm, t]
  );

  // Verification submission handler
  const onVerificationSubmit = useCallback(
    async (data: VerificationFormData) => {
      signUpVerifyMutation.mutate(
        {
          phone: phoneNumber,
          otp: data.otp,
        },
        {
          onSuccess: (jwtToken) => {
            // Store the JWT token temporarily for profile completion
            // We can't create a NextAuth session yet because the user hasn't set a password
            // The profile completion page will handle creating the session after completion
            sessionStorage.setItem('signupToken', JSON.stringify(jwtToken));

            // Show success message before navigation
            toast.success(
              t('auth.verification.success', {
                default:
                  'Phone verified successfully! Redirecting to profile setup...',
              })
            );

            // NextAuth middleware will handle redirect to /profile/complete for NEW users
            router.push('/profile/complete');
          },
          onError: (error: BackendError) => {
            // Handle specific error cases - if code expired, go back to phone step
            const firstError = error.getFirstError();
            if (firstError?.message.includes('expired')) {
              toast.error(
                t('auth.verification.expired', {
                  default:
                    'Verification code has expired. Please request a new one.',
                })
              );
              router.push(ROUTES_AUTH.register());
            }
          },
        }
      );
    },
    [phoneNumber, signUpVerifyMutation, router, t]
  );

  // Resend OTP handler
  const handleResendOTP = useCallback(async () => {
    if (resendCooldown > 0 || !phoneNumber) return;

    signUpPrepareMutation.mutate(
      { phone: phoneNumber },
      {
        onSuccess: (response) => {
          setResendCooldown(response.waitingTime);
          toast.success(
            t('auth.verification.resendSuccess', {
              default: 'New verification code sent',
            })
          );
        },
      }
    );
  }, [
    resendCooldown,
    phoneNumber,
    signUpPrepareMutation,
    t,
    setResendCooldown,
  ]);

  return {
    // State
    isSubmitting,
    phoneNumber,
    resendCooldown,
    isAuthenticated,

    // Forms
    phoneForm,
    verificationForm,

    // Handlers
    onPhoneSubmit: phoneForm.handleSubmit(onPhoneSubmit),
    onVerificationSubmit: verificationForm.handleSubmit(onVerificationSubmit),
    handleResendOTP,
  };
}
