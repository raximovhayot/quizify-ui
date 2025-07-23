import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { AuthService } from '@/lib/auth-service';
import { BackendError } from '@/types/api';
import { handleAuthError, clearFormErrors } from '@/utils/auth-errors';
import {
  createSignUpPhoneSchema,
  createVerificationSchema,
  createUserDetailsSchema,
  SignUpPhoneFormData,
  VerificationFormData,
  UserDetailsFormData,
  signUpPhoneFormDefaults,
  verificationFormDefaults,
  userDetailsFormDefaults,
} from '@/schemas/auth';

export type SignUpStep = 'phone' | 'verification' | 'details' | 'completed';

/**
 * Custom hook for managing sign-up form state and logic
 * Handles all three steps of the sign-up process: phone, verification, and user details
 */
export function useSignUpForms() {
  const { isAuthenticated, setUserFromToken } = useAuth();
  const [currentStep, setCurrentStep] = useState<SignUpStep>('phone');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [resendCooldown, setResendCooldown] = useState(0);
  const router = useRouter();
  const searchParams = useSearchParams();
  const t = useTranslations();

  // Create validation schemas with localized messages
  const phoneSchema = createSignUpPhoneSchema(t);
  const verificationSchema = createVerificationSchema(t);
  const userDetailsSchema = createUserDetailsSchema(t);

  // Initialize forms with validation schemas
  const phoneForm = useForm<SignUpPhoneFormData>({
    resolver: zodResolver(phoneSchema),
    defaultValues: signUpPhoneFormDefaults,
  });

  const verificationForm = useForm<VerificationFormData>({
    resolver: zodResolver(verificationSchema),
    defaultValues: verificationFormDefaults,
  });

  const userDetailsForm = useForm<UserDetailsFormData>({
    resolver: zodResolver(userDetailsSchema),
    mode: 'onBlur', // Only validate when field loses focus, not on every keystroke
    defaultValues: userDetailsFormDefaults,
  });

  // Handle authentication redirect
  useEffect(() => {
    if (isAuthenticated) {
      const redirectTo = searchParams.get('redirect') || '/';
      router.push(redirectTo);
    }
  }, [isAuthenticated, router, searchParams]);

  // Countdown timer for resend button
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  // Phone submission handler
  const onPhoneSubmit = async (data: SignUpPhoneFormData) => {
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
  };

  // Verification submission handler
  const onVerificationSubmit = async (data: VerificationFormData) => {
    setIsSubmitting(true);
    
    // Clear any previous errors
    clearFormErrors(verificationForm);

    try {
      // Verify OTP with backend (step 2 of sign-up process)
      const jwtToken = await AuthService.signUpVerify({
        phone: phoneNumber,
        otp: data.otp,
      });

      // Store JWT token and user data (user is now signed in with NEW state)
      localStorage.setItem('accessToken', jwtToken.accessToken);
      localStorage.setItem('refreshToken', jwtToken.refreshToken);
      localStorage.setItem('user', JSON.stringify(jwtToken.user));

      // Also set cookies for middleware compatibility
      document.cookie = `user=${JSON.stringify(jwtToken.user)}; path=/; max-age=${7 * 24 * 60 * 60}`; // 7 days
      document.cookie = `accessToken=${jwtToken.accessToken}; path=/; max-age=${15 * 60}`; // 15 minutes
      document.cookie = `refreshToken=${jwtToken.refreshToken}; path=/; max-age=${7 * 24 * 60 * 60}`; // 7 days

      // Update AuthContext state immediately
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
  };

  // User details submission handler
  const onUserDetailsSubmit = async (data: UserDetailsFormData) => {
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
      document.cookie = `user=${JSON.stringify(updatedUser)}; path=/; max-age=${7 * 24 * 60 * 60}`; // 7 days

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

      // Redirect to dashboard after a short delay
      setTimeout(() => {
        router.push('/dashboard');
      }, 2000);
    } catch (error: unknown) {
      handleAuthError(error, userDetailsForm, t);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Resend OTP handler
  const handleResendOTP = async () => {
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
    userDetailsForm,
    
    // Handlers
    onPhoneSubmit: phoneForm.handleSubmit(onPhoneSubmit),
    onVerificationSubmit: verificationForm.handleSubmit(onVerificationSubmit),
    onUserDetailsSubmit: userDetailsForm.handleSubmit(onUserDetailsSubmit),
    handleResendOTP,
  };
}