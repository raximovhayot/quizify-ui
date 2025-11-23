'use client';

import { Suspense, useEffect } from 'react';

import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';

import { ProfileCompleteForm } from '@/features/profile/components/ProfileCompleteForm';
import { useProfileComplete } from '@/features/profile/hooks/useProfileComplete';
import {
  AccountDTO,
  UserState,
  hasRole,
} from '@/features/profile/types/account';
import { AppPublicOnlyLayout } from '@/components/shared/layouts/AppLayout';
import { Form } from '@/components/ui/form';
import { FullPageLoading } from '@/components/shared/ui/FullPageLoading';
import { ROUTES_APP } from '@/features/routes';

function ProfileCompleteContent() {
  const router = useRouter();
  const { form, user, isSubmitting, onSubmit } = useProfileComplete();

  // Handle immediate redirection for users who shouldn't be on this page
  useEffect(() => {
    if (user && user.state !== UserState.NEW) {
      const userWithLanguage = {
        ...user,
        language: 'en' as const,
      } as unknown as AccountDTO;
      if (hasRole(userWithLanguage, 'STUDENT') || hasRole(userWithLanguage, 'INSTRUCTOR')) {
        router.replace(ROUTES_APP.root());
      } else {
        router.replace('/');
      }
    } else if (!user) {
      // No user session, check for signup token
      const signupToken = sessionStorage.getItem('signupToken');
      if (!signupToken) {
        // No signup token either, redirect to signup immediately
        router.replace('/sign-up');
      }
    }
  }, [user, router]);

  // Only render the profile completion form for authenticated users with NEW state
  // or users with valid signup tokens
  if (!user && !sessionStorage.getItem('signupToken')) {
    // Redirect is happening in useEffect, show nothing
    return null;
  }

  if (user && user.state !== UserState.NEW) {
    // Redirect is happening in useEffect, show nothing
    return null;
  }

  return (
    <AppPublicOnlyLayout>
      <Form {...form}>
        <ProfileCompleteForm
          form={form}
          isSubmitting={isSubmitting}
          onSubmit={onSubmit}
        />
      </Form>
    </AppPublicOnlyLayout>
  );
}

function ProfileCompleteLoading() {
  const t = useTranslations();

  return (
    <AppPublicOnlyLayout>
      <FullPageLoading text={t('common.loading', { default: 'Loading...' })} />
    </AppPublicOnlyLayout>
  );
}

export default function ProfileCompletePage() {
  return (
    <Suspense fallback={<ProfileCompleteLoading />}>
      <ProfileCompleteContent />
    </Suspense>
  );
}
