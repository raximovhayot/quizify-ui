'use client';

import { useTranslations } from 'next-intl';
import Link from 'next/link';

import { PhoneStep } from '@/components/features/auth/components/SignUpSteps';
import { useSignUpForms } from '@/components/features/auth/hooks/useSignUpForms';
import { AppPublicOnlyLayout } from '@/components/shared/layouts/AppLayout';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

import { ROUTES_AUTH } from '../routes';

export function PageRegister() {
  const t = useTranslations();
  const {
    isSubmitting,
    isAuthenticated,
    phoneForm,
    onPhoneSubmit,
  } = useSignUpForms();

  // Don't render the form if user is already authenticated
  if (isAuthenticated) {
    return null;
  }

  return (
    <AppPublicOnlyLayout>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">
            {t('auth.signUp.phone.title', { default: 'Sign Up' })}
          </CardTitle>
          <CardDescription>
            {t('auth.signUp.phone.description', {
              default: 'Enter your phone number to get started',
            })}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PhoneStep
            form={phoneForm}
            onSubmit={onPhoneSubmit}
            isSubmitting={isSubmitting}
          />

          <div className="mt-6 text-center">
            <div className="text-sm text-muted-foreground">
              {t('auth.signIn.prompt', {
                default: 'Already have an account?',
              })}{' '}
              <Link href={ROUTES_AUTH.login()} className="text-primary hover:underline">
                {t('auth.signIn.link', { default: 'Sign in' })}
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </AppPublicOnlyLayout>
  );
}