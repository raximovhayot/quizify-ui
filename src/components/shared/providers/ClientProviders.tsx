'use client';

import {
  MutationCache,
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

import React, { ReactNode, useState } from 'react';

import { ThemeProvider } from 'next-themes';

import { SessionProvider } from '@/components/shared/providers/SessionProvider';
import { TokenSyncProvider } from '@/components/shared/providers/TokenSyncProvider';
import { TopLoader } from '@/components/shared/ui/TopLoader';
import { Toaster } from '@/components/ui/sonner';
import { env } from '@/env.mjs';
import { BackendError } from '@/types/api';

interface ClientProvidersProps {
  children: ReactNode;
}

/**
 * Lightweight client-only providers used in authenticated areas to avoid
 * turning the entire app into a client subtree. Keep the root layout fully server.
 */
export function ClientProviders({ children }: Readonly<ClientProvidersProps>) {
  const networkMode =
    env.NEXT_PUBLIC_NODE_ENV !== 'production' ? 'always' : undefined;

  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            networkMode,
            retry: (failureCount, error) => {
              if (error instanceof BackendError) {
                if (error.errors?.some((e) => /^HTTP_4\d{2}$/.test(e.code))) {
                  return false;
                }
              }
              return failureCount < 2;
            },
            retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 8000),
            staleTime: 2 * 60_000,
            gcTime: 10 * 60_000,
            refetchOnWindowFocus: false,
            refetchOnReconnect: 'always',
            refetchOnMount: 'always',
            refetchInterval: (query) => {
              if (query?.queryKey[0] === 'notifications') return 5 * 60_000;
              if (
                query?.queryKey[0] === 'quizzes' &&
                query?.queryKey[1] === 'live'
              )
                return 2 * 60_000;
              return false;
            },
          },
          mutations: {
            networkMode,
            retry: (failureCount, error) => {
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
          onError: () => {},
          onSuccess: () => {},
        }),
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
          <TopLoader />
          {children}
          <Toaster />
        </ThemeProvider>
        {env.NEXT_PUBLIC_NODE_ENV !== 'production' && (
          <ReactQueryDevtools initialIsOpen={false} />
        )}
      </QueryClientProvider>
    </SessionProvider>
  );
}
