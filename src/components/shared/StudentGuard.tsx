'use client';

import {useNextAuth} from '@/components/features/auth/hooks/useNextAuth';
import {UserRole} from '@/components/features/profile/types/account';
import {useRouter} from 'next/navigation';
import {useEffect, ReactNode} from 'react';
import {PageLoading} from "@/components/ui/loading-spinner";
import {useTranslations} from "next-intl";

interface StudentProtectedRouteProps {
    children: ReactNode;
}

export default function StudentGuard({children}: StudentProtectedRouteProps) {
    const {hasRole, isLoading, isAuthenticated} = useNextAuth();
    const router = useRouter();
    const t = useTranslations('common');

    useEffect(() => {
        if (!isLoading) {
            if (!isAuthenticated) {
                // User is not authenticated, redirect to sign-in
                router.push('/sign-in?redirect=/student');
                return;
            }

            if (!hasRole(UserRole.STUDENT)) {
                // User doesn't have student role
                if (hasRole(UserRole.INSTRUCTOR)) {
                    // User has instructor role, redirect to instructor dashboard
                    router.push('/instructor');
                } else {
                    // User has no valid roles, redirect to home
                    router.push('/');
                }
                return;
            }
        }
    }, [isAuthenticated, hasRole, isLoading, router]);

    if (isLoading) {
        return <PageLoading text={t('loading', {default: 'Loading...'})}/>;
    }

    if (!isAuthenticated || !hasRole(UserRole.STUDENT)) {
        return <PageLoading text={t('redirecting')}/>;
    }

    return children;
}
