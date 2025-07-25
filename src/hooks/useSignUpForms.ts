import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useForm, UseFormReturn } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { useNextAuth } from '@/hooks/useNextAuth';
import { AuthService } from '@/lib/services/auth-service';
import { BackendError } from '@/types/api';
import { handleAuthError, clearFormErrors } from '@/utils/auth-errors';
import {
  createSignUpPhoneSchema,
  SignUpPhoneFormData,
  VerificationFormData,
  signUpPhoneFormDefaults,
  createVerificationSchema, 
  verificationFormDefaults,
} from '@/schemas/auth';


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

// Types for helper functions
interface TranslationFunction {
  (key: string, options?: { default?: string }): string;
}

// Helper functions
const handleGenericError = (error: unknown, t: TranslationFunction): void => {
  if (error instanceof BackendError) {
    const firstError = error.getFirstError();
    if (firstError) {
      toast.error(firstError.message);
    } else {
      const genericError = t('common.unexpectedError', { default: 'An unexpected error occurred.' });
      toast.error(genericError);
    }
  } else {
    const unexpectedError = t('common.unexpectedError', { default: 'An unexpected error occurred.' });
    toast.error(unexpectedError);
  }
};

/**
 * Custom hook for managing sign-up form state and logic
 * Handles all three steps of the sign-up process: phone, verification, and user details
 */
export function useSignUpForms(): UseSignUpFormsReturn {
  const { isAuthenticated, user } = useNextAuth();
  const [currentStep, setCurrentStep] = useState<SignUpStep>('phone');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const router = useRouter();
  const searchParams = useSearchParams();
  const t = useTranslations();

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

  // State for resend cooldown
  const [resendCooldown, setResendCooldown] = useState(0);

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
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);


  // Phone submission handler
  const onPhoneSubmit = useCallback(async (data: SignUpPhoneFormData) => {
    setIsSubmitting(true);
    
    // Clear any previous errors
    clearFormErrors(phoneForm);

    try {
      const prepareResponse = await AuthService.signUpPrepare(data.phone);
      setPhoneNumber(prepareResponse.phoneNumber);
      setCurrentStep('verification');
      setResendCooldown(prepareResponse.waitingTime);
    } catch (error: unknown) {
      handleAuthError(error, phoneForm, t);
    } finally {
      setIsSubmitting(false);
    }
  }, [phoneForm, t]);

  // Verification submission handler
  const onVerificationSubmit = useCallback(async (data: VerificationFormData) => {
    setIsSubmitting(true);
    
    // Clear any previous errors
    clearFormErrors(verificationForm);

    try {
      // Verify OTP with backend (step 2 of sign-up process)
      const jwtToken = await AuthService.signUpVerify({
        phone: phoneNumber,
        otp: data.otp,
      });

      // Store the JWT token temporarily for profile completion
      // We can't create a NextAuth session yet because the user hasn't set a password
      // The profile completion page will handle creating the session after completion
      sessionStorage.setItem('signupToken', JSON.stringify(jwtToken));

      // OTP verified successfully, now user needs to complete profile
      verificationForm.reset();

      // NextAuth middleware will handle redirect to /profile/complete for NEW users
      router.push('/profile/complete');
    } catch (error: unknown) {
      handleAuthError(error, verificationForm, t);
    } finally {
      setIsSubmitting(false);
    }
  }, [phoneNumber, verificationForm, router, t]);

  // Resend OTP handler
  const handleResendOTP = useCallback(async () => {
    if (resendCooldown > 0) return;

    setIsSubmitting(true);

    try {
      const response = await AuthService.signUpPrepare(phoneNumber);
      setResendCooldown(response.waitingTime);
      toast.success(t('auth.verification.resendSuccess', {
        default: 'New verification code sent'
      }));
    } catch (error: unknown) {
      // For resend OTP, we don't have a specific form to set field errors on
      // So we'll handle it with toast messages only using helper function
      handleGenericError(error, t);
    } finally {
      setIsSubmitting(false);
    }
  }, [resendCooldown, phoneNumber, t]);

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