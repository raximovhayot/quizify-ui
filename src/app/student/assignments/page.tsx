import { Suspense } from 'react';

import { JoinAssignmentCard } from '@/components/features/student/assignment/components/JoinAssignmentCard';
import { RegistrationList } from '@/components/features/student/assignment/components/RegistrationList';
import { Skeleton } from '@/components/ui/skeleton';

export default function AssignmentsPage() {
  return (
    <div className="container max-w-6xl mx-auto py-8 space-y-8">
      {/* Join assignment card */}
      <Suspense fallback={<Skeleton className="h-48 w-full" />}>
        <JoinAssignmentCard />
      </Suspense>

      {/* List of registered assignments */}
      <Suspense fallback={<AssignmentsSkeleton />}>
        <RegistrationList />
      </Suspense>
    </div>
  );
}

function AssignmentsSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-8 w-48" />
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-48 w-full" />
        ))}
      </div>
    </div>
  );
}
