'use client';

import { useTranslations } from 'next-intl';
import Link from 'next/link';

import { useNextAuthSignIn } from '@/components/features/auth/hooks/useNextAuthSignIn';
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

export function PageLogin() {
  const t = useTranslations();
  const { form, isSubmitting, isAuthenticated, onSubmit } = useNextAuthSignIn();

  // Don't render the form if user is already authenticated
  if (isAuthenticated) {
    return null;
  }

  return (
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">
            {t('auth.signIn.title', { default: 'Sign In' })}
          </CardTitle>
          <CardDescription>
            {t('auth.signIn.description', {
              default:
                'Enter your phone number and password to access your account',
            })}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={onSubmit} className="space-y-4">
              <FormField
                control={form.control}
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

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {t('auth.password.label', { default: 'Password' })}
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder={t('auth.password.placeholder', {
                          default: 'Enter your password',
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
                  <>
                    <InlineLoading
                      text={t('auth.signIn.submitting', {
                        default: 'Signing In...',
                      })}
                    />
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
                <Link href={ROUTES_AUTH.register()} className="text-primary hover:underline">
                  {t('auth.signUp.link', { default: 'Sign up' })}
                </Link>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
  );
}