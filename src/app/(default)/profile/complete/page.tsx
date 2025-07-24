'use client';

import { useTranslations } from 'next-intl';
import { AuthLayout } from '@/components/layouts/AppLayout';
import { InlineLoading } from '@/components/ui/loading-spinner';
import { Form } from '@/components/ui/form';
import { useProfileComplete } from '@/hooks/useProfileComplete';
import { UserState } from '@/types/common';
import { ProfileCompleteSteps } from '@/components/profile/ProfileCompleteSteps';

export default function ProfileCompletePage() {
  const t = useTranslations();
  const {
    form,
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
      <Form {...form}>
        <ProfileCompleteSteps />
      </Form>
    </AuthLayout>
  );
}