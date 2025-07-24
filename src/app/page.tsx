'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useNextAuth } from '@/hooks/useNextAuth';
import { UserRole, UserState } from '@/types/auth';

export default function RootPage() {
  const { user, isAuthenticated, isLoading, hasRole, isNewUser } = useNextAuth();
  const router = useRouter();

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
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Show redirecting state (this should be brief as useEffect will handle the redirect)
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Redirecting...</p>
      </div>
    </div>
  );
}