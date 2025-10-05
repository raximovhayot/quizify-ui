'use client';

/**
 * DEPRECATED FILE — src/components/shared/providers/Providers.tsx
 * Do not import this file. Mounting a client provider at the root turns the entire app into a client subtree, blocking RSC streaming and built-in caching.
 * Use route-group-scoped ClientProviders (authed areas) or PublicClientProviders (public-only routes) instead.
 */

import {
  MutationCache,
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

import React, { ReactNode, useState, useEffect } from 'react';

import { AbstractIntlMessages, NextIntlClientProvider } from 'next-intl';
import { ThemeProvider } from 'next-themes';

import { SessionProvider } from '@/components/shared/providers/SessionProvider';
import { TokenSyncProvider } from '@/components/shared/providers/TokenSyncProvider';
import { TopLoader } from '@/components/shared/ui/TopLoader';
import { Toaster } from '@/components/ui/sonner';
import { env } from '@/env.mjs';
import { BackendError } from '@/types/api';

import { ErrorBoundary } from './ErrorBoundary';

interface ProvidersProps {
  children: ReactNode;
  messages: AbstractIntlMessages;
  locale: string;
}

/**
 * Unified Provider component that wraps all application providers.
 * Inspired by StartUI's provider pattern for clean organization.
 *
 * Provider hierarchy (outermost to innermost):
 * 1. ErrorBoundary - Catches and handles React errors
 * 2. SessionProvider - NextAuth authentication context
 * 3. QueryClientProvider - TanStack Query for API state management
 * 4. ThemeProvider - next-themes for dark/light mode
 * 5. NextIntlClientProvider - Internationalization with messages
 * 6. Toaster - Global toast notifications (rendered as sibling to children)
 */
/**
 * DEPRECATED: Do not import this root-level Providers component. It creates a client boundary at the app root and disables RSC streaming.
 * @deprecated Use ClientProviders (authed) or PublicClientProviders (public) inside route-group layouts.
 */
export function Providers({ children, messages, locale }: ProvidersProps) {
  // Development guard: loudly warn when this component is ever mounted.
  useEffect(() => {
    if (env.NEXT_PUBLIC_NODE_ENV !== 'production') {
      // eslint-disable-next-line no-console
      console.error('[DEPRECATED] Providers.tsx is deprecated. Use route-group-scoped ClientProviders/PublicClientProviders.');
    }
  }, []);
  const networkMode =
    env.NEXT_PUBLIC_NODE_ENV !== 'production' ? 'always' : undefined;

  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            networkMode,
            retry: (failureCount, error) => {
              // Do not retry on 4xx backend errors
              if (error instanceof BackendError) {
                if (error.errors?.some((e) => /^HTTP_4\d{2}$/.test(e.code))) {
                  return false;
                }
              }
              // Retry up to 2 times for network/timeouts/5xx
              return failureCount < 2;
            },
            retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 8000),
            staleTime: 2 * 60_000, // 2 minutes (optimized)
            gcTime: 10 * 60_000, // 10 minutes
            refetchOnWindowFocus: false, // Prevent aggressive refetching
            refetchOnReconnect: 'always', // Always refetch on reconnect
            refetchOnMount: 'always', // Always refetch on mount
            // Background refetch interval for important data
            refetchInterval: (query) => {
              // Only auto-refresh for specific query types
              if (query?.queryKey[0] === 'notifications') {
                return 5 * 60_000; // 5 minutes for notifications
              }
              if (
                query?.queryKey[0] === 'quizzes' &&
                query?.queryKey[1] === 'live'
              ) {
                return 2 * 60_000; // 2 minutes for live quizzes
              }
              return false; // No auto-refresh for other queries
            },
          },
          mutations: {
            networkMode,
            retry: (failureCount, error) => {
              // Retry idempotent mutations (GET-like operations)
              if (error instanceof BackendError) {
                const hasServerError = error.errors?.some((e) =>
                  /^HTTP_5\d{2}$/.test(e.code)
                );
                return hasServerError && failureCount < 1;
              }
              return false;
            },
            retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 5000),
          },
        },
        mutationCache: new MutationCache({
          onError: (_error) => {},
          onSuccess: (_data, _variables, _context, _mutation) => {},
        }),
        // Note: Query cache configuration is handled by QueryClient constructor
      })
  );

  return (
    <SessionProvider>
      <TokenSyncProvider />
      <QueryClientProvider client={queryClient}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <NextIntlClientProvider
            messages={messages}
            locale={locale}
            timeZone={env.NEXT_PUBLIC_DEFAULT_TIME_ZONE || 'UTC'}
          >
            <ErrorBoundary>
              <TopLoader />
              {children}
              <Toaster />
            </ErrorBoundary>
          </NextIntlClientProvider>
        </ThemeProvider>
        {env.NEXT_PUBLIC_NODE_ENV !== 'production' && (
          <ReactQueryDevtools initialIsOpen={false} />
        )}
      </QueryClientProvider>
    </SessionProvider>
  );
}
