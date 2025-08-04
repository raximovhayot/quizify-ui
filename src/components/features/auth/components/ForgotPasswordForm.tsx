'use client';

import { useTranslations } from 'next-intl';
import Link from 'next/link';

import { useForgotPasswordForm } from '@/components/features/auth/hooks/useForgotPasswordForm';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { InlineLoading } from '@/components/ui/loading-spinner';

import { ROUTES_AUTH } from '../routes';

export function ForgotPasswordForm() {
  const t = useTranslations();
  const { isSubmitting, phoneForm, onPhoneSubmit } = useForgotPasswordForm();

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle>
          {t('auth.forgotPassword.title', { default: 'Reset Password' })}
        </CardTitle>
        <CardDescription>
          {t('auth.forgotPassword.description', {
            default: 'Enter your phone number to receive a verification code',
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
                  <FormLabel>
                    {t('auth.phone.label', { default: 'Phone Number' })}
                  </FormLabel>
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
                <InlineLoading
                  text={t('common.sending', { default: 'Sending...' })}
                />
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
      </CardContent>
    </Card>
  );
}
