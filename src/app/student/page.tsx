import { Suspense } from 'react';

import { StudentHomePage } from '@/components/features/student/home/StudentHomePage';
import { FullPageLoading } from '@/components/shared/ui/FullPageLoading';

export default function Page() {
  return (
    <Suspense fallback={<FullPageLoading />}>
      <StudentHomePage />
    </Suspense>
  );
}
