'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { AuthLayout } from '@/components/layouts/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { InlineLoading } from '@/components/ui/loading-spinner';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { toast } from 'sonner';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

export default function SignInPage() {
  const { login, isAuthenticated, isLoading: authLoading } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const t = useTranslations();

  // Sign-in validation schema with localized messages
  const signInSchema = z.object({
    phone: z.string()
      .min(1, t('auth.validation.phoneRequired'))
      .regex(/^(?:\+?998|0)?\d{9}$/, t('auth.validation.phoneInvalid')),
    password: z.string()
      .min(1, t('auth.validation.passwordRequired'))
      .min(6, t('auth.validation.passwordMinLength')),
  });

  type SignInFormData = z.infer<typeof signInSchema>;

  const form = useForm<SignInFormData>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      phone: '',
      password: '',
    },
  });

  useEffect(() => {
    // If user is already authenticated, redirect them
    if (isAuthenticated && !authLoading) {
      const redirectTo = searchParams.get('redirect') || '/';
      router.push(redirectTo);
    }
  }, [isAuthenticated, authLoading, router, searchParams]);

  const onSubmit = async (data: SignInFormData) => {
    setIsSubmitting(true);
    setAuthError(null); // Clear previous errors

    try {
      await login(data.phone, data.password);
      
      // Get redirect URL from query params or default to home
      const redirectTo = searchParams.get('redirect') || '/';
      
      toast.success(t('auth.loginSuccess'));
      router.push(redirectTo);
    } catch (error: unknown) {
      console.error('Sign-in error:', error);
      
      // Handle different error types
      const errorMessage = error instanceof Error ? error.message : String(error);
      let translatedError: string;
      
      // Check for specific error patterns
      if (errorMessage.includes('invalid.credentials') || 
          errorMessage.includes('Invalid credentials') || 
          errorMessage.includes('Unauthorized') || 
          errorMessage.includes('401') ||
          errorMessage.includes('noto\'g\'ri') || // Uzbek: incorrect
          errorMessage.includes('неверный') || // Russian: incorrect
          errorMessage.includes('Foydalanuvchi nomi yoki parol noto\'g\'ri')) { // Uzbek: username or password incorrect
        translatedError = t('auth.invalidCredentials');
      } else if (errorMessage.includes('Account not found') || errorMessage.includes('User not found')) {
        translatedError = t('auth.errors.accountNotFound', { 
          default: 'Account not found. Please check your phone number or sign up.' 
        });
      } else if (errorMessage.includes('Account locked') || errorMessage.includes('locked')) {
        translatedError = t('auth.errors.accountLocked', { 
          default: 'Account is temporarily locked. Please try again later.' 
        });
      } else if (errorMessage.includes('Network') || errorMessage.includes('NETWORK_ERROR')) {
        translatedError = t('auth.errors.networkError', { 
          default: 'Network error. Please check your connection and try again.' 
        });
      } else {
        translatedError = t('auth.errors.signInFailed', { 
          default: 'Sign-in failed. Please try again.' 
        });
      }
      
      setAuthError(translatedError);
      toast.error(translatedError);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show loading state while checking authentication
  if (authLoading) {
    return (
      <AuthLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <InlineLoading />
        </div>
      </AuthLayout>
    );
  }

  // Don't render the form if user is already authenticated
  if (isAuthenticated) {
    return null;
  }

  return (
    <AuthLayout>
      <div className="container mx-auto px-4 py-8 max-w-md">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">
              {t('auth.signIn.title', { default: 'Sign In' })}
            </CardTitle>
            <CardDescription>
              {t('auth.signIn.description', { 
                default: 'Enter your phone number and password to access your account' 
              })}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                {authError && (
                  <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
                    {authError}
                  </div>
                )}
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
                          placeholder={t('auth.phone.placeholder', { default: '+1234567890' })}
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
                          placeholder={t('auth.password.placeholder', { default: 'Enter your password' })}
                          disabled={isSubmitting}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  className="w-full"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <InlineLoading />
                      {t('auth.signIn.submitting', { default: 'Signing In...' })}
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
                    href="/forgot-password"
                    className="text-primary hover:underline"
                  >
                    {t('auth.forgotPassword.link', { default: 'Forgot your password?' })}
                  </Link>
                </div>
              </div>

              <div className="text-center">
                <div className="text-sm text-muted-foreground">
                  {t('auth.signUp.prompt', { default: "Don't have an account?" })}{' '}
                  <Link
                    href="/sign-up"
                    className="text-primary hover:underline"
                  >
                    {t('auth.signUp.link', { default: 'Sign up' })}
                  </Link>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AuthLayout>
  );
}