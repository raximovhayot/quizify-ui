'use client';

import { ReactNode, useEffect } from 'react';

import { useTranslations } from 'next-intl';
import { useRouter, useSearchParams } from 'next/navigation';

import { useNextAuth } from '@/components/features/auth/hooks/useNextAuth';
import { PageLoading } from '@/components/ui/loading-spinner';

interface GuardPublicOnlyProps {
  children: ReactNode;
  redirectPath?: string;
}

/**
 * Guard component that only allows access to unauthenticated users.
 * Redirects authenticated users to their appropriate dashboard or specified path.
 * Useful for sign-in, sign-up, and other public-only pages.
 */
export default function GuardPublicOnly({
  children,
  redirectPath,
}: GuardPublicOnlyProps) {
  const { isAuthenticated, isLoading, user } = useNextAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const t = useTranslations('common');

  useEffect(() => {
    if (isAuthenticated && user) {
      // Get redirect path from query params or use provided redirectPath
      const redirect = searchParams?.get('redirect') || redirectPath;

      if (redirect) {
        router.replace(redirect);
        return;
      }

      // Default redirect based on user roles
      const userRoles = user.roles || [];
      const hasStudentRole = userRoles.some((role) => role.name === 'STUDENT');
      const hasInstructorRole = userRoles.some(
        (role) => role.name === 'INSTRUCTOR'
      );

      if (hasStudentRole && hasInstructorRole) {
        // User has both roles, redirect to student dashboard as default
        router.replace('/student');
      } else if (hasStudentRole) {
        router.replace('/student');
      } else if (hasInstructorRole) {
        router.replace('/instructor');
      } else {
        // No valid roles, redirect to home
        router.replace('/');
      }
    }
  }, [isAuthenticated, user, searchParams, router, redirectPath]);

  // Show loading while checking authentication
  if (isLoading) {
    return <PageLoading text={t('loading', { default: 'Loading...' })} />;
  }

  // Show loading while redirecting authenticated users
  if (isAuthenticated) {
    return <PageLoading text={t('redirecting')} />;
  }

  // User is not authenticated, show the protected content
  return <>{children}</>;
}
