'use client';

import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

import { useForgotPasswordForm } from '@/components/features/auth/hooks/useForgotPasswordForm';
import { FormCard, PasswordField } from '@/components/shared/form';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { InlineLoading } from '@/components/ui/loading-spinner';

import { ROUTES_AUTH } from '../routes';

export function ResetPasswordForm() {
  const t = useTranslations();
  const searchParams = useSearchParams();
  const phoneFromUrl = searchParams?.get('phone') ?? '';

  const { isSubmitting, newPasswordForm, onNewPasswordSubmit } =
    useForgotPasswordForm();

  return (
    <FormCard
      className="w-full max-w-md mx-auto"
      title={t('auth.resetPassword.title', { default: 'Set New Password' })}
      description={t('auth.resetPassword.description', {
        default: 'Enter your new password',
      })}
      centerHeader
    >
      <Form {...newPasswordForm}>
        <form onSubmit={onNewPasswordSubmit} className="space-y-4">
          <PasswordField
            control={newPasswordForm.control}
            name="password"
            label={t('auth.password.new.label', { default: 'New Password' })}
            placeholder={t('auth.password.placeholder', {
              default: 'Enter your password',
            })}
            disabled={isSubmitting}
          />

          <PasswordField
            control={newPasswordForm.control}
            name="confirmPassword"
            label={t('auth.password.confirm.label', {
              default: 'Confirm Password',
            })}
            placeholder={t('auth.password.confirm.placeholder', {
              default: 'Confirm your password',
            })}
            disabled={isSubmitting}
          />

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? (
              <InlineLoading
                text={t('auth.resetPassword.updating', {
                  default: 'Updating Password...',
                })}
              />
            ) : (
              t('auth.resetPassword.update', { default: 'Update Password' })
            )}
          </Button>
        </form>
      </Form>

      <div className="mt-4 text-center">
        <div className="text-sm text-muted-foreground">
          {t('auth.resetPassword.forPhone', {
            default: 'Resetting password for',
          })}{' '}
          <span className="font-medium">{phoneFromUrl}</span>
        </div>

        <div className="mt-2">
          <Link
            href={ROUTES_AUTH.login()}
            className="text-sm text-muted-foreground hover:underline"
          >
            {t('auth.backToSignIn', { default: 'Back to Sign In' })}
          </Link>
        </div>
      </div>
    </FormCard>
  );
}
