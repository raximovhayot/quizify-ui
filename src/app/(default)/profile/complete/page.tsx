'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { AuthLayout } from '@/components/layouts/AppLayout';
import { InlineLoading } from '@/components/ui/loading-spinner';
import { Form } from '@/components/ui/form';
import { useProfileComplete } from '@/hooks/useProfileComplete';
import { UserState } from '@/types/common';
import { ProfileCompleteSteps } from '@/components/profile/ProfileCompleteSteps';
import { hasRole, AccountDTO } from '@/types/auth';

export default function ProfileCompletePage() {
  const t = useTranslations();
  const router = useRouter();
  const {
    form,
    user,
    isLoading
  } = useProfileComplete();

  // Handle immediate redirection for users who shouldn't be on this page
  useEffect(() => {
    if (!isLoading) {
      if (user && user.state !== UserState.NEW) {
        const userWithLanguage = {...user, language: 'en' as const} as unknown as AccountDTO;
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
    }
  }, [isLoading, user, router]);

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
        <ProfileCompleteSteps />
      </Form>
    </AuthLayout>
  );
}