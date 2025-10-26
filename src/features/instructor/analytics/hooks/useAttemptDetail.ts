import { useQuery } from '@tanstack/react-query';

import { assignmentKeys } from '../keys';
import { AssignmentService } from '../services/assignmentService';
import { InstructorAttemptDetail } from '../types/attempt';

/**
 * useAttemptDetail — fetch detailed attempt information
 * Provides complete attempt data including question results
 */
export function useAttemptDetail(assignmentId: number, attemptId: number) {
  return useQuery<InstructorAttemptDetail>({
    queryKey: [...assignmentKeys.detail(assignmentId), 'attempts', attemptId],
    queryFn: ({ signal }) =>
      AssignmentService.getAttemptDetail(assignmentId, attemptId, signal),
    enabled: !!assignmentId && !!attemptId,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    structuralSharing: true,
  });
}
