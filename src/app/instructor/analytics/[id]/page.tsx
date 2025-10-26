'use client';

import { useParams } from 'next/navigation';

import { AssignmentViewPage } from '@/features/instructor/analytics/components/AssignmentViewPage';

export default function AssignmentAnalyticsPage() {
  const params = useParams();
  const assignmentId = Number(params?.id);

  if (Number.isNaN(assignmentId)) {
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold text-destructive">
          Invalid Assignment ID
        </h1>
        <p className="text-muted-foreground">
          The assignment ID provided is not valid.
        </p>
      </div>
    );
  }

  return <AssignmentViewPage assignmentId={assignmentId} />;
}

