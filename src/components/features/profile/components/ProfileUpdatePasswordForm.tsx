'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

import React from 'react';

import { useTranslations } from 'next-intl';

import { useChangePassword } from '@/components/features/profile/hooks/useChangePassword';
import { profilePasswordUpdateSchema } from '@/components/features/profile/schemas/profile';
import { FormCard, PasswordField } from '@/components/shared/form';
import { Form } from '@/components/ui/form';
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
    <FormCard
      title={t('profile.password.title', { fallback: 'Update password' })}
    >
      <Form {...form}>
        <form onSubmit={onSubmit} className="space-y-4">
          <PasswordField
            control={form.control}
            name="currentPassword"
            label={t('auth.password.label', { fallback: 'Password' })}
            placeholder={t('auth.password.placeholder', {
              fallback: 'Enter your password',
            })}
          />

          <PasswordField
            control={form.control}
            name="newPassword"
            label={t('auth.password.new.label', { fallback: 'New Password' })}
            placeholder={t('auth.password.placeholder', {
              fallback: 'Enter your password',
            })}
          />

          <PasswordField
            control={form.control}
            name="confirmPassword"
            label={t('auth.password.confirm.label', {
              fallback: 'Confirm Password',
            })}
            placeholder={t('auth.password.confirm.placeholder', {
              fallback: 'Confirm your password',
            })}
          />

          <SubmitButton
            isSubmitting={changePassword.isPending}
            loadingText={t('common.saving', { fallback: 'Saving...' })}
            submitText={t('common.save', { fallback: 'Save' })}
            className="w-full md:w-auto"
          />
        </form>
      </Form>
    </FormCard>
  );
}

export default ProfileUpdatePasswordForm;
