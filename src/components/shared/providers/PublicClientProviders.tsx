'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import React, { ReactNode, useState } from 'react';

import { ThemeProvider } from 'next-themes';

import { SessionProvider } from '@/components/shared/providers/SessionProvider';
import { TopLoader } from '@/components/shared/ui/TopLoader';
import { Toaster } from '@/components/ui/sonner';

interface PublicClientProvidersProps {
  children: ReactNode;
}

/**
 * Minimal client providers used only for public-only routes
 * to preserve UX (theme, toasts, auth guard) without heavy client state.
 */
export function PublicClientProviders({
  children,
}: Readonly<PublicClientProvidersProps>) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <SessionProvider>
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
      </QueryClientProvider>
    </SessionProvider>
  );
}
