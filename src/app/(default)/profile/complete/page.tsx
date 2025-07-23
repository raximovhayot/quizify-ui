'use client';

import { useTranslations } from 'next-intl';
import { AuthLayout } from '@/components/layouts/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { InlineLoading } from '@/components/ui/loading-spinner';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { DashboardType } from '@/types/auth';
import { useProfileCompleteForm } from '@/hooks/useProfileCompleteForm';

export default function ProfileCompletePage() {
  const t = useTranslations();
  const { form, isSubmitting, onSubmit } = useProfileCompleteForm();

  return (
    <AuthLayout>
      <div className="container mx-auto px-4 py-8 max-w-md">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">
              {t('profile.complete.title', { default: 'Complete Your Profile' })}
            </CardTitle>
            <CardDescription>
              {t('profile.complete.description', { 
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
                        {t('profile.complete.firstName.label', { default: 'First Name' })}
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder={t('profile.complete.firstName.placeholder', { 
                            default: 'Enter your first name' 
                          })}
                          disabled={isSubmitting}
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
                        {t('profile.complete.lastName.label', { default: 'Last Name' })}
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder={t('profile.complete.lastName.placeholder', { 
                            default: 'Enter your last name' 
                          })}
                          disabled={isSubmitting}
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
                        {t('profile.complete.password.label', { default: 'Password' })}
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="password"
                          placeholder={t('profile.complete.password.placeholder', { 
                            default: 'Create a secure password' 
                          })}
                          disabled={isSubmitting}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {t('profile.complete.confirmPassword.label', { default: 'Confirm Password' })}
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="password"
                          placeholder={t('profile.complete.confirmPassword.placeholder', { 
                            default: 'Confirm your password' 
                          })}
                          disabled={isSubmitting}
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
                        {t('profile.complete.role.label', { default: 'I am a' })}
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
                              {t('profile.complete.role.student', { default: 'Student' })}
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value={DashboardType.INSTRUCTOR} id="instructor" />
                            <Label htmlFor="instructor">
                              {t('profile.complete.role.instructor', { default: 'Instructor' })}
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
                      text={t('profile.complete.submitting', { default: 'Completing Profile...' })}
                    />
                  ) : (
                    t('profile.complete.submit', { default: 'Complete Profile' })
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