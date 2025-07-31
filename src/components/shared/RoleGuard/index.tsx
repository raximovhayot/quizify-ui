'use client';

import { ReactNode, Suspense, useEffect } from 'react';

import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';

import { useNextAuth } from '@/components/features/auth/hooks/useNextAuth';
import { UserRole } from '@/components/features/profile/types/account';
import { PageLoading } from '@/components/ui/loading-spinner';

interface RoleGuardProps {
  children: ReactNode;
  requiredRole: UserRole;
  redirectPath: string;
  fallbackRoles?: { role: UserRole; redirectTo: string }[];
}

function RoleGuardContent({
  children,
  requiredRole,
  redirectPath,
  fallbackRoles = [],
}: RoleGuardProps) {
  const { hasRole, isAuthenticated } = useNextAuth();
  const router = useRouter();
  const t = useTranslations('common');

  useEffect(() => {
    if (!isAuthenticated) {
      // User is not authenticated, redirect to sign-in
      router.push(`/sign-in?redirect=${redirectPath}`);
      return;
    }

    if (!hasRole(requiredRole)) {
      // User doesn't have required role, check fallback roles
      for (const fallback of fallbackRoles) {
        if (hasRole(fallback.role)) {
          router.push(fallback.redirectTo);
          return;
        }
      }
      // No valid roles found, redirect to home
      router.push('/');
      return;
    }
  }, [
    isAuthenticated,
    hasRole,
    router,
    requiredRole,
    redirectPath,
    fallbackRoles,
  ]);

  if (!isAuthenticated || !hasRole(requiredRole)) {
    return <PageLoading text={t('redirecting')} />;
  }

  return children;
}

function RoleGuardLoading() {
  const t = useTranslations('common');
  return <PageLoading text={t('loading', { default: 'Loading...' })} />;
}

export default function RoleGuard(props: RoleGuardProps) {
  return (
    <Suspense fallback={<RoleGuardLoading />}>
      <RoleGuardContent {...props} />
    </Suspense>
  );
}
