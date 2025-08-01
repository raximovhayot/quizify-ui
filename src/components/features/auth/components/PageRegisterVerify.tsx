'use client';

import { useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';

import { VerificationStep } from '@/components/features/auth/components/SignUpSteps';
import { useSignUpForms } from '@/components/features/auth/hooks/useSignUpForms';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export function PageRegisterVerify() {
  const t = useTranslations();
  const searchParams = useSearchParams();
  const phoneFromUrl = searchParams.get('phone') || '';
  
  const {
    isSubmitting,
    resendCooldown,
    isAuthenticated,
    verificationForm,
    onVerificationSubmit,
    handleResendOTP,
  } = useSignUpForms();

  // Don't render the form if user is already authenticated
  if (isAuthenticated) {
    return null;
  }

  return (
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">
            {t('auth.signUp.verification.title', {
              default: 'Verify Phone Number',
            })}
          </CardTitle>
          <CardDescription>
            {t('auth.signUp.verification.description', {
              default: 'We sent a verification code to your phone',
            })}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <VerificationStep
            form={verificationForm}
            onSubmit={onVerificationSubmit}
            isSubmitting={isSubmitting}
            phoneNumber={phoneFromUrl}
            resendCooldown={resendCooldown}
            onResend={handleResendOTP}
          />
        </CardContent>
      </Card>
  );
}