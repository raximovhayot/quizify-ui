'use client';

import { useEffect } from 'react';

import { signOut, useSession } from 'next-auth/react';

import { ROUTES_AUTH } from '@/components/features/auth/routes';
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
        // If refresh itself failed with 401, redirect to login
        const isUnauthorized = Array.isArray(resp?.errors)
          ? resp.errors.some((err) => err.code === 'HTTP_401')
          : false;
        if (isUnauthorized && typeof window !== 'undefined') {
          // Clear any stale token to avoid further retries and invalidate NextAuth session
          apiClient.setAuthToken(null);
          try {
            // Ensure we fully sign the user out so middleware doesn't bounce them back
            await signOut({ redirect: true, callbackUrl: ROUTES_AUTH.login() });
          } catch {
            // Fallback: hard redirect to sign-in if signOut throws
            const loginPath = ROUTES_AUTH.login();
            const isAlreadyAtLogin =
              window.location.pathname.startsWith(loginPath);
            if (!isAlreadyAtLogin) {
              window.location.replace(loginPath);
            }
          }
          return null;
        }

        const newAccess = resp?.data?.accessToken;
        if (newAccess) {
          // Update ApiClient immediately; NextAuth will refresh on its own schedule
          apiClient.setAuthToken(newAccess);
          return newAccess;
        }
      } catch {
        // Swallow errors; caller will handle 401 failure
      }
      return null;
    });
  }, [session?.accessToken, session?.refreshToken]);

  return null;
}
