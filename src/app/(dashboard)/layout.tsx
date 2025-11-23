import { ReactNode } from 'react';

import { NextIntlClientProvider } from 'next-intl';
import { getLocale, getMessages } from 'next-intl/server';

import GuardAuthenticated from '@/features/auth/guards/GuardAuthenticated';
import { DashboardHeader } from '@/features/header/DashboardHeader';
import { ClientProviders } from '@/components/shared/providers/ClientProviders';
import { env } from '@/env.mjs';

interface DashboardLayoutProps {
  children: ReactNode;
}

export default async function DashboardLayout({
  children,
}: Readonly<DashboardLayoutProps>) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <ClientProviders>
      <NextIntlClientProvider
        messages={messages}
        locale={locale}
        timeZone={env.NEXT_PUBLIC_DEFAULT_TIME_ZONE || 'UTC'}
      >
        <GuardAuthenticated>
          <div className="min-h-screen bg-background">
            {/* Header/Navbar */}
            <DashboardHeader />

            {/* Page Content */}
            <main className="flex-1 p-4 lg:p-6">
              <div className="mx-auto max-w-7xl">{children}</div>
            </main>
          </div>
        </GuardAuthenticated>
      </NextIntlClientProvider>
    </ClientProviders>
  );
}
