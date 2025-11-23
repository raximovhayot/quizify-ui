'use client';

import { ReactNode } from 'react';

import { SessionProvider as NextAuthSessionProvider } from 'next-auth/react';

interface SessionProviderProps {
  children: ReactNode;
}

/**
 * NextAuth SessionProvider wrapper component
 * Provides session context to the entire application
 */
export function SessionProvider({ children }: SessionProviderProps) {
  return <NextAuthSessionProvider>{children}</NextAuthSessionProvider>;
}
