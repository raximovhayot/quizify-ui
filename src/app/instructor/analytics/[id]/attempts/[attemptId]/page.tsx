'use client';

import { useParams } from 'next/navigation';

import { AttemptDetailPage } from '@/features/instructor/analytics/components/AttemptDetailPage';

export default function Page() {
  const params = useParams();
  const assignmentId = Number(params?.id);
  const attemptId = Number(params?.attemptId);

  if (Number.isNaN(assignmentId) || Number.isNaN(attemptId)) {
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold text-destructive">
          Invalid Parameters
        </h1>
        <p className="text-muted-foreground">
          The assignment or attempt ID provided is not valid.
        </p>
      </div>
    );
  }

  return <AttemptDetailPage assignmentId={assignmentId} attemptId={attemptId} />;
}
