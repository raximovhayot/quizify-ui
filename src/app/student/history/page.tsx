import { Suspense } from 'react';

import { StudentHistoryClient } from './student-history-client';

export default function StudentHistoryPage() {
  return (
    <Suspense>
      <StudentHistoryClient />
    </Suspense>
  );
}
