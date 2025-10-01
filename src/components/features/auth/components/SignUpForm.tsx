'use client';

import { useTranslations } from 'next-intl';
import Link from 'next/link';

import { useSignUpForms } from '@/components/features/auth/hooks/useSignUpForms';
import { FormCard, PhoneField } from '@/components/shared/form';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { InlineLoading } from '@/components/ui/loading-spinner';

import { ROUTES_AUTH } from '../routes';

export function SignUpForm() {
  const t = useTranslations();
  const { isSubmitting, phoneForm, onPhoneSubmit } = useSignUpForms();
  return (
    <FormCard
      title={t('auth.signUp.phone.title', { default: 'Sign Up' })}
      description={t('auth.signUp.phone.description', {
        default: 'Enter your phone number to get started',
      })}
      centerHeader
    >
      <Form {...phoneForm}>
        <form onSubmit={onPhoneSubmit} className="space-y-4">
          <PhoneField
            control={phoneForm.control}
            name="phone"
            label={t('auth.phone.label', { default: 'Phone Number' })}
            placeholder={t('auth.phone.placeholder', {
              default: '+1234567890',
            })}
            disabled={isSubmitting}
          />

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? (
              <InlineLoading
                text={t('auth.signUp.sendingCode', {
                  default: 'Sending Code...',
                })}
              />
            ) : (
              t('auth.signUp.sendCode', { default: 'Send Verification Code' })
            )}
          </Button>
        </form>
      </Form>

      <div className="mt-6 text-center">
        <div className="text-sm text-muted-foreground">
          {t('auth.signIn.prompt', {
            default: 'Already have an account?',
          })}{' '}
          <Link
            href={ROUTES_AUTH.login()}
            className="text-primary hover:underline"
          >
            {t('auth.signIn.link', { default: 'Sign in' })}
          </Link>
        </div>
      </div>
    </FormCard>
  );
}
