import { Suspense } from 'react';

import { notFound } from 'next/navigation';

import { AttemptResults } from '@/components/features/student/attempt/components/AttemptResults';
import { Skeleton } from '@/components/ui/skeleton';

export default function ResultsPage({
  params,
}: {
  params: { assignmentId: string; attemptId: string };
}) {
  const assignmentId = Number(params.assignmentId);
  const attemptId = Number(params.attemptId);

  if (
    !Number.isFinite(assignmentId) ||
    assignmentId <= 0 ||
    !Number.isFinite(attemptId) ||
    attemptId <= 0
  ) {
    return notFound();
  }

  return (
    <Suspense fallback={<ResultsSkeleton />}>
      <AttemptResults assignmentId={assignmentId} attemptId={attemptId} />
    </Suspense>
  );
}

function ResultsSkeleton() {
  return (
    <div className="container max-w-4xl mx-auto py-8 space-y-6">
      <Skeleton className="h-96 w-full" />
    </div>
  );
}
