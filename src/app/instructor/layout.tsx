import { ReactNode } from 'react';

import { NextIntlClientProvider } from 'next-intl';
import { getLocale, getMessages } from 'next-intl/server';

import GuardAuthenticated from '@/features/auth/guards/GuardAuthenticated';
import { InstructorHeader } from '@/features/instructor/header/InstructorHeader';
import { UserRole } from '@/features/profile/types/account';
import { ClientProviders } from '@/components/shared/providers/ClientProviders';
import { env } from '@/env.mjs';

interface InstructorLayoutProps {
  children: ReactNode;
}

export default async function InstructorLayout({
  children,
}: Readonly<InstructorLayoutProps>) {
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
          requiredRoles={[UserRole.INSTRUCTOR]}
          fallbackRoles={[{ role: UserRole.STUDENT, redirectTo: '/student' }]}
        >
          <div className="min-h-screen bg-background">
            {/* Header/Navbar */}
            <InstructorHeader />

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
