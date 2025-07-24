'use client';

import { ReactNode } from 'react';
import { Header } from '@/components/navigation/Header';
import { Sidebar } from '@/components/navigation/Sidebar';
import InstructorProtectedRoute from '@/components/InstructorProtectedRoute';

interface InstructorLayoutProps {
  children: ReactNode;
}

export default function InstructorLayout({ children }: InstructorLayoutProps) {
  return (
    <InstructorProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <Header title="Quizify - Instructor" />
        <div className="flex">
          <Sidebar />
          <main className="flex-1 ml-64 p-6 overflow-y-auto">
            {children}
          </main>
        </div>
      </div>
    </InstructorProtectedRoute>
  );
}