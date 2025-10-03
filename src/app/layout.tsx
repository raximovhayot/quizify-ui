import type { Metadata, Viewport } from 'next';
import { getLocale, getMessages } from 'next-intl/server';
import { Geist, Geist_Mono } from 'next/font/google';

import { Providers } from '@/components/shared/providers/Providers';

import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Quizify',
  description: 'Learning Management System with role-based access control',
};

export const viewport: Viewport = {
  themeColor: '#0f172a',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
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
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
          <Providers messages={messages} locale={locale}>
            {children}
          </Providers>
        </body>
      </html>
    </>
  );
}
