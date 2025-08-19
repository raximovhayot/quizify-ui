'use client';

import { ReactNode } from 'react';

import GuardAuthenticated from '@/components/features/auth/guards/GuardAuthenticated';
import { InstructorHeader } from '@/components/features/instructor/header/InstructorHeader';
import { UserRole } from '@/components/features/profile/types/account';

interface InstructorLayoutProps {
  children: ReactNode;
}

export default function InstructorLayout({
  children,
}: Readonly<InstructorLayoutProps>) {
  return (
    <GuardAuthenticated
      requiredRoles={[UserRole.INSTRUCTOR]}
      fallbackRoles={[{ role: UserRole.STUDENT, redirectTo: '/student' }]}
    >
      <div className="min-h-screen bg-background">
        {/* Header/Navbar */}
        <InstructorHeader />

        {/* Page Content */}
        <main className="flex-1 p-4 lg:p-6">
          <div className="mx-auto max-w-7xl">{children}</div>
        </main>
      </div>
    </GuardAuthenticated>
  );
}
