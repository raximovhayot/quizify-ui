import { keepPreviousData, useQuery } from '@tanstack/react-query';

import { assignmentKeys } from '../keys';
import { AssignmentService } from '../services/assignmentService';
import { InstructorAttemptFilter } from '../types/attempt';

/**
 * useAttempts — fetch pageable attempts for an assignment
 * Provides direct access to attempts without computing analytics
 */
export function useAttempts(
  assignmentId: number,
  filter: InstructorAttemptFilter = {}
) {
  return useQuery({
    queryKey: [...assignmentKeys.detail(assignmentId), 'attempts', filter],
    queryFn: ({ signal }) =>
      AssignmentService.getAttempts(assignmentId, filter, signal),
    enabled: !!assignmentId,
    placeholderData: keepPreviousData,
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 60 * 60 * 1000, // 60 minutes
  });
}
