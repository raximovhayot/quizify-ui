import { useCallback, useEffect, useState } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { useRouter, useSearchParams } from 'next/navigation';
import { UseFormReturn, useForm } from 'react-hook-form';
import { toast } from 'sonner';

import {
  useSignUpPrepareMutation,
  useSignUpVerifyMutation,
} from '@/components/features/auth/hooks/useAuthMutations';
import { useNextAuth } from '@/components/features/auth/hooks/useNextAuth';
import {
  SignUpPhoneFormData,
  VerificationFormData,
  createSignUpPhoneSchema,
  createVerificationSchema,
  signUpPhoneFormDefaults,
  verificationFormDefaults,
} from '@/components/features/auth/schemas/auth';
import { useGlobalLoading } from '@/components/ui/top-loader';

export type SignUpStep = 'phone' | 'verification';

// Hook return type for better type safety
export interface UseSignUpFormsReturn {
  // State
  currentStep: SignUpStep;
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
  const { startLoading, stopLoading } = useGlobalLoading();

  // React Query mutations
  const signUpPrepareMutation = useSignUpPrepareMutation();
  const signUpVerifyMutation = useSignUpVerifyMutation();

  // Form state
  const [currentStep, setCurrentStep] = useState<SignUpStep>('phone');
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [resendCooldown, setResendCooldown] = useState(0);

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
            setPhoneNumber(prepareResponse.phoneNumber);
            setCurrentStep('verification');
            setResendCooldown(prepareResponse.waitingTime);
          },
        }
      );
    },
    [signUpPrepareMutation, setResendCooldown]
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

            // Start the top loader for navigation
            startLoading();

            // NextAuth middleware will handle redirect to /profile/complete for NEW users
            router.push('/profile/complete');

            // Stop the loader after navigation (will be cleaned up when component unmounts)
            setTimeout(() => stopLoading(), 100);
          },
        }
      );
    },
    [phoneNumber, signUpVerifyMutation, router, t, startLoading, stopLoading]
  );

  // Resend OTP handler
  const handleResendOTP = useCallback(async () => {
    if (resendCooldown > 0) return;

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
    currentStep,
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
