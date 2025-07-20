'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { AuthLayout } from '@/components/layouts/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { InlineLoading } from '@/components/ui/loading-spinner';
import { toast } from 'sonner';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { AuthService } from '@/lib/auth-service';

// Phone validation schema
const phoneSchema = z.object({
  phone: z.string()
    .min(1, 'Phone number is required')
    .regex(/^\+?[1-9]\d{1,14}$/, 'Please enter a valid phone number'),
});

// OTP verification schema
const verificationSchema = z.object({
  otp: z.string()
    .min(1, 'Verification code is required')
    .length(6, 'Verification code must be 6 digits')
    .regex(/^\d{6}$/, 'Verification code must contain only numbers'),
});

// User details schema
const userDetailsSchema = z.object({
  firstName: z.string()
    .min(1, 'First name is required')
    .min(2, 'First name must be at least 2 characters'),
  lastName: z.string()
    .min(1, 'Last name is required')
    .min(2, 'Last name must be at least 2 characters'),
  password: z.string()
    .min(1, 'Password is required')
    .min(6, 'Password must be at least 6 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  confirmPassword: z.string()
    .min(1, 'Please confirm your password'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type PhoneFormData = z.infer<typeof phoneSchema>;
type VerificationFormData = z.infer<typeof verificationSchema>;
type UserDetailsFormData = z.infer<typeof userDetailsSchema>;

type SignUpStep = 'phone' | 'verification' | 'details' | 'completed';

export default function SignUpPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [currentStep, setCurrentStep] = useState<SignUpStep>('phone');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [resendCooldown, setResendCooldown] = useState(0);
  const router = useRouter();
  const searchParams = useSearchParams();
  const t = useTranslations();

  const phoneForm = useForm<PhoneFormData>({
    resolver: zodResolver(phoneSchema),
    defaultValues: {
      phone: '',
    },
  });

  const verificationForm = useForm<VerificationFormData>({
    resolver: zodResolver(verificationSchema),
    defaultValues: {
      otp: '',
    },
  });

  const userDetailsForm = useForm<UserDetailsFormData>({
    resolver: zodResolver(userDetailsSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      password: '',
      confirmPassword: '',
    },
  });

  useEffect(() => {
    // If user is already authenticated, redirect them
    if (isAuthenticated && !authLoading) {
      const redirectTo = searchParams.get('redirect') || '/';
      router.push(redirectTo);
    }
  }, [isAuthenticated, authLoading, router, searchParams]);

  useEffect(() => {
    // Countdown timer for resend button
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const onPhoneSubmit = async (data: PhoneFormData) => {
    setIsSubmitting(true);

    try {
      await AuthService.signUpPrepare(data.phone);
      
      setPhoneNumber(data.phone);
      setCurrentStep('verification');
      setResendCooldown(60);
      toast.success('Verification code sent to your phone');
    } catch (error: unknown) {
      console.error('Phone verification error:', error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      
      if (errorMessage.includes('already exists')) {
        toast.error('An account with this phone number already exists. Please sign in instead.');
      } else {
        toast.error('Failed to send verification code. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const onVerificationSubmit = async () => {
    setCurrentStep('details');
    verificationForm.reset();
  };

  const onUserDetailsSubmit = async (data: UserDetailsFormData) => {
    setIsSubmitting(true);

    try {
      const verificationData = verificationForm.getValues();
      
      await AuthService.signUpVerify({
        phone: phoneNumber,
        otp: verificationData.otp,
        firstName: data.firstName,
        lastName: data.lastName,
        password: data.password,
      });

      setCurrentStep('completed');
      toast.success('Account created successfully! You can now sign in.');
      
      // Redirect to sign-in page after a short delay
      setTimeout(() => {
        router.push('/sign-in');
      }, 2000);
    } catch (error: unknown) {
      console.error('Sign-up error:', error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      
      if (errorMessage.includes('Invalid OTP')) {
        toast.error('Invalid verification code. Please check and try again.');
        setCurrentStep('verification');
      } else if (errorMessage.includes('OTP expired')) {
        toast.error('Verification code has expired. Please request a new one.');
        setCurrentStep('phone');
      } else {
        toast.error('Failed to create account. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendOTP = async () => {
    if (resendCooldown > 0) return;

    setIsSubmitting(true);
    try {
      await AuthService.signUpPrepare(phoneNumber);
      setResendCooldown(60);
      toast.success('New verification code sent');
    } catch (error: unknown) {
      console.error('Resend OTP error:', error);
      toast.error('Failed to resend verification code. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show loading state while checking authentication
  if (authLoading) {
    return (
      <AuthLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <InlineLoading />
        </div>
      </AuthLayout>
    );
  }

  // Don't render the form if user is already authenticated
  if (isAuthenticated) {
    return null;
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 'phone':
        return (
          <form onSubmit={phoneForm.handleSubmit(onPhoneSubmit)} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="phone" className="text-sm font-medium">
                {t('auth.phone.label', { default: 'Phone Number' })}
              </label>
              <Input
                id="phone"
                type="tel"
                placeholder={t('auth.phone.placeholder', { default: '+1234567890' })}
                {...phoneForm.register('phone')}
                disabled={isSubmitting}
                className={phoneForm.formState.errors.phone ? 'border-red-500' : ''}
              />
              {phoneForm.formState.errors.phone && (
                <p className="text-sm text-red-500">
                  {phoneForm.formState.errors.phone.message}
                </p>
              )}
            </div>

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <InlineLoading />
                  {t('auth.signUp.sendingCode', { default: 'Sending Code...' })}
                </>
              ) : (
                t('auth.signUp.sendCode', { default: 'Send Verification Code' })
              )}
            </Button>
          </form>
        );

      case 'verification':
        return (
          <form onSubmit={verificationForm.handleSubmit(onVerificationSubmit)} className="space-y-4">
            <div className="text-center mb-4">
              <p className="text-sm text-gray-600">
                {t('auth.verification.instruction', { 
                  default: 'Enter the 6-digit code sent to' 
                })} <strong>{phoneNumber}</strong>
              </p>
            </div>

            <div className="space-y-2">
              <label htmlFor="otp" className="text-sm font-medium">
                {t('auth.verification.label', { default: 'Verification Code' })}
              </label>
              <Input
                id="otp"
                type="text"
                placeholder="123456"
                maxLength={6}
                {...verificationForm.register('otp')}
                disabled={isSubmitting}
                className={verificationForm.formState.errors.otp ? 'border-red-500' : ''}
              />
              {verificationForm.formState.errors.otp && (
                <p className="text-sm text-red-500">
                  {verificationForm.formState.errors.otp.message}
                </p>
              )}
            </div>

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <InlineLoading />
                  {t('auth.verification.verifying', { default: 'Verifying...' })}
                </>
              ) : (
                t('auth.verification.verify', { default: 'Verify Code' })
              )}
            </Button>

            <div className="text-center">
              <Button
                type="button"
                variant="ghost"
                onClick={handleResendOTP}
                disabled={resendCooldown > 0 || isSubmitting}
                className="text-sm"
              >
                {resendCooldown > 0 
                  ? t('auth.verification.resendIn', { 
                      default: `Resend in ${resendCooldown}s`,
                      seconds: resendCooldown 
                    })
                  : t('auth.verification.resend', { default: 'Resend Code' })
                }
              </Button>
            </div>
          </form>
        );

      case 'details':
        return (
          <form onSubmit={userDetailsForm.handleSubmit(onUserDetailsSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="firstName" className="text-sm font-medium">
                  {t('auth.firstName.label', { default: 'First Name' })}
                </label>
                <Input
                  id="firstName"
                  type="text"
                  placeholder={t('auth.firstName.placeholder', { default: 'John' })}
                  {...userDetailsForm.register('firstName')}
                  disabled={isSubmitting}
                  className={userDetailsForm.formState.errors.firstName ? 'border-red-500' : ''}
                />
                {userDetailsForm.formState.errors.firstName && (
                  <p className="text-sm text-red-500">
                    {userDetailsForm.formState.errors.firstName.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label htmlFor="lastName" className="text-sm font-medium">
                  {t('auth.lastName.label', { default: 'Last Name' })}
                </label>
                <Input
                  id="lastName"
                  type="text"
                  placeholder={t('auth.lastName.placeholder', { default: 'Doe' })}
                  {...userDetailsForm.register('lastName')}
                  disabled={isSubmitting}
                  className={userDetailsForm.formState.errors.lastName ? 'border-red-500' : ''}
                />
                {userDetailsForm.formState.errors.lastName && (
                  <p className="text-sm text-red-500">
                    {userDetailsForm.formState.errors.lastName.message}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">
                {t('auth.password.label', { default: 'Password' })}
              </label>
              <Input
                id="password"
                type="password"
                placeholder={t('auth.password.placeholder', { default: 'Enter your password' })}
                {...userDetailsForm.register('password')}
                disabled={isSubmitting}
                className={userDetailsForm.formState.errors.password ? 'border-red-500' : ''}
              />
              {userDetailsForm.formState.errors.password && (
                <p className="text-sm text-red-500">
                  {userDetailsForm.formState.errors.password.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="text-sm font-medium">
                {t('auth.confirmPassword.label', { default: 'Confirm Password' })}
              </label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder={t('auth.confirmPassword.placeholder', { default: 'Confirm your password' })}
                {...userDetailsForm.register('confirmPassword')}
                disabled={isSubmitting}
                className={userDetailsForm.formState.errors.confirmPassword ? 'border-red-500' : ''}
              />
              {userDetailsForm.formState.errors.confirmPassword && (
                <p className="text-sm text-red-500">
                  {userDetailsForm.formState.errors.confirmPassword.message}
                </p>
              )}
            </div>

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <InlineLoading />
                  {t('auth.signUp.creating', { default: 'Creating Account...' })}
                </>
              ) : (
                t('auth.signUp.create', { default: 'Create Account' })
              )}
            </Button>
          </form>
        );

      case 'completed':
        return (
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-green-600">
              {t('auth.signUp.success.title', { default: 'Account Created Successfully!' })}
            </h3>
            <p className="text-gray-600">
              {t('auth.signUp.success.message', { 
                default: 'Your account has been created. You will be redirected to the sign-in page shortly.' 
              })}
            </p>
            <InlineLoading />
          </div>
        );

      default:
        return null;
    }
  };

  const getStepTitle = () => {
    switch (currentStep) {
      case 'phone':
        return t('auth.signUp.phone.title', { default: 'Sign Up' });
      case 'verification':
        return t('auth.signUp.verification.title', { default: 'Verify Phone Number' });
      case 'details':
        return t('auth.signUp.details.title', { default: 'Complete Your Profile' });
      case 'completed':
        return t('auth.signUp.completed.title', { default: 'Welcome!' });
      default:
        return 'Sign Up';
    }
  };

  const getStepDescription = () => {
    switch (currentStep) {
      case 'phone':
        return t('auth.signUp.phone.description', { 
          default: 'Enter your phone number to get started' 
        });
      case 'verification':
        return t('auth.signUp.verification.description', { 
          default: 'We sent a verification code to your phone' 
        });
      case 'details':
        return t('auth.signUp.details.description', { 
          default: 'Tell us a bit about yourself' 
        });
      case 'completed':
        return t('auth.signUp.completed.description', { 
          default: 'Your account is ready to use' 
        });
      default:
        return '';
    }
  };

  return (
    <AuthLayout>
      <div className="container mx-auto px-4 py-8 max-w-md">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">
              {getStepTitle()}
            </CardTitle>
            <CardDescription>
              {getStepDescription()}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {renderStepContent()}

            {currentStep === 'phone' && (
              <div className="mt-6 text-center text-sm text-gray-600">
                {t('auth.signIn.prompt', { default: 'Already have an account?' })}{' '}
                <Link
                  href="/sign-in"
                  className="text-blue-600 hover:text-blue-800 underline font-medium"
                >
                  {t('auth.signIn.link', { default: 'Sign in' })}
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AuthLayout>
  );
}