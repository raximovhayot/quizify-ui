import { Suspense } from 'react';

import { StudentHomeClient } from './student-home-client';

export default function StudentHomePage() {
  return (
    <Suspense>
      <StudentHomeClient />
    </Suspense>
  );
}
