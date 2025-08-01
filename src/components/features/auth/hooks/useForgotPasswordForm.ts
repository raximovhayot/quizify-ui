import { useEffect, useState } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import {
  useForgotPasswordPrepareMutation,
  useForgotPasswordUpdateMutation,
  useForgotPasswordVerifyMutation,
} from '@/components/features/auth/hooks/useAuthMutations';
import { useNextAuth } from '@/components/features/auth/hooks/useNextAuth';
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
} from '@/components/features/auth/schemas/auth';
import { BackendError } from '@/types/api';

export type ForgotPasswordStep =
  | 'phone'
  | 'verification'
  | 'new-password'
  | 'completed';

/**
 * Custom hook for managing forgot password form state and logic
 * Handles all steps of the forgot password process: phone, verification, and new password
 */
export function useForgotPasswordForm() {
  const { isAuthenticated } = useNextAuth();
  const router = useRouter();
  const t = useTranslations();

  // React Query mutations
  const forgotPasswordPrepareMutation = useForgotPasswordPrepareMutation();
  const forgotPasswordVerifyMutation = useForgotPasswordVerifyMutation();
  const forgotPasswordUpdateMutation = useForgotPasswordUpdateMutation();

  // Form state
  const [currentStep, setCurrentStep] = useState<ForgotPasswordStep>('phone');
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [verificationToken, setVerificationToken] = useState<string>('');
  const [resendCooldown, setResendCooldown] = useState(0);

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

  // Handle authentication redirect
  useEffect(() => {
    if (isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, router]);

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

  // Phone submission handler
  const onPhoneSubmit = async (data: ForgotPasswordPhoneFormData) => {
    forgotPasswordPrepareMutation.mutate(
      { phone: data.phone },
      {
        onSuccess: (prepareResponse) => {
          setPhoneNumber(prepareResponse.phoneNumber);

          // Reset verification form to ensure clean state
          verificationForm.reset(forgotPasswordVerificationFormDefaults);

          setCurrentStep('verification');
          setResendCooldown(prepareResponse.waitingTime);
          toast.success(
            t('auth.forgotPassword.codeSent', {
              default: 'Verification code sent to your phone',
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
          setCurrentStep('new-password');
          toast.success(
            t('auth.verification.success', {
              default: 'Code verified successfully',
            })
          );
        },
        onError: (error: BackendError) => {
          // Handle specific error cases - if code expired, go back to phone step
          const firstError = error.getFirstError();
          if (firstError?.message.includes('expired')) {
            setCurrentStep('phone');
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
          setCurrentStep('completed');
          toast.success(
            t('auth.forgotPassword.success.message', {
              default:
                'Password reset successfully. You can now sign in with your new password.',
            })
          );

          // Redirect to sign-in page after a short delay
          setTimeout(() => {
            router.push('/sign-in');
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
            setCurrentStep('phone');
          }
        },
      }
    );
  };

  // Resend OTP handler
  const handleResendOTP = async () => {
    if (resendCooldown > 0) return;

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
    currentStep,
    isSubmitting,
    phoneNumber,
    resendCooldown,
    isAuthenticated,

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
