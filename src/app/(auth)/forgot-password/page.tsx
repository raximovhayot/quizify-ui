'use client';

import { useTranslations } from 'next-intl';
import { AuthLayout } from '@/components/shared/layouts/AppLayout';
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
import Link from 'next/link';
import { useForgotPasswordForm } from '@/components/features/auth/hooks/useForgotPasswordForm';

export default function ForgotPasswordPage() {
  const t = useTranslations();
  const {
    currentStep,
    isSubmitting,
    resendCooldown,
    phoneForm,
    verificationForm,
    newPasswordForm,
    onPhoneSubmit,
    onVerificationSubmit,
    onNewPasswordSubmit,
    handleResendOTP,
  } = useForgotPasswordForm();

  const renderPhoneStep = () => (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle>{t('auth.forgotPassword.title', { default: 'Reset Password' })}</CardTitle>
        <CardDescription>
          {t('auth.forgotPassword.description', { 
            default: 'Enter your phone number to receive a verification code' 
          })}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...phoneForm}>
          <form onSubmit={onPhoneSubmit} className="space-y-4">
            <FormField
              control={phoneForm.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('auth.phone.label', { default: 'Phone Number' })}</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="tel"
                      placeholder="+998901234567"
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? (
                <InlineLoading text={t('common.sending', { default: 'Sending...' })} />
              ) : (
                t('auth.forgotPassword.sendCode', { default: 'Send Verification Code' })
              )}
            </Button>
          </form>
        </Form>
        <div className="mt-4 text-center">
          <Link href="/sign-in" className="text-sm text-muted-foreground hover:underline">
            {t('auth.backToSignIn', { default: 'Back to Sign In' })}
          </Link>
        </div>
      </CardContent>
    </Card>
  );

  const renderVerificationStep = () => (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle>{t('auth.verification.title', { default: 'Verify Your Phone' })}</CardTitle>
        <CardDescription>
          {t('auth.verification.description', { 
            default: 'Enter the 6-digit code sent to your phone'
          })}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...verificationForm}>
          <form onSubmit={onVerificationSubmit} className="space-y-4" key={`verification-${currentStep}`}>
            <FormField
              control={verificationForm.control}
              name="otp"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('auth.verificationCode', { default: 'Verification Code' })}</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="text"
                      name="otp-code"
                      placeholder="123456"
                      maxLength={6}
                      disabled={isSubmitting}
                      className="text-center text-lg tracking-widest"
                      autoComplete="one-time-code"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      data-lpignore="true"
                      data-form-type="other"
                      onFocus={(e) => {
                        // Clear field on focus to ensure it's editable
                        if (e.target.value && e.target.value.length > 6) {
                          e.target.value = '';
                          field.onChange('');
                        }
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? (
                <InlineLoading text={t('common.verifying', { default: 'Verifying...' })} />
              ) : (
                t('auth.verification.verify', { default: 'Verify Code' })
              )}
            </Button>
          </form>
        </Form>
        <div className="mt-4 text-center space-y-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleResendOTP}
            disabled={resendCooldown > 0 || isSubmitting}
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
      </CardContent>
    </Card>
  );

  const renderNewPasswordStep = () => (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle>{t('auth.forgotPassword.newPassword.title', { default: 'Set New Password' })}</CardTitle>
        <CardDescription>
          {t('auth.forgotPassword.newPassword.description', { 
            default: 'Enter your new password' 
          })}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...newPasswordForm}>
          <form onSubmit={onNewPasswordSubmit} className="space-y-4">
            <FormField
              control={newPasswordForm.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('auth.newPassword', { default: 'New Password' })}</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="password"
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={newPasswordForm.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('auth.confirmPassword', { default: 'Confirm Password' })}</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="password"
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? (
                <InlineLoading text={t('common.updating', { default: 'Updating...' })} />
              ) : (
                t('auth.forgotPassword.updatePassword', { default: 'Update Password' })
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );

  const renderCompletedStep = () => (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="text-green-600">
          {t('auth.forgotPassword.success.title', { default: 'Password Reset Complete' })}
        </CardTitle>
        <CardDescription>
          {t('auth.forgotPassword.success.description', { 
            default: 'Your password has been successfully reset. You will be redirected to the sign-in page shortly.' 
          })}
        </CardDescription>
      </CardHeader>
      <CardContent className="text-center">
        <Link href="/sign-in">
          <Button className="w-full">
            {t('auth.goToSignIn', { default: 'Go to Sign In' })}
          </Button>
        </Link>
      </CardContent>
    </Card>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 'phone':
        return renderPhoneStep();
      case 'verification':
        return renderVerificationStep();
      case 'new-password':
        return renderNewPasswordStep();
      case 'completed':
        return renderCompletedStep();
      default:
        return renderPhoneStep();
    }
  };

  return (
    <AuthLayout>
      {renderCurrentStep()}
    </AuthLayout>
  );
}