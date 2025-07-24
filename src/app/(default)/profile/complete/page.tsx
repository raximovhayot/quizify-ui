'use client';

import { useTranslations } from 'next-intl';
import { AuthLayout } from '@/components/layouts/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { InlineLoading } from '@/components/ui/loading-spinner';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useProfileComplete } from '@/hooks/useProfileComplete';
import { DashboardType } from '@/types/auth';
import { UserState } from '@/types/common';

export default function ProfileCompletePage() {
  const t = useTranslations();
  const {
    form,
    isSubmitting,
    onSubmit,
    user,
    isLoading
  } = useProfileComplete();

  // Show loading while checking authentication status
  if (isLoading) {
    return (
      <AuthLayout>
        <div className="container mx-auto px-4 py-8 max-w-md">
          <div className="flex justify-center">
            <InlineLoading text={t('common.loading', { default: 'Loading...' })} />
          </div>
        </div>
      </AuthLayout>
    );
  }

  // If user is not NEW, redirect will be handled by middleware
  if (!user || user.state !== UserState.NEW) {
    return null;
  }

  return (
    <AuthLayout>
      <div className="container mx-auto px-4 py-8 max-w-md">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">
              {t('auth.profileComplete.title', { default: 'Complete Your Profile' })}
            </CardTitle>
            <CardDescription>
              {t('auth.profileComplete.description', {
                default: 'Please provide your details to complete your account setup'
              })}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={onSubmit} className="space-y-4">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {t('auth.firstName.label', { default: 'First Name' })}
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder={t('auth.firstName.placeholder', { default: 'Enter your first name' })}
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
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {t('auth.lastName.label', { default: 'Last Name' })}
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder={t('auth.lastName.placeholder', { default: 'Enter your last name' })}
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
                          placeholder={t('auth.password.placeholder', { default: 'Create a password' })}
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
                  name="dashboardType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {t('auth.dashboardType.label', { default: 'I am a...' })}
                      </FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          value={field.value}
                          className="flex flex-col space-y-2"
                          disabled={isSubmitting}
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value={DashboardType.STUDENT} id="student" />
                            <Label htmlFor="student">
                              {t('auth.dashboardType.student', { default: 'Student' })}
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value={DashboardType.INSTRUCTOR} id="instructor" />
                            <Label htmlFor="instructor">
                              {t('auth.dashboardType.instructor', { default: 'Instructor' })}
                            </Label>
                          </div>
                        </RadioGroup>
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
                    <InlineLoading
                      text={t('auth.profileComplete.submitting', { default: 'Completing Profile...' })}
                    />
                  ) : (
                    t('auth.profileComplete.submit', { default: 'Complete Profile' })
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </AuthLayout>
  );
}