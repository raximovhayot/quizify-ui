import type { Metadata } from 'next';
import { getLocale, getMessages } from 'next-intl/server';
import { Geist, Geist_Mono } from 'next/font/google';

import { Providers } from '@/app/Providers';

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
      {/* 
        suppressHydrationWarning is required for next-themes to prevent hydration mismatches.
        next-themes applies theme classes (e.g., "light", "dark") and styles to the html element
        on the client side, but the server doesn't know the user's theme preference.
        This causes a hydration mismatch where:
        - Server renders: <html lang="en">
        - Client expects: <html lang="en" className="light" style={{colorScheme:"light"}}>
        
        suppressHydrationWarning tells React to ignore this specific mismatch, which is safe
        because next-themes handles theme application correctly on the client side.
        
        This is the standard solution recommended by next-themes documentation.
        See: https://github.com/pacocoursey/next-themes#with-app
      */}
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
