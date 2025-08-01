import type {Metadata} from 'next';
import {getLocale, getMessages} from 'next-intl/server';
import {Geist, Geist_Mono} from 'next/font/google';

import {Providers} from '@/components/providers/Providers';

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
