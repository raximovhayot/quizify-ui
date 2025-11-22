'use client';

import { ReactNode, Suspense, useEffect } from 'react';

import { useTranslations } from 'next-intl';
import { usePathname, useRouter } from 'next/navigation';

import { useNextAuth } from '@/features/auth/hooks/useNextAuth';
import {
  UserRole,
  UserState,
} from '@/features/profile/types/account';
import { ErrorPage } from '@/components/ui/error-page';
import { FullPageLoading } from '@/components/shared/ui/FullPageLoading';
import { Spinner } from '@/components/ui/spinner';

interface GuardAuthenticatedProps {
  children: ReactNode;
  requiredRoles?: UserRole[];
  loginPath?: string;
  fallbackRoles?: { role: UserRole; redirectTo: string }[];
  showUnauthorizedError?: boolean;
}

function GuardAuthenticatedContent({
  children,
  requiredRoles = [],
  loginPath = '/sign-in',
  fallbackRoles = [],
  showUnauthorizedError = false,
}: Readonly<GuardAuthenticatedProps>) {
  const { isAuthenticated, isLoading, user, hasAnyRole, hasRole } =
    useNextAuth();
  const router = useRouter();
  const pathname = usePathname();
  const safePath = pathname ?? '/';
  const t = useTranslations('common');

  useEffect(() => {
    // Redirect to sign-in if not authenticated
    if (!isLoading && !isAuthenticated) {
      router.replace(`${loginPath}?redirect=${encodeURIComponent(safePath)}`);
      return;
    }

    // Handle user state - redirect to profile completion if needed
    if (
      isAuthenticated &&
      user &&
      user.state === UserState.NEW &&
      !safePath.startsWith('/profile/complete')
    ) {
      router.replace('/profile/complete');
      return;
    }

    // Check role authorization if roles are specified
    if (
      isAuthenticated &&
      requiredRoles.length > 0 &&
      !hasAnyRole(requiredRoles)
    ) {
      // Check fallback roles
      for (const fallback of fallbackRoles) {
        if (hasRole(fallback.role)) {
          router.replace(fallback.redirectTo);
          return;
        }
      }

      // No valid roles found
      if (showUnauthorizedError) {
        // Don't redirect, component will show 403 error
        return;
      } else {
        // Redirect to unified dashboard if user has any valid role
        const userRoles = user?.roles || [];
        const hasStudentRole = userRoles.some(
          (role) => role.name === 'STUDENT'
        );
        const hasInstructorRole = userRoles.some(
          (role) => role.name === 'INSTRUCTOR'
        );

        if (hasStudentRole || hasInstructorRole) {
          router.replace('/dashboard');
        } else {
          router.replace('/');
        }
        return;
      }
    }
  }, [
    isAuthenticated,
    isLoading,
    user,
    hasAnyRole,
    hasRole,
    router,
    safePath,
    loginPath,
    requiredRoles,
    fallbackRoles,
    showUnauthorizedError,
  ]);

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <FullPageLoading text={t('loading', { default: 'Loading...' })} />
    );
  }

  // Show loading while redirecting unauthenticated users
  if (!isAuthenticated) {
    return <FullPageLoading text={t('redirecting')} />;
  }

  // Show loading while redirecting users with incomplete profiles
  if (
    user &&
    user.state === UserState.NEW &&
    !safePath.startsWith('/profile/complete')
  ) {
    return <FullPageLoading text={t('redirecting')} />;
  }

  // Check role authorization
  if (requiredRoles.length > 0 && !hasAnyRole(requiredRoles)) {
    if (showUnauthorizedError) {
      return <ErrorPage errorCode={403} />;
    } else {
      return (
        <div className="min-h-[40vh] flex items-center justify-center">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Spinner className="size-5" />
            {t('redirecting')}
          </div>
        </div>
      );
    }
  }

  // All checks passed, render children
  return <>{children}</>;
}

function GuardAuthenticatedLoading() {
  const t = useTranslations('common');
  return <FullPageLoading text={t('loading', { default: 'Loading...' })} />;
}

/**
 * Enhanced authentication guard component inspired by StartUI patterns.
 * Provides comprehensive authentication and authorization checking with:
 * - Role-based access control
 * - Configurable sign-in paths
 * - Fallback role handling
 * - User state management (NEW user profile completion)
 * - Error handling (403 pages or redirects)
 * - Full-screen loading states
 */
export default function GuardAuthenticated(
  props: Readonly<GuardAuthenticatedProps>
) {
  return (
    <Suspense fallback={<GuardAuthenticatedLoading />}>
      <GuardAuthenticatedContent {...props} />
    </Suspense>
  );
}
