import { useQuery } from '@tanstack/react-query';

import { IPageableList } from '@/types/common';

import { assignmentKeys } from '../keys';
import { AssignmentService } from '../services/assignmentService';
import { AssignmentDTO, AssignmentFilter } from '../types/assignment';

/**
 * useAssignments — fetch paginated assignments list (instructor analytics)
 */
export function useAssignments(filter: AssignmentFilter = {}) {
  return useQuery<IPageableList<AssignmentDTO>>({
    queryKey: assignmentKeys.list(filter),
    queryFn: ({ signal }) => AssignmentService.getAssignments(filter, signal),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}
