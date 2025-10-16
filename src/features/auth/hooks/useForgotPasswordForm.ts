import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { useEffect, useState } from 'react';

import { useTranslations } from 'next-intl';
import { useRouter, useSearchParams } from 'next/navigation';

import {
  useForgotPasswordPrepareMutation,
  useForgotPasswordUpdateMutation,
  useForgotPasswordVerifyMutation,
} from '@/features/auth/hooks/useAuthMutations';
import { useNextAuth } from '@/features/auth/hooks/useNextAuth';
import { ROUTES_AUTH } from '@/features/auth/routes';
import {
  ForgotPasswordNewPasswordFormData,
  ForgotPasswordPhoneFormData,
  ForgotPasswordVerificationFormData,
  createForgotPasswordNewPasswordSchema,
  createForgotPasswordPhoneSchema,
  createForgotPasswordVerificationSchema,
  forgotPasswordNewPasswordFormDefaults,
  forgotPasswordPhoneFormDefaults,
  forgotPasswordVerificationFormDefaults,
} from '@/features/auth/schemas/auth';
import { BackendError } from '@/types/api';

/**
 * Custom hook for managing forgot password form state and logic
 * Handles all steps of the forgot password process: phone, verification, and new password
 */
export function useForgotPasswordForm() {
  const { isAuthenticated } = useNextAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Handle authentication redirect
  useEffect(() => {
    if (isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, router]);

  // State management for forgot password flow
  const [phoneNumber, setPhoneNumber] = useState(
    searchParams?.get('phone') ?? ''
  );
  const [verificationToken, setVerificationToken] = useState(
    searchParams?.get('token') ?? ''
  );
  const [resendCooldown, setResendCooldown] = useState(
    Number(searchParams?.get('resendTime') ?? 0)
  );

  // Countdown timer for resend button
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(
        () => setResendCooldown(resendCooldown - 1),
        1000
      );
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const t = useTranslations();

  // React Query mutations
  const forgotPasswordPrepareMutation = useForgotPasswordPrepareMutation();
  const forgotPasswordVerifyMutation = useForgotPasswordVerifyMutation();
  const forgotPasswordUpdateMutation = useForgotPasswordUpdateMutation();

  // Derive isSubmitting from mutations
  const isSubmitting =
    forgotPasswordPrepareMutation.isPending ||
    forgotPasswordVerifyMutation.isPending ||
    forgotPasswordUpdateMutation.isPending;

  // Create validation schemas with localized messages
  const phoneSchema = createForgotPasswordPhoneSchema(t);
  const verificationSchema = createForgotPasswordVerificationSchema(t);
  const newPasswordSchema = createForgotPasswordNewPasswordSchema(t);

  // Initialize forms with validation schemas
  const phoneForm = useForm<ForgotPasswordPhoneFormData>({
    resolver: zodResolver(phoneSchema),
    defaultValues: forgotPasswordPhoneFormDefaults,
  });

  const verificationForm = useForm<ForgotPasswordVerificationFormData>({
    resolver: zodResolver(verificationSchema),
    defaultValues: forgotPasswordVerificationFormDefaults,
  });

  const newPasswordForm = useForm<ForgotPasswordNewPasswordFormData>({
    resolver: zodResolver(newPasswordSchema),
    defaultValues: forgotPasswordNewPasswordFormDefaults,
  });

  // Phone submission handler
  const onPhoneSubmit = async (data: ForgotPasswordPhoneFormData) => {
    forgotPasswordPrepareMutation.mutate(
      { phone: data.phone },
      {
        onSuccess: (prepareResponse) => {
          // Update phone number state
          setPhoneNumber(data.phone);

          // Set the initial cooldown timer
          setResendCooldown(prepareResponse.waitingTime);

          // Reset verification form to ensure clean state
          verificationForm.reset(forgotPasswordVerificationFormDefaults);

          toast.success(
            t('auth.forgotPassword.codeSent', {
              default: 'Verification code sent to your phone',
            })
          );

          // Navigate to verification page with phone number and waiting time as query params
          router.push(
            ROUTES_AUTH.forgotPasswordVerify({
              phone: prepareResponse.phoneNumber,
              waitingTime: prepareResponse.waitingTime,
            })
          );
        },
      }
    );
  };

  // Verification submission handler
  const onVerificationSubmit = async (
    data: ForgotPasswordVerificationFormData
  ) => {
    forgotPasswordVerifyMutation.mutate(
      {
        phone: phoneNumber,
        otp: data.otp,
      },
      {
        onSuccess: (response) => {
          // Store the verification token for the next step
          setVerificationToken(response.token);
          toast.success(
            t('auth.verification.success', {
              default: 'Code verified successfully',
            })
          );

          // Navigate to reset password page with phone and token as query params
          router.push(
            ROUTES_AUTH.resetPassword({
              phone: phoneNumber,
              token: response.token,
            })
          );
        },
        onError: (error: BackendError) => {
          // Handle specific error cases - if code expired, go back to phone step
          const firstError = error.getFirstError();
          if (firstError?.message.includes('expired')) {
            router.push(ROUTES_AUTH.forgotPassword());
          }
        },
      }
    );
  };

  // New password submission handler
  const onNewPasswordSubmit = async (
    data: ForgotPasswordNewPasswordFormData
  ) => {
    forgotPasswordUpdateMutation.mutate(
      {
        token: verificationToken,
        newPassword: data.password,
      },
      {
        onSuccess: () => {
          toast.success(
            t('auth.forgotPassword.success.message', {
              default:
                'Password reset successfully. You can now sign in with your new password.',
            })
          );

          // Redirect to sign-in page after a short delay
          setTimeout(() => {
            router.push(ROUTES_AUTH.login());
          }, 2000);
        },
        onError: (error: BackendError) => {
          // Handle specific error cases - if token is invalid/expired, go back to phone step
          const firstError = error.getFirstError();
          if (
            firstError?.message.includes('token') &&
            (firstError.message.includes('invalid') ||
              firstError.message.includes('expired'))
          ) {
            router.push(ROUTES_AUTH.forgotPassword());
          }
        },
      }
    );
  };

  // Resend OTP handler
  const handleResendOTP = async () => {
    if (resendCooldown > 0 || !phoneNumber) return;

    forgotPasswordPrepareMutation.mutate(
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
  };

  return {
    // State
    isSubmitting,
    phoneNumber,
    isAuthenticated,
    resendCooldown,

    // Forms
    phoneForm,
    verificationForm,
    newPasswordForm,

    // Handlers
    onPhoneSubmit: phoneForm.handleSubmit(onPhoneSubmit),
    onVerificationSubmit: verificationForm.handleSubmit(onVerificationSubmit),
    onNewPasswordSubmit: newPasswordForm.handleSubmit(onNewPasswordSubmit),
    handleResendOTP,
  };
}
