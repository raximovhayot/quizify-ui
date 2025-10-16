import { ReactNode, Suspense } from 'react';
import { FullPageLoading } from '@/components/shared/ui/FullPageLoading';

import type { Metadata } from 'next';
import { NextIntlClientProvider } from 'next-intl';
import { getLocale, getMessages, getTranslations } from 'next-intl/server';

import { GuardPublicOnly } from '@/features/auth/guards';
import { AppPublicOnlyLayout } from '@/components/shared/layouts/AppLayout';
import { PublicClientProviders } from '@/components/shared/providers/PublicClientProviders';
import { env } from '@/env.mjs';

export const metadata: Metadata = {
  title: 'Quizify - Authentication',
  description: 'Quizify application - Authentication pages',
};

export default async function PublicOnlyLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  const locale = await getLocale();
  const messages = await getMessages();
  const t = await getTranslations('common');

  return (
    <Suspense fallback={<FullPageLoading text={t('loading', { default: 'Loading...' })} />}>
      <PublicClientProviders>
        <NextIntlClientProvider
          messages={messages}
          locale={locale}
          timeZone={env.NEXT_PUBLIC_DEFAULT_TIME_ZONE || 'UTC'}
        >
          <GuardPublicOnly>
            <AppPublicOnlyLayout>{children}</AppPublicOnlyLayout>
          </GuardPublicOnly>
        </NextIntlClientProvider>
      </PublicClientProviders>
    </Suspense>
  );
}
