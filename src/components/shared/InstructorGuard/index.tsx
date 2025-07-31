'use client';

import { ReactNode } from 'react';

import { UserRole } from '@/components/features/profile/types/account';
import RoleGuard from '@/components/shared/RoleGuard';

interface InstructorGuardProps {
  children: ReactNode;
}

export default function InstructorGuard({ children }: InstructorGuardProps) {
  return (
    <RoleGuard
      requiredRole={UserRole.INSTRUCTOR}
      redirectPath="/instructor"
      fallbackRoles={[{ role: UserRole.STUDENT, redirectTo: '/student' }]}
    >
      {children}
    </RoleGuard>
  );
}
