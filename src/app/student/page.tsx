import { Suspense } from 'react';

import { StudentHomeContainer } from '@/components/features/student/home/StudentHomeContainer';

export default function StudentHomePage() {
  return (
    <Suspense>
      <StudentHomeContainer />
    </Suspense>
  );
}
