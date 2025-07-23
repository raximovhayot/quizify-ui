'use client';

import { useTranslations } from 'next-intl';
import { AuthLayout } from '@/components/layouts/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { useSignUpForms } from '@/hooks/useSignUpForms';
import {
  PhoneStep,
  VerificationStep,
  UserDetailsStep,
  CompletedStep,
} from '@/components/auth/SignUpSteps';

export default function SignUpPage() {
  const t = useTranslations();
  const {
    currentStep,
    isSubmitting,
    phoneNumber,
    resendCooldown,
    isAuthenticated,
    phoneForm,
    verificationForm,
    userDetailsForm,
    onPhoneSubmit,
    onVerificationSubmit,
    onUserDetailsSubmit,
    handleResendOTP,
  } = useSignUpForms();

  // Don't render the form if user is already authenticated
  if (isAuthenticated) {
    return null;
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 'phone':
        return (
          <PhoneStep
            form={phoneForm}
            onSubmit={onPhoneSubmit}
            isSubmitting={isSubmitting}
          />
        );

      case 'verification':
        return (
          <VerificationStep
            form={verificationForm}
            onSubmit={onVerificationSubmit}
            isSubmitting={isSubmitting}
            phoneNumber={phoneNumber}
            resendCooldown={resendCooldown}
            onResend={handleResendOTP}
          />
        );

      case 'details':
        return (
          <UserDetailsStep
            form={userDetailsForm}
            onSubmit={onUserDetailsSubmit}
            isSubmitting={isSubmitting}
          />
        );

      case 'completed':
        return <CompletedStep />;

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