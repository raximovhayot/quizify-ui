import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { useNextAuth } from '@/hooks/useNextAuth';
import { AuthService } from '@/lib/services/auth-service';
import { BackendError } from '@/types/api';
import { handleAuthError, clearFormErrors } from '@/utils/auth-errors';
import {
  createForgotPasswordPhoneSchema,
  createForgotPasswordVerificationSchema,
  createForgotPasswordNewPasswordSchema,
  ForgotPasswordPhoneFormData,
  ForgotPasswordVerificationFormData,
  ForgotPasswordNewPasswordFormData,
  forgotPasswordPhoneFormDefaults,
  forgotPasswordVerificationFormDefaults,
  forgotPasswordNewPasswordFormDefaults,
} from '@/schemas/auth';

export type ForgotPasswordStep = 'phone' | 'verification' | 'new-password' | 'completed';

/**
 * Custom hook for managing forgot password form state and logic
 * Handles all steps of the forgot password process: phone, verification, and new password
 */
export function useForgotPasswordForm() {
  const { isAuthenticated } = useNextAuth();
  const [currentStep, setCurrentStep] = useState<ForgotPasswordStep>('phone');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [verificationToken, setVerificationToken] = useState<string>('');
  const [resendCooldown, setResendCooldown] = useState(0);
  const router = useRouter();
  const t = useTranslations();

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
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  // Phone submission handler
  const onPhoneSubmit = async (data: ForgotPasswordPhoneFormData) => {
    setIsSubmitting(true);
    
    // Clear any previous errors
    clearFormErrors(phoneForm);

    try {
      const prepareResponse = await AuthService.forgotPasswordPrepare(data.phone);
      setPhoneNumber(prepareResponse.phoneNumber);
      setCurrentStep('verification');
      setResendCooldown(prepareResponse.waitingTime);
      toast.success(t('auth.forgotPassword.codeSent', { 
        default: 'Verification code sent to your phone' 
      }));
    } catch (error: unknown) {
      handleAuthError(error, phoneForm, t);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Verification submission handler
  const onVerificationSubmit = async (data: ForgotPasswordVerificationFormData) => {
    setIsSubmitting(true);
    
    // Clear any previous errors
    clearFormErrors(verificationForm);

    try {
      const response = await AuthService.forgotPasswordVerify(phoneNumber, data.verificationCode);
      
      // Store the verification token for the next step (fix: use 'token' not 'verificationToken')
      setVerificationToken(response.token);
      setCurrentStep('new-password');
      toast.success(t('auth.verification.success', { 
        default: 'Code verified successfully' 
      }));
    } catch (error: unknown) {
      handleAuthError(error, verificationForm, t);
      
      // Handle specific error cases - if code expired, go back to phone step
      if (error instanceof BackendError) {
        const firstError = error.getFirstError();
        if (firstError?.message.includes('expired')) {
          setCurrentStep('phone');
        }
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // New password submission handler
  const onNewPasswordSubmit = async (data: ForgotPasswordNewPasswordFormData) => {
    setIsSubmitting(true);
    
    // Clear any previous errors
    clearFormErrors(newPasswordForm);

    try {
      await AuthService.forgotPasswordUpdate(verificationToken, data.password);
      
      setCurrentStep('completed');
      toast.success(t('auth.forgotPassword.success.message', { 
        default: 'Password reset successfully. You can now sign in with your new password.' 
      }));
      
      // Redirect to sign-in page after a short delay
      setTimeout(() => {
        router.push('/sign-in');
      }, 2000);
    } catch (error: unknown) {
      handleAuthError(error, newPasswordForm, t);
      
      // Handle specific error cases - if token is invalid/expired, go back to phone step
      if (error instanceof BackendError) {
        const firstError = error.getFirstError();
        if (firstError?.message.includes('token') && 
            (firstError.message.includes('invalid') || firstError.message.includes('expired'))) {
          setCurrentStep('phone');
        }
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Resend OTP handler
  const handleResendOTP = async () => {
    if (resendCooldown > 0) return;

    setIsSubmitting(true);

    try {
      const response = await AuthService.forgotPasswordPrepare(phoneNumber);
      setResendCooldown(response.waitingTime);
      toast.success(t('auth.verification.resendSuccess', {
        default: 'New verification code sent'
      }));
    } catch (error: unknown) {
      // For resend OTP, we don't have a specific form to set field errors on
      // So we'll handle it with toast messages only
      if (error instanceof BackendError) {
        const firstError = error.getFirstError();
        if (firstError) {
          toast.error(firstError.message);
        } else {
          const genericError = t('common.unexpectedError', {default: 'An unexpected error occurred.'});
          toast.error(genericError);
        }
      } else {
        const unexpectedError = t('common.unexpectedError', {default: 'An unexpected error occurred.'});
        toast.error(unexpectedError);
      }
    } finally {
      setIsSubmitting(false);
    }
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