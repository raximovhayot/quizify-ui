'use client';

import { ReactNode } from 'react';

import GuardAuthenticated from '@/components/shared/GuardAuthenticated';
import { UserRole } from '@/components/features/profile/types/account';

interface InstructorLayoutProps {
  children: ReactNode;
}

export default function InstructorLayout({ children }: InstructorLayoutProps) {
  return (
    <GuardAuthenticated
      requiredRoles={[UserRole.INSTRUCTOR]}
      fallbackRoles={[{ role: UserRole.STUDENT, redirectTo: '/student' }]}
    >
      <div className="min-h-screen bg-gray-50 flex">
        <main className="flex-1 ml-64 p-6 overflow-y-auto">{children}</main>
      </div>
    </GuardAuthenticated>
  );
}
