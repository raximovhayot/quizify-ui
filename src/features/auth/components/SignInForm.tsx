'use client';

import { useTranslations } from 'next-intl';
import Link from 'next/link';

import { useNextAuthSignIn } from '@/features/auth/hooks/useNextAuthSignIn';
import { FormCard, PasswordField, PhoneField } from '@/components/shared/form';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { Spinner } from '@/components/ui/spinner';

import { ROUTES_AUTH } from '../routes';

export function SignInForm() {
  const t = useTranslations();
  const { form, isSubmitting, onSubmit } = useNextAuthSignIn();

  return (
    <FormCard
      title={t('auth.signIn.title', { default: 'Sign In' })}
      description={t('auth.signIn.description', {
        default: 'Enter your phone number and password to access your account',
      })}
      centerHeader
    >
      <Form {...form}>
        <form onSubmit={onSubmit} className="space-y-4">
          <PhoneField
            control={form.control}
            name="phone"
            label={t('auth.phone.label', { default: 'Phone Number' })}
            placeholder={t('auth.phone.placeholder', {
              default: '90 123 45 67',
            })}
            disabled={isSubmitting}
          />

          <PasswordField
            control={form.control}
            name="password"
            label={t('auth.password.label', { default: 'Password' })}
            placeholder={t('auth.password.placeholder', {
              default: 'Enter your password',
            })}
            disabled={isSubmitting}
          />

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Spinner className="size-4 mr-2" />
                {t('auth.signIn.submitting', {
                  default: 'Signing In...',
                })}
              </>
            ) : (
              t('auth.signIn.submit', { default: 'Sign In' })
            )}
          </Button>
        </form>
      </Form>

      <div className="mt-6 space-y-4">
        <div className="text-center">
          <div className="text-sm text-muted-foreground">
            <Link
              href={ROUTES_AUTH.forgotPassword()}
              className="text-primary hover:underline"
            >
              {t('auth.forgotPassword.link', {
                default: 'Forgot your password?',
              })}
            </Link>
          </div>
        </div>

        <div className="text-center">
          <div className="text-sm text-muted-foreground">
            {t('auth.signUp.prompt', { default: "Don't have an account?" })}{' '}
            <Link
              href={ROUTES_AUTH.register()}
              className="text-primary hover:underline"
            >
              {t('auth.signUp.link', { default: 'Sign up' })}
            </Link>
          </div>
        </div>
      </div>
    </FormCard>
  );
}
