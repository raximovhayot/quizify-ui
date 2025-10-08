'use client';

import { Suspense } from 'react';
import dynamic from 'next/dynamic';

import { LoadingSpinner } from '@/components/ui/loading-spinner';

const StudentHomePage = dynamic(
  () =>
    import('@/components/features/student/home/StudentHomePage').then(
      mod => mod.StudentHomePage,
    ),
  {
    loading: () => <LoadingSpinner />,
    ssr: false,
  },
);

export function StudentHomePageLoader() {
  return (
    <Suspense>
      <StudentHomePage />
    </Suspense>
  );
}
