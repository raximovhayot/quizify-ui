'use client';

import {useNextAuth} from '@/hooks/useNextAuth';
import {UserRole} from '@/types/account';
import {useRouter} from 'next/navigation';
import {useEffect, ReactNode} from 'react';

interface StudentProtectedRouteProps {
    children: ReactNode;
}

export default function StudentProtectedRoute({children}: StudentProtectedRouteProps) {
    const {hasRole, isLoading, isAuthenticated} = useNextAuth();
    const router = useRouter();

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
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading...</p>
                </div>
            </div>
        );
    }

    if (!isAuthenticated || !hasRole(UserRole.STUDENT)) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Redirecting...</p>
                </div>
            </div>
        );
    }

    return (
        <>
            {children}
        </>
    );
}
