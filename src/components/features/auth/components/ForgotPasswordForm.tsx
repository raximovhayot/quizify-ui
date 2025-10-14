'use client';

import { useTranslations } from 'next-intl';
import Link from 'next/link';

import { useForgotPasswordForm } from '@/components/features/auth/hooks/useForgotPasswordForm';
import { FormCard, PhoneField } from '@/components/shared/form';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { Spinner } from '@/components/ui/spinner';

import { ROUTES_AUTH } from '../routes';

export function ForgotPasswordForm() {
  const t = useTranslations();
  const { isSubmitting, phoneForm, onPhoneSubmit } = useForgotPasswordForm();

  return (
    <FormCard
      className="w-full max-w-md mx-auto"
      title={t('auth.forgotPassword.title', { default: 'Reset Password' })}
      description={t('auth.forgotPassword.description', {
        default: 'Enter your phone number to receive a verification code',
      })}
      centerHeader
    >
      <Form {...phoneForm}>
        <form onSubmit={onPhoneSubmit} className="space-y-4">
          <PhoneField
            control={phoneForm.control}
            name="phone"
            label={t('auth.phone.label', { default: 'Phone Number' })}
            placeholder={t('auth.phone.placeholder', { default: '90 123 45 67' })}
            disabled={isSubmitting}
          />
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Spinner className="size-4 mr-2" />
                {t('common.sending', { default: 'Sending...' })}
              </>
            ) : (
              t('auth.forgotPassword.sendCode', {
                default: 'Send Verification Code',
              })
            )}
          </Button>
        </form>
      </Form>
      <div className="mt-4 text-center">
        <Link
          href={ROUTES_AUTH.login()}
          className="text-sm text-muted-foreground hover:underline"
        >
          {t('auth.backToSignIn', { default: 'Back to Sign In' })}
        </Link>
      </div>
    </FormCard>
  );
}
