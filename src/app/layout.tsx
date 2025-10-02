import type { Metadata, Viewport } from 'next';
import { getLocale, getMessages } from 'next-intl/server';

import { Providers } from '@/components/shared/providers/Providers';

import './globals.css';

export const metadata: Metadata = {
  title: 'Quizify',
  description: 'Learning Management System with role-based access control',
};

export const viewport: Viewport = {
  themeColor: '#0f172a',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

// Force dynamic rendering so next-intl's server APIs (getLocale/getMessages)
// have a valid request context during 404 and other prerendered pages.
export const dynamic = 'force-dynamic';

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Get both locale and messages from next-intl
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <>
      <html lang={locale} suppressHydrationWarning>
        <body className="antialiased">
          <Providers messages={messages} locale={locale}>
            {children}
          </Providers>
        </body>
      </html>
    </>
  );
}
