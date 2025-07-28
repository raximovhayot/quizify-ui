'use client';

import {useNextAuth} from '@/components/features/auth/hooks/useNextAuth';
import {UserRole} from '@/components/features/profile/types/account';
import {useRouter} from 'next/navigation';
import {useEffect, ReactNode} from 'react';
import {PageLoading} from "@/components/ui/loading-spinner";
import {useTranslations} from "next-intl";

interface InstructorProtectedRouteProps {
    children: ReactNode;
}

export default function InstructorProtectedRoute({children}: InstructorProtectedRouteProps) {
    const {hasRole, isLoading, isAuthenticated} = useNextAuth();
    const router = useRouter();
    const t = useTranslations('common');

    useEffect(() => {
        if (!isLoading) {
            if (!isAuthenticated) {
                // User is not authenticated, redirect to sign-in
                router.push('/sign-in?redirect=/instructor');
                return;
            }

            if (!hasRole(UserRole.INSTRUCTOR)) {
                // User doesn't have instructor role
                if (hasRole(UserRole.STUDENT)) {
                    // User has student role, redirect to student dashboard
                    router.push('/student');
                } else {
                    // User has no valid roles, redirect to home
                    router.push('/');
                }
                return;
            }
        }
    }, [isAuthenticated, hasRole, isLoading, router]);

    if (isLoading) {
        return <PageLoading text={t('loading', { default: 'Loading...' })} />;
    }

    if (!isAuthenticated || !hasRole(UserRole.INSTRUCTOR)) {
        return <PageLoading text={t('redirecting')} />;
    }

    return (
        <>
            {children}
        </>
    );
}
