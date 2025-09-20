import { Suspense } from 'react';

import { StudentHomeClient } from '@/components/features/student/home/StudentHomeClient';

export default function StudentHomePage() {
  return (
    <Suspense>
      <StudentHomeClient />
    </Suspense>
  );
}
