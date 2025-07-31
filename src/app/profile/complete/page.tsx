'use client';

import { Suspense, useEffect } from 'react';

import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';

import { ProfileCompleteForm } from '@/components/features/profile/components/ProfileCompleteForm';
import { useProfileComplete } from '@/components/features/profile/hooks/useProfileComplete';
import {
  AccountDTO,
  UserState,
  hasRole,
} from '@/components/features/profile/types/account';
import { AuthLayout } from '@/components/shared/layouts/AppLayout';
import { Form } from '@/components/ui/form';
import { InlineLoading } from '@/components/ui/loading-spinner';

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
      if (hasRole(userWithLanguage, 'STUDENT')) {
        router.replace('/student');
      } else if (hasRole(userWithLanguage, 'INSTRUCTOR')) {
        router.replace('/instructor');
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
    <AuthLayout>
      <Form {...form}>
        <ProfileCompleteForm
          form={form}
          isSubmitting={isSubmitting}
          onSubmit={onSubmit}
        />
      </Form>
    </AuthLayout>
  );
}

function ProfileCompleteLoading() {
  const t = useTranslations();

  return (
    <AuthLayout>
      <div className="container mx-auto px-4 py-8 max-w-md">
        <div className="flex justify-center">
          <InlineLoading
            text={t('common.loading', { default: 'Loading...' })}
          />
        </div>
      </div>
    </AuthLayout>
  );
}

export default function ProfileCompletePage() {
  return (
    <Suspense fallback={<ProfileCompleteLoading />}>
      <ProfileCompleteContent />
    </Suspense>
  );
}
