import { useAssignmentAttempts } from '@/lib/api/hooks/attempts';
import type { AttemptListParams } from '@/lib/api/endpoints/attempts';
import { InstructorAttemptFilter } from '../types/attempt';

/**
 * useAttempts — fetch pageable attempts for an assignment
 * Delegates to centralized hook
 */
export function useAttempts(
  assignmentId: number,
  filter: InstructorAttemptFilter = {}
) {
  // Map filter to params
  const params: AttemptListParams = {
    page: filter.page,
    size: filter.size,
  };
  
  return useAssignmentAttempts(assignmentId, params, !!assignmentId);
}
