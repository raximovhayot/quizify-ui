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
import { toast } from 'sonner';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

// Phone validation schema
const phoneSchema = z.object({
  phone: z.string()
    .min(1, 'Phone number is required')
    .regex(/^\+?[1-9]\d{1,14}$/, 'Please enter a valid phone number'),
});

// SMS verification schema
const verificationSchema = z.object({
  verificationCode: z.string()
    .min(1, 'Verification code is required')
    .length(6, 'Verification code must be 6 digits')
    .regex(/^\d{6}$/, 'Verification code must contain only numbers'),
});

// New password schema
const newPasswordSchema = z.object({
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
type NewPasswordFormData = z.infer<typeof newPasswordSchema>;

type ResetStep = 'phone' | 'verification' | 'new-password' | 'completed';

export default function ForgotPasswordPage() {
  const { isAuthenticated } = useAuth();
  const [currentStep, setCurrentStep] = useState<ResetStep>('phone');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [resendCooldown, setResendCooldown] = useState(0);
  const router = useRouter();
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

    try {
      // TODO: Replace with actual API call to send reset SMS
      console.log('Sending reset SMS to:', data.phone);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setPhoneNumber(data.phone);
      setCurrentStep('verification');
      setResendCooldown(60);
      toast.success('Verification code sent to your phone');
    } catch (error) {
      toast.error('Failed to send verification code. Please try again.');
      console.error('Send SMS error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const onVerificationSubmit = async (data: VerificationFormData) => {
    setIsSubmitting(true);

    try {
      // TODO: Replace with actual API call to verify reset code
      console.log('Verifying reset code:', data.verificationCode);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setCurrentStep('new-password');
      toast.success('Code verified successfully');
    } catch (error) {
      toast.error('Invalid verification code. Please try again.');
      console.error('Verification error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const onPasswordSubmit = async (data: NewPasswordFormData) => {
    setIsSubmitting(true);

    try {
      // TODO: Replace with actual API call to reset password
      console.log('Resetting password for:', phoneNumber);
      console.log('New password data:', data);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setCurrentStep('completed');
      toast.success('Password reset successfully');
      
      // Redirect to sign-in page after a short delay
      setTimeout(() => {
        router.push('/sign-in');
      }, 2000);
    } catch (error) {
      toast.error('Failed to reset password. Please try again.');
      console.error('Password reset error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendCode = async () => {
    if (resendCooldown > 0) return;

    try {
      // TODO: Replace with actual API call to resend SMS
      console.log('Resending reset SMS to:', phoneNumber);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setResendCooldown(60);
      toast.success('Verification code sent');
    } catch (error) {
      toast.error('Failed to resend code. Please try again.');
      console.error('Resend SMS error:', error);
    }
  };

  const renderPhoneStep = () => (
    <Card>
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center">
          Reset Password
        </CardTitle>
        <CardDescription className="text-center">
          Enter your phone number to receive a verification code
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <form onSubmit={phoneForm.handleSubmit(onPhoneSubmit)} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="phone" className="text-sm font-medium">
              {t('auth.phone')}
            </label>
            <Input
              id="phone"
              type="tel"
              placeholder="+998901234567"
              {...phoneForm.register('phone')}
              className={phoneForm.formState.errors.phone ? 'border-red-500' : ''}
            />
            {phoneForm.formState.errors.phone && (
              <p className="text-sm text-red-500">
                {phoneForm.formState.errors.phone.message}
              </p>
            )}
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <InlineLoading text="Sending Code..." />
            ) : (
              t('auth.sendCode')
            )}
          </Button>
        </form>

        <div className="text-center">
          <div className="text-sm text-muted-foreground">
            Remember your password?{' '}
            <Link href="/sign-in" className="text-primary hover:underline">
              {t('auth.signIn')}
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
          Verify Your Phone
        </CardTitle>
        <CardDescription className="text-center">
          We sent a verification code to {phoneNumber}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <form onSubmit={verificationForm.handleSubmit(onVerificationSubmit)} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="verificationCode" className="text-sm font-medium">
              {t('auth.verificationCode')}
            </label>
            <Input
              id="verificationCode"
              type="text"
              placeholder="123456"
              maxLength={6}
              {...verificationForm.register('verificationCode')}
              className={verificationForm.formState.errors.verificationCode ? 'border-red-500' : ''}
            />
            {verificationForm.formState.errors.verificationCode && (
              <p className="text-sm text-red-500">
                {verificationForm.formState.errors.verificationCode.message}
              </p>
            )}
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <InlineLoading text="Verifying..." />
            ) : (
              'Verify Code'
            )}
          </Button>
        </form>

        <div className="text-center space-y-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleResendCode}
            disabled={resendCooldown > 0}
          >
            {resendCooldown > 0 ? (
              `Resend code in ${resendCooldown}s`
            ) : (
              t('auth.resendCode')
            )}
          </Button>
          
          <div className="text-sm text-muted-foreground">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setCurrentStep('phone')}
            >
              ← Back to phone entry
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
          Set New Password
        </CardTitle>
        <CardDescription className="text-center">
          Create a new password for your account
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium">
              {t('auth.password')}
            </label>
            <Input
              id="password"
              type="password"
              {...passwordForm.register('password')}
              className={passwordForm.formState.errors.password ? 'border-red-500' : ''}
            />
            {passwordForm.formState.errors.password && (
              <p className="text-sm text-red-500">
                {passwordForm.formState.errors.password.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="confirmPassword" className="text-sm font-medium">
              {t('auth.confirmPassword')}
            </label>
            <Input
              id="confirmPassword"
              type="password"
              {...passwordForm.register('confirmPassword')}
              className={passwordForm.formState.errors.confirmPassword ? 'border-red-500' : ''}
            />
            {passwordForm.formState.errors.confirmPassword && (
              <p className="text-sm text-red-500">
                {passwordForm.formState.errors.confirmPassword.message}
              </p>
            )}
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <InlineLoading text="Resetting Password..." />
            ) : (
              'Reset Password'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );

  const renderCompletedStep = () => (
    <Card>
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center text-green-600">
          Password Reset!
        </CardTitle>
        <CardDescription className="text-center">
          Your password has been successfully reset. Redirecting to sign in...
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