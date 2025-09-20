'use client';

import { useEffect } from 'react';

import { useSession } from 'next-auth/react';

import { apiClient } from '@/lib/api';

/**
 * Keeps ApiClient auth token in sync with NextAuth session
 */
export function TokenSyncProvider() {
  const { data: session } = useSession();

  useEffect(() => {
    apiClient.setAuthToken(session?.accessToken ?? null);
  }, [session?.accessToken]);

  return null;
}
