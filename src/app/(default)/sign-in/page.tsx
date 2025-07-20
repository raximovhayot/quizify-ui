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

// Sign-in validation schema
const signInSchema = z.object({
  phone: z.string()
    .min(1, 'Phone number is required')
    .regex(/^\+?[1-9]\d{1,14}$/, 'Please enter a valid phone number'),
  password: z.string()
    .min(1, 'Password is required')
    .min(6, 'Password must be at least 6 characters'),
});

type SignInFormData = z.infer<typeof signInSchema>;

export default function SignInPage() {
  const { login, isAuthenticated, isLoading: authLoading } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const t = useTranslations();

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

    try {
      await login(data.phone, data.password);
      
      // Get redirect URL from query params or default to home
      const redirectTo = searchParams.get('redirect') || '/';
      
      toast.success('Successfully signed in!');
      router.push(redirectTo);
    } catch (error: unknown) {
      console.error('Sign-in error:', error);
      
      // Handle different error types
      const errorMessage = error instanceof Error ? error.message : String(error);
      if (errorMessage.includes('Invalid credentials')) {
        toast.error('Invalid phone number or password');
      } else if (errorMessage.includes('Account not found')) {
        toast.error('Account not found. Please check your phone number or sign up.');
      } else if (errorMessage.includes('Account locked')) {
        toast.error('Account is temporarily locked. Please try again later.');
      } else {
        toast.error('Sign-in failed. Please try again.');
      }
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
                <Link
                  href="/forgot-password"
                  className="text-sm text-blue-600 hover:text-blue-800 underline"
                >
                  {t('auth.forgotPassword.link', { default: 'Forgot your password?' })}
                </Link>
              </div>

              <div className="text-center text-sm text-gray-600">
                {t('auth.signUp.prompt', { default: "Don't have an account?" })}{' '}
                <Link
                  href="/sign-up"
                  className="text-blue-600 hover:text-blue-800 underline font-medium"
                >
                  {t('auth.signUp.link', { default: 'Sign up' })}
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AuthLayout>
  );
}