import React from 'react';

import { NextIntlClientProvider } from 'next-intl';
import { getLocale, getMessages } from 'next-intl/server';

import GuardAuthenticated from '@/features/auth/guards/GuardAuthenticated';
import { UserRole } from '@/features/profile/types/account';
import { StudentHeader } from '@/features/student/header/StudentHeader';
import { ClientProviders } from '@/components/shared/providers/ClientProviders';
import { env } from '@/env.mjs';

export default async function StudentLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <ClientProviders>
      <NextIntlClientProvider
        messages={messages}
        locale={locale}
        timeZone={env.NEXT_PUBLIC_DEFAULT_TIME_ZONE || 'UTC'}
      >
        <GuardAuthenticated
          requiredRoles={[UserRole.STUDENT]}
          fallbackRoles={[
            { role: UserRole.INSTRUCTOR, redirectTo: '/instructor' },
          ]}
        >
          <div className="min-h-screen bg-background">
            {/* Header/Navbar */}
            <StudentHeader />

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
