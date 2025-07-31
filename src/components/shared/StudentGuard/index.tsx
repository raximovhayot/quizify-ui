'use client';

import { ReactNode } from 'react';

import { UserRole } from '@/components/features/profile/types/account';
import RoleGuard from '@/components/shared/RoleGuard';

interface StudentGuardProps {
  children: ReactNode;
}

export default function StudentGuard({ children }: StudentGuardProps) {
  return (
    <RoleGuard
      requiredRole={UserRole.STUDENT}
      redirectPath="/student"
      fallbackRoles={[{ role: UserRole.INSTRUCTOR, redirectTo: '/instructor' }]}
    >
      {children}
    </RoleGuard>
  );
}
