'use client';

import { ReactNode } from 'react';

import InstructorGuard from '@/components/shared/InstructorGuard';

interface InstructorLayoutProps {
  children: ReactNode;
}

export default function InstructorLayout({ children }: InstructorLayoutProps) {
  return (
    <InstructorGuard>
      <div className="min-h-screen bg-gray-50 flex">
        <main className="flex-1 ml-64 p-6 overflow-y-auto">{children}</main>
      </div>
    </InstructorGuard>
  );
}
