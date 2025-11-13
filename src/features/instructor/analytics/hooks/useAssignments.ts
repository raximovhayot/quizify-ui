import { useAssignments as useAssignmentsBase } from '@/lib/api/hooks/assignments';
import type { AssignmentListParams } from '@/lib/api/endpoints/assignments';
import { AssignmentFilter } from '../types/assignment';

/**
 * useAssignments — fetch paginated assignments list (instructor analytics)
 * Delegates to centralized hook
 */
export function useAssignments(filter: AssignmentFilter = {}) {
  // Map filter to params
  const params: AssignmentListParams = {
    page: filter.page,
    size: filter.size,
    status: filter.status,
  };
  
  return useAssignmentsBase(params);
}
