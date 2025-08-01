'use client';

import React, { ReactNode, useState } from 'react';
import { AbstractIntlMessages, NextIntlClientProvider } from 'next-intl';
import { QueryClient, QueryClientProvider, MutationCache } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { ThemeProvider } from 'next-themes';

import { SessionProvider } from '@/components/shared/providers/SessionProvider';
import ErrorBoundary from '@/components/providers/ErrorBoundary';
import { Toaster } from '@/components/ui/sonner';
import { env } from '@/env.mjs';

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
export function Providers({ children, messages, locale }: ProvidersProps) {
  const networkMode =
    env.NEXT_PUBLIC_NODE_ENV !== 'production' ? 'always' : undefined;

  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            networkMode,
          },
          mutations: {
            networkMode,
          },
        },
        mutationCache: new MutationCache({
          onError: (error) => {
            // Log errors in development
            if (env.NEXT_PUBLIC_NODE_ENV !== 'production') {
              console.error('Mutation error:', error);
            }
          },
        }),
      })
  );

  return (
    <SessionProvider>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <NextIntlClientProvider messages={messages} locale={locale}>
            <ErrorBoundary>
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