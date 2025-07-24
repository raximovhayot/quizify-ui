'use client';

import {useNextAuth} from '@/hooks/useNextAuth';
import {UserRole} from '@/types/auth';
import {useRouter} from 'next/navigation';
import {useEffect, ReactNode} from 'react';

interface InstructorProtectedRouteProps {
    children: ReactNode;
}

export default function InstructorProtectedRoute({children}: InstructorProtectedRouteProps) {
    const {hasRole, isLoading, isAuthenticated} = useNextAuth();
    const router = useRouter();

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
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading...</p>
                </div>
            </div>
        );
    }

    if (!isAuthenticated || !hasRole(UserRole.INSTRUCTOR)) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
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
