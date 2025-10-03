import { Suspense } from 'react';

import { notFound } from 'next/navigation';

import { QuizTaking } from '@/components/features/student/attempt';
import { Skeleton } from '@/components/ui/skeleton';

export default function AttemptPage({
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
    <Suspense fallback={<AttemptSkeleton />}>
      <QuizTaking assignmentId={assignmentId} attemptId={attemptId} />
    </Suspense>
  );
}

function AttemptSkeleton() {
  return (
    <div className="container max-w-5xl mx-auto py-8 space-y-6">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-10 w-32" />
      </div>
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-96 w-full" />
      <Skeleton className="h-24 w-full" />
    </div>
  );
}
