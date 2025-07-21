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

type ResetStep = 'phone' | 'verification' | 'new-password' | 'completed';

export default function ForgotPasswordPage() {
  const { isAuthenticated } = useAuth();
  const [currentStep, setCurrentStep] = useState<ResetStep>('phone');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [resendCooldown, setResendCooldown] = useState(0);
  const [authError, setAuthError] = useState<string | null>(null);
  const router = useRouter();
  const t = useTranslations();

  // Phone validation schema with localized messages
  const phoneSchema = z.object({
    phone: z.string()
      .min(1, t('auth.validation.phoneRequired'))
      .regex(/^(?:\+?998|0)?\d{9}$/, t('auth.validation.phoneInvalid')),
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
      .min(6, t('auth.validation.passwordMinLength'))
      .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, t('auth.validation.passwordPattern')),
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
    if (isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, router]);

  useEffect(() => {
    // Countdown timer for resend button
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const onPhoneSubmit = async (data: PhoneFormData) => {
    setIsSubmitting(true);
    setAuthError(null); // Clear previous errors

    try {
      await AuthService.forgotPasswordPrepare(data.phone);
      
      setPhoneNumber(data.phone);
      setCurrentStep('verification');
      setResendCooldown(60);
      toast.success(t('auth.forgotPassword.codeSent', { 
        default: 'Verification code sent to your phone' 
      }));
    } catch (error: unknown) {
      console.error('Forgot password prepare error:', error);
      
      // Handle different error types
      const errorMessage = error instanceof Error ? error.message : String(error);
      let translatedError: string;
      
      // Check for specific error patterns
      if (errorMessage.includes('User not found') || 
          errorMessage.includes('Account not found') ||
          errorMessage.includes('Phone number not registered')) {
        translatedError = t('auth.errors.accountNotFound', { 
          default: 'Account not found. Please check your phone number or sign up.' 
        });
      } else if (errorMessage.includes('Invalid phone') || 
                 errorMessage.includes('Phone number invalid')) {
        translatedError = t('auth.errors.phoneInvalid', { 
          default: 'Please enter a valid phone number.' 
        });
      } else if (errorMessage.includes('Rate limit') || 
                 errorMessage.includes('Too many requests')) {
        translatedError = t('auth.errors.rateLimitExceeded', { 
          default: 'Too many requests. Please wait before requesting another code.' 
        });
      } else if (errorMessage.includes('Network') || errorMessage.includes('NETWORK_ERROR')) {
        translatedError = t('auth.errors.networkError', { 
          default: 'Network error. Please check your connection and try again.' 
        });
      } else {
        translatedError = t('auth.errors.sendCodeFailed', { 
          default: 'Failed to send verification code. Please try again.' 
        });
      }
      
      setAuthError(translatedError);
      toast.error(translatedError);
    } finally {
      setIsSubmitting(false);
    }
  };

  const onVerificationSubmit = async (data: VerificationFormData) => {
    setIsSubmitting(true);
    setAuthError(null); // Clear previous errors

    try {
      await AuthService.forgotPasswordVerify(phoneNumber, data.verificationCode);
      
      setCurrentStep('new-password');
      toast.success(t('auth.verification.success', { 
        default: 'Code verified successfully' 
      }));
    } catch (error: unknown) {
      console.error('Forgot password verify error:', error);
      
      // Handle different error types
      const errorMessage = error instanceof Error ? error.message : String(error);
      let translatedError: string;
      
      // Check for specific error patterns
      if (errorMessage.includes('Invalid OTP') || 
          errorMessage.includes('Invalid verification code') ||
          errorMessage.includes('Incorrect code')) {
        translatedError = t('auth.errors.invalidOTP', { 
          default: 'Invalid verification code. Please check and try again.' 
        });
      } else if (errorMessage.includes('OTP expired') || 
                 errorMessage.includes('Code expired') ||
                 errorMessage.includes('Verification code expired')) {
        translatedError = t('auth.errors.otpExpired', { 
          default: 'Verification code has expired. Please request a new one.' 
        });
        setCurrentStep('phone'); // Go back to phone step
      } else if (errorMessage.includes('Network') || errorMessage.includes('NETWORK_ERROR')) {
        translatedError = t('auth.errors.networkError', { 
          default: 'Network error. Please check your connection and try again.' 
        });
      } else {
        translatedError = t('auth.errors.verificationFailed', { 
          default: 'Verification failed. Please try again.' 
        });
      }
      
      setAuthError(translatedError);
      toast.error(translatedError);
    } finally {
      setIsSubmitting(false);
    }
  };

  const onPasswordSubmit = async (data: NewPasswordFormData) => {
    setIsSubmitting(true);
    setAuthError(null); // Clear previous errors

    try {
      // Note: In a real implementation, you would get the verification token from the previous step
      // For now, we'll use a placeholder token - this should be stored from the verification step
      const verificationToken = 'placeholder-token'; // This should come from forgotPasswordVerify response
      
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
      console.error('Password reset error:', error);
      
      // Handle different error types
      const errorMessage = error instanceof Error ? error.message : String(error);
      let translatedError: string;
      
      // Check for specific error patterns
      if (errorMessage.includes('Invalid token') || 
          errorMessage.includes('Token expired') ||
          errorMessage.includes('Invalid verification token')) {
        translatedError = t('auth.errors.invalidResetToken', { 
          default: 'Invalid or expired reset token. Please start the process again.' 
        });
        setCurrentStep('phone'); // Go back to phone step
      } else if (errorMessage.includes('Password') && errorMessage.includes('weak')) {
        translatedError = t('auth.errors.passwordWeak', { 
          default: 'Password is too weak. Please choose a stronger password.' 
        });
      } else if (errorMessage.includes('Network') || errorMessage.includes('NETWORK_ERROR')) {
        translatedError = t('auth.errors.networkError', { 
          default: 'Network error. Please check your connection and try again.' 
        });
      } else {
        translatedError = t('auth.errors.resetPasswordFailed', { 
          default: 'Failed to reset password. Please try again.' 
        });
      }
      
      setAuthError(translatedError);
      toast.error(translatedError);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendCode = async () => {
    if (resendCooldown > 0) return;

    setIsSubmitting(true);
    setAuthError(null); // Clear previous errors
    
    try {
      await AuthService.forgotPasswordPrepare(phoneNumber);
      setResendCooldown(60);
      toast.success(t('auth.verification.resendSuccess', { 
        default: 'New verification code sent' 
      }));
    } catch (error: unknown) {
      console.error('Resend code error:', error);
      
      // Handle different error types
      const errorMessage = error instanceof Error ? error.message : String(error);
      let translatedError: string;
      
      if (errorMessage.includes('Rate limit') || 
          errorMessage.includes('Too many requests')) {
        translatedError = t('auth.errors.rateLimitExceeded', { 
          default: 'Too many requests. Please wait before requesting another code.' 
        });
      } else if (errorMessage.includes('Network') || errorMessage.includes('NETWORK_ERROR')) {
        translatedError = t('auth.errors.networkError', { 
          default: 'Network error. Please check your connection and try again.' 
        });
      } else {
        translatedError = t('auth.errors.resendFailed', { 
          default: 'Failed to resend verification code. Please try again.' 
        });
      }
      
      setAuthError(translatedError);
      toast.error(translatedError);
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
            {authError && (
              <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
                {authError}
              </div>
            )}
            <FormField
              control={phoneForm.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {t('auth.phone')}
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
            {authError && (
              <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
                {authError}
              </div>
            )}
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
            {authError && (
              <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
                {authError}
              </div>
            )}
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

  return (
    <AuthLayout title="Quizify">
      {currentStep === 'phone' && renderPhoneStep()}
      {currentStep === 'verification' && renderVerificationStep()}
      {currentStep === 'new-password' && renderNewPasswordStep()}
      {currentStep === 'completed' && renderCompletedStep()}
    </AuthLayout>
  );
}