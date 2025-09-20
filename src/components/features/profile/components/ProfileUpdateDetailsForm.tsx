'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

import React from 'react';

import { useTranslations } from 'next-intl';

import { useProfile } from '@/components/features/profile/hooks/useProfile';
import { useUpdateProfile } from '@/components/features/profile/hooks/useUpdateProfile';
import { profileDetailsUpdateSchema } from '@/components/features/profile/schemas/profile';
import { DashboardType } from '@/components/features/profile/types/account';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { SubmitButton } from '@/components/ui/submit-button';
import { Language } from '@/types/common';

export function ProfileUpdateDetailsForm() {
  const t = useTranslations();
  const { data: profile, isLoading } = useProfile();
  const updateProfile = useUpdateProfile();

  const detailsSchema = React.useMemo(() => profileDetailsUpdateSchema(t), [t]);

  const form = useForm<z.infer<typeof detailsSchema>>({
    resolver: zodResolver(detailsSchema),
    defaultValues: {
      firstName: profile?.firstName ?? '',
      lastName: profile?.lastName ?? '',
      language: profile?.language ?? Language.EN,
      dashboardType: profile?.dashboardType ?? DashboardType.STUDENT,
    },
    values: profile
      ? {
          firstName: profile.firstName ?? '',
          lastName: profile.lastName ?? '',
          language: profile.language ?? Language.EN,
          dashboardType: profile.dashboardType ?? DashboardType.STUDENT,
        }
      : undefined,
  });

  const onSubmit = form.handleSubmit(async (values) => {
    await updateProfile.mutateAsync(values);
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {t('profile.details.title', { fallback: 'Edit details' })}
        </CardTitle>
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
                    {t('auth.firstName.label', { fallback: 'First Name' })}
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t('auth.firstName.placeholder', {
                        fallback: 'John',
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
              name="lastName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {t('auth.lastName.label', { fallback: 'Last Name' })}
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t('auth.lastName.placeholder', {
                        fallback: 'Doe',
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
              name="language"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {t('language.label', { fallback: 'Default language' })}
                  </FormLabel>
                  <FormControl>
                    <Select
                      value={String(field.value)}
                      onValueChange={(val) => field.onChange(val as Language)}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">
                          {t('language.en', { fallback: 'English' })}
                        </SelectItem>
                        <SelectItem value="ru">
                          {t('language.ru', { fallback: 'Russian' })}
                        </SelectItem>
                        <SelectItem value="uz">
                          {t('language.uz', { fallback: 'Uzbek' })}
                        </SelectItem>
                      </SelectContent>
                    </Select>
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
                    {t('auth.dashboardType.label', {
                      fallback: 'Default Dashboard Selection',
                    })}
                  </FormLabel>
                  <FormControl>
                    <Select
                      value={String(field.value)}
                      onValueChange={(val) => field.onChange(Number(val))}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={String(DashboardType.STUDENT)}>
                          {t('auth.dashboardType.student', {
                            fallback: 'Student',
                          })}
                        </SelectItem>
                        <SelectItem value={String(DashboardType.INSTRUCTOR)}>
                          {t('auth.dashboardType.instructor', {
                            fallback: 'Instructor',
                          })}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <SubmitButton
              isSubmitting={updateProfile.isPending || isLoading}
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

export default ProfileUpdateDetailsForm;
