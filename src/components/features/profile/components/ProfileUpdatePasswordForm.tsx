'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

import React from 'react';

import { useTranslations } from 'next-intl';

import { useChangePassword } from '@/components/features/profile/hooks/useChangePassword';
import { profilePasswordUpdateSchema } from '@/components/features/profile/schemas/profile';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { SubmitButton } from '@/components/ui/submit-button';

export function ProfileUpdatePasswordForm() {
  const t = useTranslations();
  const changePassword = useChangePassword();

  const passwordSchema = React.useMemo(
    () => profilePasswordUpdateSchema(t),
    [t]
  );

  const form = useForm<z.infer<typeof passwordSchema>>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    await changePassword.mutateAsync({
      currentPassword: values.currentPassword,
      newPassword: values.newPassword,
    });
    form.reset();
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {t('profile.password.title', { fallback: 'Update password' })}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={onSubmit} className="space-y-4">
            <FormField
              control={form.control}
              name="currentPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {t('auth.password.label', { fallback: 'Password' })}
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder={t('auth.password.placeholder', {
                        fallback: 'Enter your password',
                      })}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="newPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {t('auth.password.new.label', { fallback: 'New Password' })}
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder={t('auth.password.placeholder', {
                        fallback: 'Enter your password',
                      })}
                      {...field}
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
                    {t('auth.password.confirm.label', {
                      fallback: 'Confirm Password',
                    })}
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder={t('auth.password.confirm.placeholder', {
                        fallback: 'Confirm your password',
                      })}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <SubmitButton
              isSubmitting={changePassword.isPending}
              loadingText={t('common.saving', { fallback: 'Saving...' })}
              submitText={t('common.save', { fallback: 'Save' })}
              className="w-full md:w-auto"
            />
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

export default ProfileUpdatePasswordForm;
