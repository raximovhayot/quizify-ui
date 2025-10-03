import { Suspense } from 'react';

import { notFound } from 'next/navigation';

import {
  AssignmentDetail,
  AssignmentDetailSkeleton,
} from '@/components/features/student/attempt/components/AssignmentDetail';

// This would need to fetch assignment data
// For now, it's a placeholder that shows the structure
export default function AssignmentPage({
  params,
}: {
  params: { assignmentId: string };
}) {
  const assignmentId = Number(params.assignmentId);

  if (!Number.isFinite(assignmentId) || assignmentId <= 0) {
    return notFound();
  }

  // TODO: Fetch assignment data from API
  // For now, using mock data
  const mockAssignment = {
    id: assignmentId,
    title: 'Sample Assignment',
    description: 'This is a sample assignment description',
    startTime: new Date().toISOString(),
    endTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    maxAttempts: 3,
    timeLimit: 60,
    attemptsUsed: 0,
  };

  return (
    <Suspense fallback={<AssignmentDetailSkeleton />}>
      <AssignmentDetail
        assignmentId={assignmentId}
        assignment={mockAssignment}
      />
    </Suspense>
  );
}
