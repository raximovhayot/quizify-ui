'use client';

import { Suspense } from 'react';

import { useTranslations } from 'next-intl';
import Link from 'next/link';

import {
  PhoneStep,
  VerificationStep,
} from '@/components/features/auth/components/SignUpSteps';
import { useSignUpForms } from '@/components/features/auth/hooks/useSignUpForms';
import { AuthLayout } from '@/components/shared/layouts/AppLayout';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

function SignUpContent() {
  const t = useTranslations();
  const {
    currentStep,
    isSubmitting,
    phoneNumber,
    resendCooldown,
    isAuthenticated,
    phoneForm,
    verificationForm,
    onPhoneSubmit,
    onVerificationSubmit,
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

      default:
        return null;
    }
  };

  const getStepTitle = () => {
    switch (currentStep) {
      case 'phone':
        return t('auth.signUp.phone.title', { default: 'Sign Up' });
      case 'verification':
        return t('auth.signUp.verification.title', {
          default: 'Verify Phone Number',
        });
      default:
        return 'Sign Up';
    }
  };

  const getStepDescription = () => {
    switch (currentStep) {
      case 'phone':
        return t('auth.signUp.phone.description', {
          default: 'Enter your phone number to get started',
        });
      case 'verification':
        return t('auth.signUp.verification.description', {
          default: 'We sent a verification code to your phone',
        });
      default:
        return '';
    }
  };

  return (
    <AuthLayout>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">{getStepTitle()}</CardTitle>
          <CardDescription>{getStepDescription()}</CardDescription>
        </CardHeader>
        <CardContent>
          {renderStepContent()}

          {currentStep === 'phone' && (
            <div className="mt-6 text-center">
              <div className="text-sm text-muted-foreground">
                {t('auth.signIn.prompt', {
                  default: 'Already have an account?',
                })}{' '}
                <Link href="/sign-in" className="text-primary hover:underline">
                  {t('auth.signIn.link', { default: 'Sign in' })}
                </Link>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </AuthLayout>
  );
}

export default function SignUpPage() {
  return (
    <Suspense
      fallback={
        <AuthLayout>
          <div className="container mx-auto px-4 py-8 max-w-md">
            <Card>
              <CardHeader className="text-center">
                <CardTitle className="text-2xl font-bold">Loading...</CardTitle>
              </CardHeader>
            </Card>
          </div>
        </AuthLayout>
      }
    >
      <SignUpContent />
    </Suspense>
  );
}
