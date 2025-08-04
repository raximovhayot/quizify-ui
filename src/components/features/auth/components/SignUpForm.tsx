'use client';

import { useTranslations } from 'next-intl';
import Link from 'next/link';

import { useSignUpForms } from '@/components/features/auth/hooks/useSignUpForms';
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

export function SignUpForm() {
  const t = useTranslations();
  const { isSubmitting, phoneForm, onPhoneSubmit } = useSignUpForms();
  return (
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
                      type="tel"
                      placeholder={t('auth.phone.placeholder', {
                        default: '+1234567890',
                      })}
                      disabled={isSubmitting}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
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
      </CardContent>
    </Card>
  );
}
