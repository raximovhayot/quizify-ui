'use client';

import { useEffect } from 'react';

import { useSession } from 'next-auth/react';

import { AuthService } from '@/components/features/auth/services/authService';
import { apiClient } from '@/lib/api';

/**
 * TokenSyncProvider — Why we need it and what it does
 *
 * Rationale:
 * - NextAuth stores access/refresh tokens in its session (React context),
 *   while our `apiClient` is a transport utility that lives outside of that context.
 * - Services/hooks should not deal with attaching headers or refresh logic; those
 *   concerns belong to the transport layer.
 *
 * Responsibilities:
 * - Keeps apiClient's bearer token in sync with the current NextAuth session
 * - Provides a single-flight refresh handler so apiClient can auto-refresh on 401
 *   and retry the original request once
 * - Centralizes token plumbing so features remain clean and transport-agnostic
 *
 * Notes:
 * - Mount this provider inside SessionProvider (see Providers.tsx) so it can
 *   read the session.
 * - NextAuth continues its own scheduled refresh via callbacks;
 *   this handler only updates apiClient immediately for in-flight requests.
 */
export function TokenSyncProvider() {
  const { data: session } = useSession();

  useEffect(() => {
    // Keep ApiClient's bearer token in sync
    apiClient.setAuthToken(session?.accessToken ?? null);

    // Provide a refresh handler for 401 auto-retry
    apiClient.setTokenRefreshHandler(async () => {
      const refreshToken = session?.refreshToken;
      if (!refreshToken) return null;
      try {
        const resp = await AuthService.refreshToken(refreshToken);
        const newAccess = resp?.data?.accessToken;
        if (newAccess) {
          // Update ApiClient immediately; NextAuth will refresh on its own schedule
          apiClient.setAuthToken(newAccess);
          return newAccess;
        }
      } catch (e) {
        // Swallow errors; caller will handle 401 failure
        console.error('Token refresh failed', e);
      }
      return null;
    });
  }, [session?.accessToken, session?.refreshToken]);

  return null;
}
