import type {Metadata} from 'next';
import {ReactNode, Suspense} from 'react';
import {GuardPublicOnly} from "@/components/features/auth/guards";
import {AppPublicOnlyLayout} from '@/components/shared/layouts/AppLayout';

export const metadata: Metadata = {
    title: 'Quizify - Authentication',
    description: 'Quizify application - Authentication pages',
};

export default function PublicOnlyLayout({children}: Readonly<{ children: ReactNode }>) {
    return <Suspense>
        <GuardPublicOnly>
            <AppPublicOnlyLayout>
                {children}
            </AppPublicOnlyLayout>
        </GuardPublicOnly>
    </Suspense>;
}