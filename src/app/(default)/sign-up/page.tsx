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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { toast } from 'sonner';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { AuthService } from '@/lib/auth-service';
import { BackendError } from '@/types/api';
import { DashboardType } from '@/types/auth';

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

  // Phone validation schema with localized messages
  const phoneSchema = z.object({
    phone: z.string()
      .min(1, t('auth.validation.phoneRequired'))
      .regex(/^\+998(90|91|93|94|95|97|98|99|77|88|33|55|61|62|65|66|67|69|71|73|74|75|76|78|79)[0-9]{7}$/, t('auth.validation.phoneInvalid')),
  });

  // OTP verification schema with localized messages
  const verificationSchema = z.object({
    otp: z.string()
      .min(1, t('auth.validation.otpRequired'))
      .length(6, t('auth.validation.otpLength'))
      .regex(/^\d{6}$/, t('auth.validation.otpPattern')),
  });

  // User details schema with localized messages
  const userDetailsSchema = z.object({
    firstName: z.string()
      .min(1, t('auth.validation.firstNameRequired'))
      .min(2, t('auth.validation.firstNameMinLength')),
    lastName: z.string()
      .min(1, t('auth.validation.lastNameRequired'))
      .min(2, t('auth.validation.lastNameMinLength')),
    password: z.string()
      .min(1, t('auth.validation.passwordRequired'))
      .min(6, t('auth.validation.passwordMinLength'))
      .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/, t('auth.validation.passwordPattern')),
    confirmPassword: z.string()
      .min(1, t('auth.validation.confirmPasswordRequired')),
    dashboardType: z.nativeEnum(DashboardType, {
      required_error: t('auth.validation.dashboardTypeRequired', { default: 'Please select your role' }),
    }),
  }).refine((data) => data.password === data.confirmPassword, {
    message: t('auth.validation.passwordsNotMatch'),
    path: ["confirmPassword"],
  });

  type PhoneFormData = z.infer<typeof phoneSchema>;
  type VerificationFormData = z.infer<typeof verificationSchema>;
  type UserDetailsFormData = z.infer<typeof userDetailsSchema>;

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
    mode: 'onBlur', // Only validate when field loses focus, not on every keystroke
    defaultValues: {
      firstName: '',
      lastName: '',
      password: '',
      confirmPassword: '',
      dashboardType: DashboardType.STUDENT, // Default to student
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
      const prepareResponse = await AuthService.signUpPrepare(data.phone);
      setPhoneNumber(prepareResponse.phoneNumber);
      setCurrentStep('verification');
      setResendCooldown(prepareResponse.waitingTime);
    } catch (error: unknown) {
      if (error instanceof BackendError) {
        const firstError = error.getFirstError();
        if (firstError) {
          toast.error(firstError.message);
        } else {
          // If no specific error message from backend, use generic message
          const genericError = t('common.unexpectedError', {default: 'An unexpected error occurred.'});
          toast.error(genericError);
        }
      } else {
        const unExpectedError = t('common.unexpectedError', {default: 'An unexpected error occurred.'});
        toast.error(unExpectedError);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const onVerificationSubmit = async (data: VerificationFormData) => {
    setIsSubmitting(true);

    try {
      // Verify OTP with backend (step 2 of sign-up process)
      await AuthService.signUpVerify({
        phone: phoneNumber,
        otp: data.otp,
      });

      // OTP verified successfully, proceed to profile completion
      setCurrentStep('details');
      verificationForm.reset();
      toast.success(t('auth.verification.success', { default: 'Phone number verified successfully' }));
    } catch (error: unknown) {
      if (error instanceof BackendError) {
        const firstError = error.getFirstError();
        if (firstError) {
          toast.error(firstError.message);
        } else {
          // If no specific error message from backend, use generic message
          const genericError = t('common.unexpectedError', {default: 'An unexpected error occurred.'});
          toast.error(genericError);
        }
      } else {
        const unExpectedError = t('common.unexpectedError', {default: 'An unexpected error occurred.'});
        toast.error(unExpectedError);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const onUserDetailsSubmit = async (data: UserDetailsFormData) => {
    setIsSubmitting(true);

    try {
      // Complete account profile (step 3 of sign-up process)
      await AuthService.completeAccount({
        firstName: data.firstName,
        lastName: data.lastName,
        password: data.password,
        dashboardType: data.dashboardType,
      });

      setCurrentStep('completed');
      toast.success(t('auth.signUp.success.message', {
        default: 'Account created successfully! You can now sign in.'
      }));

      // Redirect to sign-in page after a short delay
      setTimeout(() => {
        router.push('/sign-in');
      }, 2000);
    } catch (error: unknown) {
      if (error instanceof BackendError) {
        const firstError = error.getFirstError();
        if (firstError) {
          toast.error(firstError.message);
        } else {
          // If no specific error message from backend, use generic message
          const genericError = t('common.unexpectedError', {default: 'An unexpected error occurred.'});
          toast.error(genericError);
        }
      } else {
        const unExpectedError = t('common.unexpectedError', {default: 'An unexpected error occurred.'});
        toast.error(unExpectedError);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendOTP = async () => {
    if (resendCooldown > 0) return;

    setIsSubmitting(true);

    try {
      const response = await AuthService.signUpPrepare(phoneNumber);
      console.log(response);
      setResendCooldown(response.otpValidityPeriod);
      toast.success(t('auth.verification.resendSuccess', {
        default: 'New verification code sent'
      }));
    } catch (error: unknown) {
      if (error instanceof BackendError) {
        const firstError = error.getFirstError();
        if (firstError) {
          toast.error(firstError.message);
        } else {
          // If no specific error message from backend, use generic message
          const genericError = t('common.unexpectedError', {default: 'An unexpected error occurred.'});
          toast.error(genericError);
        }
      } else {
        const unExpectedError = t('common.unexpectedError', {default: 'An unexpected error occurred.'});
        toast.error(unExpectedError);
      }
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
          <Form {...phoneForm}>
            <form onSubmit={phoneForm.handleSubmit(onPhoneSubmit)} className="space-y-4">
              <FormField
                control={phoneForm.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {t('auth.phone.label', { default: 'Phone Number' })}
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="tel"
                        placeholder={t('auth.phone.placeholder', { default: '+1234567890' })}
                        disabled={isSubmitting}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

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
          </Form>
        );

      case 'verification':
        return (
          <Form {...verificationForm}>
            <form onSubmit={verificationForm.handleSubmit(onVerificationSubmit)} className="space-y-4">
              <div className="text-center mb-4">
                <p className="text-sm text-gray-600">
                  {t('auth.verification.instruction', {
                    default: 'Enter the 6-digit code sent to'
                  })} <strong>{phoneNumber}</strong>
                </p>
              </div>

              <FormField
                control={verificationForm.control}
                name="otp"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {t('auth.verification.label', { default: 'Verification Code' })}
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="text"
                        placeholder="123456"
                        maxLength={6}
                        disabled={isSubmitting}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

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
          </Form>
        );

      case 'details':
        return (
          <Form {...userDetailsForm}>
            <form onSubmit={userDetailsForm.handleSubmit(onUserDetailsSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={userDetailsForm.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {t('auth.firstName.label', { default: 'First Name' })}
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="text"
                          placeholder={t('auth.firstName.placeholder', { default: 'John' })}
                          disabled={isSubmitting}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={userDetailsForm.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {t('auth.lastName.label', { default: 'Last Name' })}
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="text"
                          placeholder={t('auth.lastName.placeholder', { default: 'Doe' })}
                          disabled={isSubmitting}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={userDetailsForm.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {t('auth.password.label', { default: 'Password' })}
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder={t('auth.password.placeholder', { default: 'Enter your password' })}
                        disabled={isSubmitting}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={userDetailsForm.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {t('auth.confirmPassword.label', { default: 'Confirm Password' })}
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder={t('auth.confirmPassword.placeholder', { default: 'Confirm your password' })}
                        disabled={isSubmitting}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={userDetailsForm.control}
                name="dashboardType"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel>
                      {t('auth.dashboardType.label', { default: 'I am a' })}
                    </FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex flex-col space-y-1"
                        disabled={isSubmitting}
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value={DashboardType.STUDENT} id="student" />
                          <label htmlFor="student" className="text-sm font-normal cursor-pointer">
                            {t('auth.dashboardType.student', { default: 'Student' })}
                          </label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value={DashboardType.INSTRUCTOR} id="instructor" />
                          <label htmlFor="instructor" className="text-sm font-normal cursor-pointer">
                            {t('auth.dashboardType.instructor', { default: 'Instructor' })}
                          </label>
                        </div>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

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
          </Form>
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
              <div className="mt-6 text-center">
                <div className="text-sm text-muted-foreground">
                  {t('auth.signIn.prompt', { default: 'Already have an account?' })}{' '}
                  <Link
                    href="/sign-in"
                    className="text-primary hover:underline"
                  >
                    {t('auth.signIn.link', { default: 'Sign in' })}
                  </Link>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AuthLayout>
  );
}