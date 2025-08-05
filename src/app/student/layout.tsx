'use client';

import { ReactNode } from 'react';

import GuardAuthenticated from '@/components/features/auth/guards/GuardAuthenticated';
import { UserRole } from '@/components/features/profile/types/account';

interface StudentLayoutProps {
  children: ReactNode;
}

export default function StudentLayout({ children }: StudentLayoutProps) {
  return (
    <GuardAuthenticated
      requiredRoles={[UserRole.STUDENT]}
      fallbackRoles={[{ role: UserRole.INSTRUCTOR, redirectTo: '/instructor' }]}
    >
      <div className="min-h-screen bg-background">
        {/* Page Content */}
        <main className="flex-1 p-4 lg:p-6">
          <div className="mx-auto max-w-7xl">{children}</div>
        </main>
      </div>
    </GuardAuthenticated>
  );
}
