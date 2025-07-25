'use client';

import { ReactNode } from 'react';
import { Sidebar } from '@/components/shared/navigation/Sidebar';
import InstructorProtectedRoute from '@/components/shared/InstructorProtectedRoute';

interface InstructorLayoutProps {
  children: ReactNode;
}

export default function InstructorLayout({ children }: InstructorLayoutProps) {
  return (
    <InstructorProtectedRoute>
      <div className="min-h-screen bg-gray-50 flex">
        <Sidebar noHeader={true} />
        <main className="flex-1 ml-64 p-6 overflow-y-auto">
          {children}
        </main>
      </div>
    </InstructorProtectedRoute>
  );
}