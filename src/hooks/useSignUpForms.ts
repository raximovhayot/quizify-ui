import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useForm, UseFormReturn } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { AuthService } from '@/lib/auth-service';
import { BackendError } from '@/types/api';
import { handleAuthError, clearFormErrors } from '@/utils/auth-errors';
import { UserState } from '@/types/common';
import {
  createSignUpPhoneSchema,
  createUserDetailsSchema,
  SignUpPhoneFormData,
  VerificationFormData,
  UserDetailsFormData,
  signUpPhoneFormDefaults,
  userDetailsFormDefaults, 
  createVerificationSchema, 
  verificationFormDefaults,
} from '@/schemas/auth';

// Constants
const REDIRECT_DELAY_MS = 2000;
const COOKIE_MAX_AGE_USER = 7 * 24 * 60 * 60; // 7 days

export type SignUpStep = 'phone' | 'verification' | 'details' | 'completed';

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
  userDetailsForm: UseFormReturn<UserDetailsFormData>;
  
  // Handlers
  onPhoneSubmit: () => void;
  onVerificationSubmit: () => void;
  onUserDetailsSubmit: () => void;
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
  const { isAuthenticated, setUserFromToken, user } = useAuth();
  const [currentStep, setCurrentStep] = useState<SignUpStep>('phone');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const router = useRouter();
  const searchParams = useSearchParams();
  const t = useTranslations();
  
  // Ref for cleanup
  const redirectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Create validation schemas with localized messages
  const phoneSchema = createSignUpPhoneSchema(t);
  const userDetailsSchema = createUserDetailsSchema(t);

  // Initialize forms with validation schemas
  const phoneForm = useForm<SignUpPhoneFormData>({
    resolver: zodResolver(phoneSchema),
    defaultValues: signUpPhoneFormDefaults,
  });

  const userDetailsForm = useForm<UserDetailsFormData>({
    resolver: zodResolver(userDetailsSchema),
    mode: 'onBlur', // Only validate when field loses focus, not on every keystroke
    defaultValues: userDetailsFormDefaults,
  });

  // Create verification schema and form
  const verificationSchema = createVerificationSchema(t);
  const verificationForm = useForm<VerificationFormData>({
    resolver: zodResolver(verificationSchema),
    defaultValues: verificationFormDefaults,
  });

  // State for resend cooldown
  const [resendCooldown, setResendCooldown] = useState(0);

  // Handle NEW users who need to complete their profile
  useEffect(() => {
    if (isAuthenticated && user && user.state === UserState.NEW) {
      // User is authenticated but has NEW state, start at details step
      setCurrentStep('details');
    }
  }, [isAuthenticated, user]);

  // Handle authentication redirect for completed users
  useEffect(() => {
    if (isAuthenticated && user && user.state !== UserState.NEW) {
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

  // Cleanup effect to prevent memory leaks
  useEffect(() => {
    return () => {
      if (redirectTimeoutRef.current) {
        clearTimeout(redirectTimeoutRef.current);
      }
    };
  }, []);

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

      // Update AuthContext state and store tokens/user data
      setUserFromToken(jwtToken);

      // OTP verified successfully, proceed to profile completion
      setCurrentStep('details');
      verificationForm.reset();
      toast.success(t('auth.verification.success', { default: 'Phone number verified successfully' }));
    } catch (error: unknown) {
      handleAuthError(error, verificationForm, t);
    } finally {
      setIsSubmitting(false);
    }
  }, [phoneNumber, verificationForm, setUserFromToken, t]);

  // User details submission handler
  const onUserDetailsSubmit = useCallback(async (data: UserDetailsFormData) => {
    setIsSubmitting(true);
    
    // Clear any previous errors
    clearFormErrors(userDetailsForm);

    try {
      // Get access token from localStorage (user is already signed in)
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) {
        throw new Error('Access token not found. Please try signing up again.');
      }

      // Complete account profile (step 3 of sign-up process)
      const updatedUser = await AuthService.completeAccount({
        firstName: data.firstName,
        lastName: data.lastName,
        password: data.password,
        dashboardType: data.dashboardType,
      }, accessToken);

      // Update stored user data with completed profile
      localStorage.setItem('user', JSON.stringify(updatedUser));
      document.cookie = `user=${JSON.stringify(updatedUser)}; path=/; max-age=${COOKIE_MAX_AGE_USER}`;

      // Update AuthContext state with completed profile
      const storedAccessToken = localStorage.getItem('accessToken');
      const storedRefreshToken = localStorage.getItem('refreshToken');
      if (storedAccessToken && storedRefreshToken) {
        setUserFromToken({
          accessToken: storedAccessToken,
          refreshToken: storedRefreshToken,
          user: updatedUser
        });
      }

      setCurrentStep('completed');
      toast.success(t('auth.signUp.success.message', {
        default: 'Account created successfully! Welcome to Quizify!'
      }));

      // Redirect to dashboard after a short delay with proper cleanup
      redirectTimeoutRef.current = setTimeout(() => {
        router.push('/dashboard');
      }, REDIRECT_DELAY_MS);
    } catch (error: unknown) {
      handleAuthError(error, userDetailsForm, t);
    } finally {
      setIsSubmitting(false);
    }
  }, [userDetailsForm, setUserFromToken, router, t]);

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
    userDetailsForm,
    
    // Handlers
    onPhoneSubmit: phoneForm.handleSubmit(onPhoneSubmit),
    onVerificationSubmit: verificationForm.handleSubmit(onVerificationSubmit),
    onUserDetailsSubmit: userDetailsForm.handleSubmit(onUserDetailsSubmit),
    handleResendOTP,
  };
}