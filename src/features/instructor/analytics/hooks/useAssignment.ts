import { useQuery } from '@tanstack/react-query';

import { assignmentKeys } from '../keys';
import { AssignmentService } from '../services/assignmentService';
import { AssignmentDTO } from '../types/assignment';

/**
 * useAssignment — fetch single assignment details by id
 * Follows the same pattern as `useQuiz`.
 */
export function useAssignment(id: number) {
  return useQuery<AssignmentDTO>({
    queryKey: assignmentKeys.detail(id),
    queryFn: ({ signal }) => AssignmentService.getAssignment(id, signal),
    enabled: !!id,
    staleTime: 2 * 60 * 1000, // 2 minutes (details are relatively stable)
    gcTime: 20 * 60 * 1000, // 20 minutes
  });
}
