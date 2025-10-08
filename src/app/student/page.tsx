import { Suspense } from 'react';

import { StudentHomePage } from '@/components/features/student/home/StudentHomePage';

export default function Page() {
  return (
    <Suspense>
      <StudentHomePage />
    </Suspense>
  );
}
