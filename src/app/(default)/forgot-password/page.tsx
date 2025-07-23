'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { AuthLayout } from '@/components/layouts/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { InlineLoading } from '@/components/ui/loading-spinner';
import { PHONE_REGEX, PASSWORD_REGEX, PASSWORD_MIN_LENGTH } from '@/constants/validation';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { toast } from 'sonner';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { AuthService } from '@/lib/auth-service';
import { BackendError } from '@/types/api';

type ResetStep = 'phone' | 'verification' | 'new-password' | 'completed';

export default function ForgotPasswordPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [currentStep, setCurrentStep] = useState<ResetStep>('phone');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [verificationToken, setVerificationToken] = useState<string>('');
  const [resendCooldown, setResendCooldown] = useState(0);
  const router = useRouter();
  const t = useTranslations();

  // Phone validation schema with localized messages
  const phoneSchema = z.object({
    phone: z.string()
      .min(1, t('auth.validation.phoneRequired'))
      .regex(PHONE_REGEX, t('auth.validation.phoneInvalid')),
  });

  // SMS verification schema with localized messages
  const verificationSchema = z.object({
    verificationCode: z.string()
      .min(1, t('auth.validation.otpRequired'))
      .length(6, t('auth.validation.otpLength'))
      .regex(/^\d{6}$/, t('auth.validation.otpPattern')),
  });

  // New password schema with localized messages
  const newPasswordSchema = z.object({
    password: z.string()
      .min(1, t('auth.validation.passwordRequired'))
      .min(PASSWORD_MIN_LENGTH, t('auth.validation.passwordMinLength'))
      .regex(PASSWORD_REGEX, t('auth.validation.passwordPattern')),
    confirmPassword: z.string()
      .min(1, t('auth.validation.confirmPasswordRequired')),
  }).refine((data) => data.password === data.confirmPassword, {
    message: t('auth.validation.passwordsNotMatch'),
    path: ["confirmPassword"],
  });

  type PhoneFormData = z.infer<typeof phoneSchema>;
  type VerificationFormData = z.infer<typeof verificationSchema>;
  type NewPasswordFormData = z.infer<typeof newPasswordSchema>;

  const phoneForm = useForm<PhoneFormData>({
    resolver: zodResolver(phoneSchema),
    defaultValues: {
      phone: '',
    },
  });

  const verificationForm = useForm<VerificationFormData>({
    resolver: zodResolver(verificationSchema),
    defaultValues: {
      verificationCode: '',
    },
  });

  const passwordForm = useForm<NewPasswordFormData>({
    resolver: zodResolver(newPasswordSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  });

  useEffect(() => {
    // If user is already authenticated, redirect them
    if (isAuthenticated && !authLoading) {
      router.push('/');
    }
  }, [isAuthenticated, authLoading, router]);

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
      await AuthService.forgotPasswordPrepare(data.phone);
      
      setPhoneNumber(data.phone);
      setCurrentStep('verification');
      setResendCooldown(60);
      toast.success(t('auth.forgotPassword.codeSent', { 
        default: 'Verification code sent to your phone' 
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
        const unexpectedError = t('common.unexpectedError', {default: 'An unexpected error occurred.'});
        toast.error(unexpectedError);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const onVerificationSubmit = async (data: VerificationFormData) => {
    setIsSubmitting(true);

    try {
      const response = await AuthService.forgotPasswordVerify(phoneNumber, data.verificationCode);
      
      // Store the verification token for the next step
      setVerificationToken(response.verificationToken);
      setCurrentStep('new-password');
      toast.success(t('auth.verification.success', { 
        default: 'Code verified successfully' 
      }));
    } catch (error: unknown) {
      if (error instanceof BackendError) {
        const firstError = error.getFirstError();
        if (firstError) {
          toast.error(firstError.message);
          
          // Handle specific error cases
          if (firstError.message.includes('expired')) {
            setCurrentStep('phone'); // Go back to phone step if code expired
          }
        } else {
          // If no specific error message from backend, use generic message
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

  const onPasswordSubmit = async (data: NewPasswordFormData) => {
    setIsSubmitting(true);

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
      if (error instanceof BackendError) {
        const firstError = error.getFirstError();
        if (firstError) {
          toast.error(firstError.message);
          
          // Handle specific error cases
          if (firstError.message.includes('token') && (firstError.message.includes('invalid') || firstError.message.includes('expired'))) {
            setCurrentStep('phone'); // Go back to phone step if token is invalid/expired
          }
        } else {
          // If no specific error message from backend, use generic message
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

  const handleResendCode = async () => {
    if (resendCooldown > 0) return;

    setIsSubmitting(true);
    
    try {
      await AuthService.forgotPasswordPrepare(phoneNumber);
      setResendCooldown(60);
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
        const unexpectedError = t('common.unexpectedError', {default: 'An unexpected error occurred.'});
        toast.error(unexpectedError);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderPhoneStep = () => (
    <Card>
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center">
          {t('auth.forgotPassword.phone.title', { default: 'Reset Password' })}
        </CardTitle>
        <CardDescription className="text-center">
          {t('auth.forgotPassword.phone.description', { 
            default: 'Enter your phone number to receive a verification code' 
          })}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <Form {...phoneForm}>
          <form onSubmit={phoneForm.handleSubmit(onPhoneSubmit)} className="space-y-4">
            <FormField
              control={phoneForm.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {t('auth.phone.label')}
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="tel"
                      placeholder="+998901234567"
                      disabled={isSubmitting}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              className="w-full"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <InlineLoading />
                  {t('auth.forgotPassword.sendingCode', { default: 'Sending Code...' })}
                </>
              ) : (
                t('auth.forgotPassword.sendCode', { default: 'Send Verification Code' })
              )}
            </Button>
          </form>
        </Form>

        <div className="text-center">
          <div className="text-sm text-muted-foreground">
            {t('auth.forgotPassword.rememberPassword', { default: 'Remember your password?' })}{' '}
            <Link href="/sign-in" className="text-primary hover:underline">
              {t('auth.signIn.link', { default: 'Sign In' })}
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderVerificationStep = () => (
    <Card>
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center">
          {t('auth.forgotPassword.verification.title', { default: 'Verify Code' })}
        </CardTitle>
        <CardDescription className="text-center">
          {t('auth.forgotPassword.verification.description', { 
            default: 'Enter the verification code sent to your phone' 
          })}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <Form {...verificationForm}>
          <form onSubmit={verificationForm.handleSubmit(onVerificationSubmit)} className="space-y-4">
            <FormField
              control={verificationForm.control}
              name="verificationCode"
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

            <Button
              type="submit"
              className="w-full"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <InlineLoading />
                  {t('auth.forgotPassword.verifying', { default: 'Verifying...' })}
                </>
              ) : (
                t('auth.forgotPassword.verifyCode', { default: 'Verify Code' })
              )}
            </Button>
          </form>
        </Form>

        <div className="text-center space-y-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleResendCode}
            disabled={resendCooldown > 0}
          >
            {resendCooldown > 0 ? (
              t('auth.verification.resendIn', { 
                default: `Resend in ${resendCooldown}s`,
                seconds: resendCooldown 
              })
            ) : (
              t('auth.verification.resend', { default: 'Resend Code' })
            )}
          </Button>
          
          <div className="text-sm text-muted-foreground">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setCurrentStep('phone')}
            >
              {t('auth.forgotPassword.backToPhone', { default: '← Back to phone entry' })}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderNewPasswordStep = () => (
    <Card>
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center">
          {t('auth.forgotPassword.newPassword.title', { default: 'Set New Password' })}
        </CardTitle>
        <CardDescription className="text-center">
          {t('auth.forgotPassword.newPassword.description', { 
            default: 'Create a new password for your account' 
          })}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <Form {...passwordForm}>
          <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
            <FormField
              control={passwordForm.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {t('auth.password.label', { default: 'Password' })}
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      disabled={isSubmitting}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={passwordForm.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {t('auth.confirmPassword.label', { default: 'Confirm Password' })}
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      disabled={isSubmitting}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              className="w-full"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <InlineLoading />
                  {t('auth.forgotPassword.resetting', { default: 'Resetting Password...' })}
                </>
              ) : (
                t('auth.forgotPassword.resetPassword', { default: 'Reset Password' })
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );

  const renderCompletedStep = () => (
    <Card>
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center text-green-600">
          {t('auth.forgotPassword.completed.title', { default: 'Password Reset Complete' })}
        </CardTitle>
        <CardDescription className="text-center">
          {t('auth.forgotPassword.completed.description', { 
            default: 'Your password has been successfully reset' 
          })}
        </CardDescription>
      </CardHeader>

      <CardContent className="text-center py-6">
        <InlineLoading text="Redirecting..." />
      </CardContent>
    </Card>
  );

  // Show loading state while checking authentication
  if (authLoading) {
    return (
      <AuthLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <InlineLoading/>
        </div>
      </AuthLayout>
    );
  }

  // Don't render the form if user is already authenticated
  if (isAuthenticated) {
    return null;
  }

  return (
    <AuthLayout>
      <div className="container mx-auto px-4 py-8 max-w-md">
        {currentStep === 'phone' && renderPhoneStep()}
        {currentStep === 'verification' && renderVerificationStep()}
        {currentStep === 'new-password' && renderNewPasswordStep()}
        {currentStep === 'completed' && renderCompletedStep()}
      </div>
    </AuthLayout>
  );
}