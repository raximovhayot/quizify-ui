'use client';

import { ReactNode, useEffect } from 'react';

import { useTranslations } from 'next-intl';
import { useRouter, useSearchParams } from 'next/navigation';

import { useNextAuth } from '@/features/auth/hooks/useNextAuth';
import { FullPageLoading } from '@/components/shared/ui/FullPageLoading';
import { Spinner } from '@/components/ui/spinner';
import { ROUTES_APP } from '@/features/routes';

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
}: Readonly<GuardPublicOnlyProps>) {
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

      // Default redirect - all authenticated users go to unified dashboard root
      router.replace(ROUTES_APP.root());
    }
  }, [isAuthenticated, user, searchParams, router, redirectPath]);

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <FullPageLoading text={t('loading', { default: 'Loading...' })} />
    );
  }

  // Show loading while redirecting authenticated users
  if (isAuthenticated) {
    return (
      <div className="min-h-[40vh] flex items-center justify-center">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Spinner className="size-5" />
          {t('redirecting')}
        </div>
      </div>
    );
  }

  // User is not authenticated, show the protected content
  return <>{children}</>;
}
