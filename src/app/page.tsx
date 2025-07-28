'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useNextAuth } from '@/components/features/auth/hooks/useNextAuth';
import { UserRole, UserState } from '@/components/features/profile/types/account';
import { PageLoading } from '@/components/ui/loading-spinner';

export default function RootPage() {
  const { user, isAuthenticated, isLoading, hasRole, isNewUser } = useNextAuth();
  const router = useRouter();
  const t = useTranslations('common');

  useEffect(() => {
    if (!isLoading) {
      // If user is not authenticated, redirect to sign-in
      if (!isAuthenticated) {
        router.push('/sign-in');
        return;
      }

      // If user is new (needs profile completion), redirect to profile complete
      if (isNewUser || user?.state === UserState.NEW) {
        router.push('/profile/complete');
        return;
      }

      // If user is authenticated, redirect based on their role
      if (hasRole(UserRole.INSTRUCTOR)) {
        router.push('/instructor');
        return;
      }

      if (hasRole(UserRole.STUDENT)) {
        router.push('/student');
        return;
      }

      // If user has no valid roles or is in an invalid state, redirect to sign-in
      // This handles edge cases like blocked/deleted users or users with no roles
      router.push('/sign-in');
    }
  }, [isAuthenticated, isLoading, hasRole, isNewUser, user, router]);

  // Show loading state while checking authentication
  if (isLoading) {
    return <PageLoading text={t('loading', { default: 'Loading...' })} />;
  }

  // Show redirecting state (this should be brief as useEffect will handle the redirect)
  return <PageLoading text={t('redirecting')} />;
}