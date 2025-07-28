'use client';

import { useNextAuth } from '@/components/features/auth/hooks/useNextAuth';
import { UserRole } from '@/components/features/profile/types/account';
import { useRouter } from 'next/navigation';
import { useEffect, ReactNode } from 'react';
import { PageLoading } from "@/components/ui/loading-spinner";
import { useTranslations } from "next-intl";

interface RoleGuardProps {
    children: ReactNode;
    requiredRole: UserRole;
    redirectPath: string;
    fallbackRoles?: { role: UserRole; redirectTo: string }[];
}

export default function RoleGuard({ 
    children, 
    requiredRole, 
    redirectPath, 
    fallbackRoles = [] 
}: RoleGuardProps) {
    const { hasRole, isLoading, isAuthenticated } = useNextAuth();
    const router = useRouter();
    const t = useTranslations('common');

    useEffect(() => {
        if (!isLoading) {
            if (!isAuthenticated) {
                // User is not authenticated, redirect to sign-in
                router.push(`/sign-in?redirect=${redirectPath}`);
                return;
            }

            if (!hasRole(requiredRole)) {
                // User doesn't have required role, check fallback roles
                for (const fallback of fallbackRoles) {
                    if (hasRole(fallback.role)) {
                        router.push(fallback.redirectTo);
                        return;
                    }
                }
                // No valid roles found, redirect to home
                router.push('/');
                return;
            }
        }
    }, [isAuthenticated, hasRole, isLoading, router, requiredRole, redirectPath, fallbackRoles]);

    if (isLoading) {
        return <PageLoading text={t('loading', { default: 'Loading...' })} />;
    }

    if (!isAuthenticated || !hasRole(requiredRole)) {
        return <PageLoading text={t('redirecting')} />;
    }

    return children;
}