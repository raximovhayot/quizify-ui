import { Suspense } from 'react';

import { StudentHomePage } from '@/components/features/student/home/StudentHomePage';

export default function StudentHomePage() {
  return (
    <Suspense>
      <StudentHomePage />
    </Suspense>
  );
}
